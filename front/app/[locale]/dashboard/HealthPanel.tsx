'use client'

import { useState } from 'react';
import { apiFetch, ApiError, API_URL } from './lib/api';

interface HealthResponse {
  status: string;
  timestamp: string;
}

export default function HealthPanel() {
  const [result, setResult] = useState<HealthResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await apiFetch<HealthResponse>('/health');
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4 rounded-2xl bg-honeydew-800">
      <div>
        <h2 className="text-lg font-bold">Estado del backend</h2>
        <p className="text-sm text-white/60">API: {API_URL}</p>
      </div>

      <button
        onClick={check}
        disabled={loading}
        className="px-4 py-2 font-bold text-black transition rounded-xl bg-honeydew-500 hover:bg-white disabled:opacity-50"
      >
        {loading ? 'Probando...' : 'Probar conexión'}
      </button>

      {result && (
        <p className="text-green-400">
          ✓ Backend vivo — status: {result.status}, timestamp: {result.timestamp}
        </p>
      )}
      {error && <p className="text-customRed">✗ {error}</p>}
    </div>
  );
}
