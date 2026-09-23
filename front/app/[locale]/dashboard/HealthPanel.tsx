'use client'

import { useState } from 'react';
import { ServerCog, RefreshCw } from 'lucide-react';
import { apiFetch, ApiError, API_URL } from './lib/api';

interface HealthResponse {
  status: string;
  timestamp: string;
}

type State = 'idle' | 'ok' | 'error';

export default function HealthPanel() {
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
