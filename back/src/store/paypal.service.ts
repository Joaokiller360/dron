import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const API_BASE = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com',
};

export interface PaypalItem {
  name: string;
  unitCents: number;
  quantity: number;
}

/** The part of a PayPal capture we check before trusting a payment */
export interface PaypalCapture {
  id: string;
  status: string; // COMPLETED | PENDING | DECLINED | REFUNDED | ...
  amount?: { currency_code: string; value: string };
  custom_id?: string;
}

export interface PaypalOrder {
  id: string;
  status: string; // CREATED | APPROVED | COMPLETED | VOIDED | ...
  purchase_units?: { custom_id?: string; payments?: { captures?: PaypalCapture[] } }[];
}

export class PaypalError extends Error {
  constructor(
    message: string,
    public status: number,
    public issue?: string,
  ) {
    super(message);
  }
}

const toValue = (cents: number) => (cents / 100).toFixed(2);

/** Thin client for PayPal's REST API (Orders v2, Payments v2, webhook verification) */
@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private token: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  get configured() {
    return !!(this.config.get('paypal.clientId') && this.config.get('paypal.clientSecret'));
  }

  get mode(): 'sandbox' | 'live' {
    return this.config.get('paypal.mode') === 'live' ? 'live' : 'sandbox';
  }

  /** Public client id for the browser SDK */
  get clientId(): string | null {
    return this.configured ? (this.config.get<string>('paypal.clientId') ?? null) : null;
  }

  get webhookConfigured() {
    return !!this.config.get('paypal.webhookId');
  }

  /** Live check: asks PayPal for a fresh access token with the configured credentials */
  async checkConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.configured) {
      return {
        connected: false,
        message: 'Faltan PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET en la API',
      };
    }
    const started = Date.now();
    try {
      this.token = null;
      await this.accessToken();
      return {
        connected: true,
        message: 'Credenciales aceptadas por PayPal',
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      const status = err instanceof PaypalError ? err.status : 0;
      return {
        connected: false,
        message:
          status === 401
            ? 'PayPal rechazó las credenciales (revisa el client id/secret y el modo sandbox/live)'
            : `No se pudo contactar con PayPal${status ? ` (${status})` : ''}`,
      };
    }
  }

  /** Creates the PayPal order the buyer approves; amounts must add up exactly */
  async createOrder(opts: {
    orderId: string;
    code: string;
    items: PaypalItem[];
    totalCents: number;
  }): Promise<PaypalOrder> {
    return this.request<PaypalOrder>('POST', '/v2/checkout/orders', {
      requestId: `create-${opts.orderId}`,
      body: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: opts.code,
            custom_id: opts.orderId,
            invoice_id: opts.code,
            description: `JB.SKYLENS ${opts.code}`,
            amount: {
              currency_code: 'USD',
              value: toValue(opts.totalCents),
              breakdown: { item_total: { currency_code: 'USD', value: toValue(opts.totalCents) } },
            },
            items: opts.items.map((i) => ({
              name: i.name.slice(0, 127),
              quantity: String(i.quantity),
              unit_amount: { currency_code: 'USD', value: toValue(i.unitCents) },
            })),
          },
        ],
        application_context: {
          brand_name: 'JB.SKYLENS',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      },
    });
  }

  getOrder(paypalOrderId: string) {
    return this.request<PaypalOrder>(
      'GET',
      `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
    );
  }

  /** Captures an approved order. Safe to retry: same request id = same result */
  captureOrder(paypalOrderId: string) {
    return this.request<PaypalOrder>(
      'POST',
      `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
      { requestId: `capture-${paypalOrderId}`, body: {} },
    );
  }

  /** Full refund of a capture */
  refundCapture(captureId: string) {
    return this.request<{ id: string; status: string }>(
      'POST',
      `/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
      { requestId: `refund-${captureId}`, body: {} },
    );
  }

  /** Asks PayPal whether a webhook delivery really comes from it (signature check) */
  async verifyWebhook(headers: Record<string, string | string[] | undefined>, event: unknown) {
    const webhookId = this.config.get<string>('paypal.webhookId');
    if (!webhookId) return false;
    const h = (name: string) => {
      const v = headers[name];
      return Array.isArray(v) ? v[0] : v;
    };
    const result = await this.request<{ verification_status: string }>(
      'POST',
      '/v1/notifications/verify-webhook-signature',
      {
        body: {
          auth_algo: h('paypal-auth-algo'),
          cert_url: h('paypal-cert-url'),
          transmission_id: h('paypal-transmission-id'),
          transmission_sig: h('paypal-transmission-sig'),
          transmission_time: h('paypal-transmission-time'),
          webhook_id: webhookId,
          webhook_event: event,
        },
      },
    );
    return result.verification_status === 'SUCCESS';
  }

  /** First capture of an order response */
  static captureOf(order: PaypalOrder): PaypalCapture | undefined {
    return order.purchase_units?.[0]?.payments?.captures?.[0];
  }

  private async accessToken() {
    if (this.token && this.token.expiresAt > Date.now() + 60_000) return this.token.value;
    const id = this.config.get<string>('paypal.clientId');
    const secret = this.config.get<string>('paypal.clientSecret');
    const res = await fetch(`${API_BASE[this.mode]}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!res.ok || !data.access_token) {
      this.logger.error(`PayPal auth failed: ${res.status}`);
      throw new PaypalError('No se pudo autenticar con PayPal', res.status);
    }
    this.token = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 300) * 1000,
    };
    return this.token.value;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    opts: { body?: unknown; requestId?: string } = {},
  ): Promise<T> {
    if (!this.configured) throw new PaypalError('PayPal no está configurado', 503);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await this.accessToken()}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };
    if (opts.requestId) headers['PayPal-Request-Id'] = opts.requestId;
    const res = await fetch(`${API_BASE[this.mode]}${path}`, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    const data = (await res.json().catch(() => ({}))) as T & {
      message?: string;
      details?: { issue?: string }[];
    };
    if (!res.ok) {
      const issue = data.details?.[0]?.issue;
      this.logger.warn(`PayPal ${method} ${path} → ${res.status} ${issue ?? data.message ?? ''}`);
      throw new PaypalError(data.message ?? `PayPal respondió ${res.status}`, res.status, issue);
    }
    return data;
  }
}
