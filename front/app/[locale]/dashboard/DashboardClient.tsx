'use client'

import { useEffect, useState } from 'react';
import { Activity, Mail, FolderKanban, Users, Handshake, Wrench, Tags, LogOut, Radar } from 'lucide-react';
import LoginForm from './LoginForm';
import HealthPanel from './HealthPanel';
import MessagesPanel from './MessagesPanel';
import ProjectsPanel from './ProjectsPanel';
import TeamPanel from './TeamPanel';
import ClientsPanel from './ClientsPanel';
import ServicesPanel from './ServicesPanel';
import CategoriesPanel from './CategoriesPanel';
import { TOKEN_KEY } from './lib/api';

type Tab = 'health' | 'messages' | 'categories' | 'projects' | 'team' | 'clients' | 'services';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'health', label: 'Estado', icon: <Activity size={16} /> },
  { id: 'messages', label: 'Mensajes', icon: <Mail size={16} /> },
  { id: 'categories', label: 'Categorías', icon: <Tags size={16} /> },
  { id: 'projects', label: 'Proyectos', icon: <FolderKanban size={16} /> },
  { id: 'team', label: 'Equipo', icon: <Users size={16} /> },
  { id: 'clients', label: 'Clientes', icon: <Handshake size={16} /> },
  { id: 'services', label: 'Servicios', icon: <Wrench size={16} /> },
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
    <div className="min-h-screen px-4 pb-10 text-white pt-28 bg-honeydew-900 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 shadow-lg bg-honeydew-800 rounded-2xl sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-full w-11 h-11 bg-honeydew-900 shrink-0">
              <Radar size={22} strokeWidth={1.5} />
            </div>
            <div>
              <span className="font-mono text-xs font-light tracking-widest uppercase text-honeydew-400">
                JB.SKYLENS
              </span>
              <h1 className="font-mono text-lg font-bold leading-tight uppercase sm:text-xl">Dashboard</h1>
              <p className="text-xs text-white/50">{email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition duration-500 rounded-xl bg-honeydew-900 hover:bg-white hover:text-black"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>

        <div className="flex justify-center">
          <nav className="inline-flex gap-1 p-1 overflow-x-auto rounded-full bg-black/30 backdrop-blur-sm max-w-full">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-semibold uppercase tracking-wide transition ${
                  tab === t.id
                    ? 'bg-honeydew-500 text-black'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'health' && <HealthPanel />}
        {tab === 'messages' && <MessagesPanel />}
        {tab === 'categories' && <CategoriesPanel />}
        {tab === 'projects' && <ProjectsPanel />}
        {tab === 'team' && <TeamPanel />}
        {tab === 'clients' && <ClientsPanel />}
        {tab === 'services' && <ServicesPanel />}
      </div>
    </div>
  );
}
