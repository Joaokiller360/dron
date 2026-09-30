import { normalizePath, routeFor } from './routes';

const route = (raw: string) => routeFor(normalizePath(raw)!, 'api');

describe('gateway routes', () => {
  it('sends each resource to the service that owns it', () => {
    expect(route('/api/auth/login')).toBe('auth');
    expect(route('/api/products/admin')).toBe('store');
    expect(route('/api/orders/paypal/webhook')).toBe('store');
    expect(route('/api/store')).toBe('store');
    expect(route('/api/uploads/presign')).toBe('media');
    expect(route('/api/events')).toBe('events');
    expect(route('/api/projects')).toBe('content');
    expect(route('/api/stats')).toBe('content');
  });

  it('splits /reorder between store (products) and content (the rest)', () => {
    expect(route('/api/reorder/products')).toBe('store');
    expect(route('/api/reorder/projects')).toBe('content');
  });

  it('answers /api/health itself and routes each service docs', () => {
    expect(route('/api/health')).toBe('health');
    expect(route('/api/docs/store')).toBe('store');
    expect(route('/api/docs/store/swagger-ui.css')).toBe('store');
  });

  it('never exposes internal routes, however the path is spelled', () => {
    for (const p of [
      '/api/internal/sessions/1',
      '/API/Internal/sessions/1',
      '//api//internal/x',
      '/api/./internal/x',
      '/api/projects/../internal/x',
      '/api/%69nternal/x',
    ]) {
      expect(route(p)).toBe('blocked');
    }
  });

  it('ignores Object.prototype keys and undecodable paths', () => {
    expect(route('/api/constructor')).toBe('content');
    expect(route('/api/__proto__')).toBe('content');
    expect(normalizePath('/api/%E0%A4%A')).toBeNull();
  });
});
