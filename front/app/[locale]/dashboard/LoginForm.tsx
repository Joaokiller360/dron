'use client'

import { useState, FormEvent } from 'react';
import { apiFetch, ApiError, TOKEN_KEY } from './lib/api';

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; name: string };
}

export default function LoginForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      try {
        window.localStorage.setItem(TOKEN_KEY, data.accessToken);
      } catch {
        // localStorage blocked -> still let this session through, just won't persist on reload
      }
      onSuccess(data.user.email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 pt-28 bg-honeydew-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 space-y-4 text-white rounded-2xl bg-honeydew-800"
      >
        <h1 className="text-xl font-bold">Dashboard admin</h1>
        <p className="text-sm text-white/70">Inicia sesión para probar el backend.</p>

        <div>
          <label className="block mb-1 text-sm font-semibold">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded bg-honeydew-900"
            placeholder="admin@joaobarres.dev"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-honeydew-900"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 font-bold text-black transition rounded-xl bg-honeydew-500 hover:bg-white disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
