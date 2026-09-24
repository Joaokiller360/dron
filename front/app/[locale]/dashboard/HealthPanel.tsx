'use client'

import { useCallback, useEffect, useState } from 'react';
import { ServerCog, RefreshCw, CreditCard } from 'lucide-react';
import { apiFetch, ApiError, API_URL, PaymentCheck } from './lib/api';

interface HealthResponse {
  status: string;
  timestamp: string;
}

type State = 'idle' | 'ok' | 'error';

function BackendCard() {
  const [result, setResult] = useState<HealthResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<State>('idle');

  const check = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await apiFetch<HealthResponse>('/health');
      setResult(data);
      setState('ok');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el backend.');
      setState('error');
    } finally {
      setLoading(false);
    }
  };

  const dotColor = state === 'ok' ? 'bg-jb-accent' : state === 'error' ? 'bg-red-400' : 'bg-white/30';

  return (
    <div className="p-6 space-y-5 border border-white/[.08] rounded-2xl bg-jb-card sm:p-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-full w-14 h-14 bg-jb-bg shrink-0">
          <ServerCog size={26} strokeWidth={1.5} />
        </div>
        <div>
          <span className="font-mono text-xs font-light tracking-widest uppercase text-jb-mint">
            - Backend -
          </span>
          <h2 className="font-mono text-lg font-bold uppercase">Estado</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 font-mono text-xs rounded-xl bg-jb-bg text-white/60">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
        <span className="break-all">{API_URL}</span>
      </div>

      <button
        onClick={check}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 font-bold text-black transition duration-500 rounded-xl bg-jb-accent hover:bg-white disabled:opacity-50"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Probando...' : 'Probar conexión'}
      </button>

      {result && (
        <div className="flex items-center gap-2 text-jb-mint">
          <span className="w-2 h-2 rounded-full bg-jb-accent" />
          <p>
            Backend vivo — status: {result.status}, timestamp: {result.timestamp}
          </p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

/** Live PayPal check: the API asks PayPal for a token with its credentials */
function PaypalCard() {
  const [result, setResult] = useState<PaymentCheck | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await apiFetch<PaymentCheck>('/store/payments/check'));
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : 'No se pudo consultar a la API.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // async request; state is only set after it resolves
    check();
  }, [check]);

  const state = error || (result && !result.connected) ? 'error' : result?.connected ? 'ok' : 'idle';
  const dotColor = state === 'ok' ? 'bg-jb-accent' : state === 'error' ? 'bg-red-400' : 'bg-white/30';

  return (
    <div className="p-6 space-y-5 border border-white/[.08] rounded-2xl bg-jb-card sm:p-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-full w-14 h-14 bg-jb-bg shrink-0">
          <CreditCard size={26} strokeWidth={1.5} />
        </div>
        <div>
          <span className="font-mono text-xs font-light tracking-widest uppercase text-jb-mint">- Pagos -</span>
          <h2 className="font-mono text-lg font-bold uppercase">PayPal</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 font-mono text-xs rounded-xl bg-jb-bg text-white/60">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
        <span>
          {loading && !result
            ? 'Consultando…'
            : result
              ? `${result.connected ? 'Conectado' : 'Sin conexión'} · ${result.mode === 'live' ? 'LIVE (pagos reales)' : 'SANDBOX (pruebas)'}${result.latencyMs ? ` · ${result.latencyMs} ms` : ''}`
              : error || '—'}
        </span>
      </div>

      {result && (
        <ul className="p-0 m-0 space-y-1.5 list-none text-[13.5px]">
          <li className={result.connected ? 'text-jb-mint' : 'text-red-400'}>{result.message}</li>
          <li className={result.configured ? 'text-jb-soft' : 'text-red-400'}>
            Credenciales: {result.configured ? 'configuradas' : 'faltan PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET'}
          </li>
          <li className={result.webhook ? 'text-jb-soft' : 'text-amber-300'}>
            Webhook: {result.webhook ? 'configurado (PAYPAL_WEBHOOK_ID)' : 'sin configurar; los pagos se confirman al volver del checkout y por la tarea de revisión'}
          </li>
          <li className="text-jb-muted">Revisado {new Date(result.checkedAt).toLocaleString('es-EC')}</li>
        </ul>
      )}

      <button
        onClick={check}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 font-bold text-black transition duration-500 rounded-xl bg-jb-accent hover:bg-white disabled:opacity-50"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Probando...' : 'Probar PayPal'}
      </button>
    </div>
  );
}

export default function HealthPanel() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <BackendCard />
      <PaypalCard />
    </div>
  );
}
