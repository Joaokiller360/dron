'use client'

import { useEffect, useRef, useState } from 'react';

// Minimal typing of the PayPal JS SDK (https://developer.paypal.com/sdk/js/reference/)
interface PaypalActions {
  restart: () => Promise<void>;
}
interface PaypalButtonsInstance {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => Promise<void>;
}
interface PaypalSdk {
  Buttons: (options: {
    style?: Record<string, string | number>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }, actions: PaypalActions) => Promise<void>;
    onCancel?: (data: { orderID: string }) => void;
    onError?: (err: unknown) => void;
  }) => PaypalButtonsInstance;
}

// The SDK is loaded once per client id + language; switching language swaps it
let sdk: { key: string; promise: Promise<PaypalSdk>; script: HTMLScriptElement } | null = null;

/** Loads the PayPal SDK (USD, capture intent) in the page language */
function loadPaypal(clientId: string, locale: string): Promise<PaypalSdk> {
  const key = `${clientId}|${locale}`;
  if (sdk && sdk.key !== key) {
    sdk.script.remove();
    delete (window as unknown as { paypal?: PaypalSdk }).paypal;
    sdk = null;
  }
  if (!sdk) {
    const script = document.createElement('script');
    const promise = new Promise<PaypalSdk>((resolve, reject) => {
      const params = new URLSearchParams({
        'client-id': clientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
        locale: locale === 'en' ? 'en_US' : 'es_EC',
      });
      script.src = `https://www.paypal.com/sdk/js?${params}`;
      script.async = true;
      script.onload = () => {
        const paypal = (window as unknown as { paypal?: PaypalSdk }).paypal;
        if (paypal) resolve(paypal);
        else reject(new Error('PayPal SDK missing'));
      };
      script.onerror = () => {
        sdk = null; // allow a retry
        script.remove();
        reject(new Error('PayPal SDK failed to load'));
      };
      document.head.appendChild(script);
    });
    sdk = { key, promise, script };
  }
  return sdk.promise;
}

const API = process.env.NEXT_PUBLIC_API_URL;

async function post<T>(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: T & { message?: unknown } }> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
}

/** Text of an API error (the exception filter nests Nest's body under `message`) */
function apiMessage(data: { message?: unknown }): string | null {
  const m = data.message as { message?: unknown } | string | undefined;
  const inner = typeof m === 'object' ? m?.message : m;
  return typeof inner === 'string' ? inner : null;
}

export type PaymentOutcome = { status: 'PAID' | 'PENDING'; code: string };

/**
 * PayPal Smart Buttons. Clicking one creates our order on the API (which
 * reserves stock and opens the PayPal order for the server-computed total);
 * after approval the API captures and verifies the payment.
 */
export default function PaypalButtons({
  clientId,
  locale,
  order,
  onDone,
  onStockChanged,
  texts,
}: {
  clientId: string;
  locale: string;
  /** Body for POST /orders (buyer details + cart lines) */
  order: Record<string, unknown>;
  onDone: (outcome: PaymentOutcome) => void;
  onStockChanged: () => void;
  texts: { loadError: string; declined: string; failed: string };
}) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // Latest props for the SDK callbacks, which are bound once at render
  const latest = useRef({ order, onDone, onStockChanged, texts });
  useEffect(() => {
    latest.current = { order, onDone, onStockChanged, texts };
  });

  useEffect(() => {
    let cancelled = false;
    let buttons: PaypalButtonsInstance | null = null;
    // Error already shown for this attempt, so onError doesn't replace it
    let explained = false;

    loadPaypal(clientId, locale)
      .then((paypal) => {
        if (cancelled || !container.current) return;
        buttons = paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', color: 'gold', label: 'pay', height: 45 },
          createOrder: async () => {
            setError('');
            explained = false;
            const { ok, data } = await post<{ paypalOrderId: string }>('/orders', latest.current.order);
            if (!ok) {
              // e.g. someone else bought the last units: show the real stock
              latest.current.onStockChanged();
              setError(apiMessage(data) ?? latest.current.texts.failed);
              explained = true;
              throw new Error('checkout refused');
            }
            return data.paypalOrderId;
          },
          onApprove: async ({ orderID }, actions) => {
            const { ok, data } = await post<{ code: string; status: 'PAID' | 'PENDING' | 'DECLINED' }>('/orders/paypal/capture', {
              paypalOrderId: orderID,
            });
            if (ok && data.status === 'DECLINED') {
              setError(latest.current.texts.declined);
              return actions.restart();
            }
            if (!ok) {
              setError(apiMessage(data) ?? latest.current.texts.failed);
              explained = true;
              latest.current.onStockChanged();
              return;
            }
            latest.current.onDone({ status: data.status === 'PENDING' ? 'PENDING' : 'PAID', code: data.code });
          },
          onCancel: ({ orderID }) => {
            // Give the reserved units back right away instead of waiting for the expiry task
            post('/orders/paypal/cancel', { paypalOrderId: orderID })
              .catch(() => {})
              .finally(() => latest.current.onStockChanged());
          },
          onError: () => {
            if (!explained) setError(latest.current.texts.failed);
          },
        });
        return buttons.render(container.current);
      })
      .catch(() => {
        if (!cancelled) setError(latest.current.texts.loadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      buttons?.close?.().catch(() => {});
    };
  }, [clientId, locale]);

  return (
    <div className="flex flex-col gap-3">
      {loading && <div className="h-[100px] rounded-[10px] bg-white/[.05] animate-pulse" />}
      {/* PayPal renders its own buttons here (white background keeps their colours right) */}
      <div ref={container} className="min-h-0 [&:not(:empty)]:p-3 [&:not(:empty)]:rounded-xl [&:not(:empty)]:bg-white" />
      {error && (
        <p role="alert" className="m-0 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-400/30 text-[13.5px] text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
