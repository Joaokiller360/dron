import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';
import { StoreWhatsappService, param, toWaNumber } from './store-whatsapp.service';

describe('toWaNumber', () => {
  it('adds the country code to local numbers', () => {
    expect(toWaNumber('0987654321', '593')).toBe('593987654321');
    expect(toWaNumber('098 765-4321', '593')).toBe('593987654321');
    expect(toWaNumber('987654321', '593')).toBe('593987654321');
  });

  it('keeps numbers that already carry a country code', () => {
    expect(toWaNumber('+593 98 765 4321', '593')).toBe('593987654321');
    expect(toWaNumber('593987654321', '593')).toBe('593987654321');
    expect(toWaNumber('+1 (415) 555-0100', '593')).toBe('14155550100');
    expect(toWaNumber('0034 612 345 678', '593')).toBe('34612345678');
  });

  it('rejects what cannot be a phone', () => {
    expect(toWaNumber('123', '593')).toBeNull();
    expect(toWaNumber('+1234567890123456', '593')).toBeNull();
  });
});

describe('param', () => {
  it('flattens line breaks and runs of spaces', () => {
    expect(param('Av. Libertad\ncasa 12\t\t     Quito ')).toBe('Av. Libertad casa 12 Quito');
  });

  it('never sends an empty value', () => {
    expect(param('  ')).toBe('—');
  });
});

describe('StoreWhatsappService', () => {
  const env: Record<string, string> = {
    'whatsapp.token': 'tkn',
    'whatsapp.phoneNumberId': '111',
    'whatsapp.apiVersion': 'v23.0',
    'whatsapp.countryCode': '593',
    'whatsapp.templatePaid': 'pedido_pagado',
    'whatsapp.templateShipped': 'pedido_enviado',
    'whatsapp.langEs': 'es',
    'whatsapp.langEn': 'en',
  };
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const order = {
    code: 'JB-ABC123',
    name: 'Ana',
    phone: '0987654321',
    address: 'Av. Libertad, casa 12',
    city: 'Quito',
    locale: 'es',
    items: [
      { productId: 'p1', name: 'Dron', unitCents: 50000, quantity: 1 },
      {
        productId: 'p2',
        name: 'Batería',
        options: [{ name: 'Tipo', value: 'Larga' }],
        unitCents: 2000,
        quantity: 2,
      },
    ],
    shippingCity: 'Quito',
    shippingCents: 500,
    totalCents: 54500,
  } as unknown as Order;

  let fetchMock: jest.Mock;
  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
  });

  it('sends the paid template with the order details', async () => {
    await new StoreWhatsappService(config).orderPaid(order);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://graph.facebook.com/v23.0/111/messages');
    expect(init.headers.Authorization).toBe('Bearer tkn');
    const body = JSON.parse(init.body);
    expect(body.to).toBe('593987654321');
    expect(body.template.name).toBe('pedido_pagado');
    expect(body.template.language.code).toBe('es');
    expect(body.template.components[0].parameters.map((p: { text: string }) => p.text)).toEqual([
      'Ana',
      'JB-ABC123',
      '1 × Dron, 2 × Batería (Larga)',
      'Quito · $5.00',
      '$545.00',
      'Av. Libertad, casa 12, Quito',
    ]);
  });

  it('sends plain text while no template is configured', async () => {
    const noTemplates = {
      get: (key: string) => (key.startsWith('whatsapp.template') ? undefined : env[key]),
    } as unknown as ConfigService;
    await new StoreWhatsappService(noTemplates).orderShipped({
      ...order,
      carrier: 'Servientrega',
      trackingNumber: '123456',
      trackingUrl: null,
    } as Order);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.type).toBe('text');
    expect(body.template).toBeUndefined();
    expect(body.text.body).toBe(
      [
        'Tu pedido JB-ABC123 ya fue enviado.',
        '',
        'Empresa de envío: Servientrega',
        'Número de guía: 123456',
        'Entrega en: Av. Libertad, casa 12, Quito',
        'Web de rastreo: —',
        '',
        'Gracias por comprar en JB.SKYLENS.',
      ].join('\n'),
    );
  });

  it('throws on API errors so the notice is retried', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Template name does not exist' } }),
    });
    await expect(new StoreWhatsappService(config).orderShipped(order)).rejects.toThrow(
      'Template name does not exist',
    );
  });

  it('skips silently when WhatsApp is not configured', async () => {
    const off = { get: (key: string) => (key === 'whatsapp.token' ? undefined : env[key]) };
    await new StoreWhatsappService(off as unknown as ConfigService).orderPaid(order);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
