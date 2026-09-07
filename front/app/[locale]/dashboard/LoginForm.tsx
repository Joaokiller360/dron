'use client'

import { useState, FormEvent } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="flex items-center justify-center min-h-screen px-4 pt-28 pb-10 bg-honeydew-900">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.17, 0.55, 0.55, 1] }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 space-y-5 text-white shadow-lg rounded-3xl bg-honeydew-800 sm:p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-honeydew-900">
            <LockKeyhole size={28} strokeWidth={1.5} />
          </div>
          <span className="font-mono text-xs font-light tracking-widest uppercase text-honeydew-400">
            - Acceso admin -
          </span>
          <h1 className="mt-2 font-mono text-xl font-bold uppercase">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">Inicia sesión para gestionar el backend.</p>
        </div>

        <div>
          <label className="block mb-1 font-mono text-xs font-semibold tracking-wide uppercase text-white/70">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 transition rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
            placeholder="admin@joaobarres.dev"
          />
        </div>

        <div>
          <label className="block mb-1 font-mono text-xs font-semibold tracking-wide uppercase text-white/70">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 transition rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center w-full gap-2 py-2 font-bold text-black transition duration-500 rounded-xl bg-honeydew-500 hover:bg-white disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
          {!loading && <LogIn size={18} />}
        </button>
      </motion.form>
    </div>
  );
}
