'use client'

import { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import HealthPanel from './HealthPanel';
import MessagesPanel from './MessagesPanel';
import ProjectsPanel from './ProjectsPanel';
import { TOKEN_KEY } from './lib/api';

type Tab = 'health' | 'messages' | 'projects';

const TABS: { id: Tab; label: string }[] = [
  { id: 'health', label: 'Estado' },
  { id: 'messages', label: 'Mensajes' },
  { id: 'projects', label: 'Proyectos' },
];

export default function DashboardClient() {
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('health');

  useEffect(() => {
    try {
      const token = window.localStorage.getItem(TOKEN_KEY);
      if (token) setEmail('sesión guardada');
    } catch {
      // localStorage blocked (private browsing, disabled storage) -> just show login
    }
  }, []);

  const logout = () => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    setEmail(null);
  };

  if (!email) {
    return <LoginForm onSuccess={(loggedInEmail) => setEmail(loggedInEmail)} />;
  }

  return (
    <div className="min-h-screen px-4 pt-28 pb-10 text-white bg-honeydew-900 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">JB.SKYLENS Dashboard</h1>
            <p className="text-sm text-white/60">{email}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-bold rounded-xl bg-honeydew-800 hover:bg-white hover:text-black"
          >
            Cerrar sesión
          </button>
        </div>

        <nav className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                tab === t.id
                  ? 'bg-honeydew-500 text-black'
                  : 'bg-honeydew-800 hover:bg-white hover:text-black'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'health' && <HealthPanel />}
        {tab === 'messages' && <MessagesPanel />}
        {tab === 'projects' && <ProjectsPanel />}
      </div>
    </div>
  );
}
