'use client'

import { useCallback, useEffect, useState, ReactNode } from 'react';
import { Mail, FolderKanban, Wrench, Users, Handshake, Quote, BadgePercent, ArrowRight, Inbox } from 'lucide-react';
import { apiFetch, ContactMessage, Stats } from './lib/api';
import { useLive } from './lib/live';
import { Card, PanelHeader, Pill, btn } from './ui';
import type { Tab } from './DashboardClient';

function StatCard({
  icon,
  label,
  value,
  detail,
  onClick,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  detail?: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col gap-3 p-5 text-left rounded-2xl border transition cursor-pointer hover:-translate-y-0.5 ${
        highlight
          ? 'bg-[rgba(52,209,122,.1)] border-[rgba(52,209,122,.35)] hover:border-jb-accent'
          : 'bg-jb-card border-white/[.08] hover:border-[rgba(52,209,122,.4)]'
      }`}
    >
      <span className="flex items-center justify-between">
        <span className={highlight ? 'text-jb-accent' : 'text-jb-muted'}>{icon}</span>
        <ArrowRight size={15} className="transition text-jb-muted group-hover:text-jb-mint group-hover:translate-x-0.5" />
      </span>
      <span>
        <span className="block font-mono text-[28px] font-bold leading-none text-white">{value}</span>
        <span className="block mt-1.5 text-[13px] text-jb-soft">{label}</span>
        {detail && <span className="block mt-0.5 text-[12px] text-jb-muted">{detail}</span>}
      </span>
    </button>
  );
}

export default function OverviewPanel({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<ContactMessage[]>([]);

  const load = useCallback(() => {
    apiFetch<Stats>('/stats').then(setStats).catch(() => {});
    apiFetch<ContactMessage[]>('/contact-messages')
      .then((m) => setRecent(m.slice(0, 5)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useLive(
    ['contact-messages', 'projects', 'services', 'team-members', 'clients', 'testimonials', 'promotions'],
    load,
  );

  const pub = (x?: { total: number; published: number }, word = 'publicados') =>
    x ? `${x.published} ${word} de ${x.total}` : undefined;

  return (
    <div className="flex flex-col gap-8">
      <PanelHeader title="Resumen" subtitle="Todo lo que publicas aquí aparece en el sitio al instante." />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <StatCard
          icon={<Mail size={19} />}
          label="Mensajes nuevos"
          value={stats?.messages.new ?? '–'}
          detail={stats ? `${stats.messages.total} en total` : undefined}
          onClick={() => onNavigate('mensajes')}
          highlight={!!stats?.messages.new}
        />
        <StatCard icon={<Wrench size={19} />} label="Servicios" value={stats?.services.total ?? '–'} detail={pub(stats?.services)} onClick={() => onNavigate('servicios')} />
        <StatCard icon={<FolderKanban size={19} />} label="Proyectos" value={stats?.projects.total ?? '–'} detail={pub(stats?.projects)} onClick={() => onNavigate('proyectos')} />
        <StatCard icon={<Handshake size={19} />} label="Clientes" value={stats?.clients.total ?? '–'} detail={pub(stats?.clients)} onClick={() => onNavigate('clientes')} />
        <StatCard icon={<Users size={19} />} label="Equipo" value={stats?.team.total ?? '–'} detail={pub(stats?.team)} onClick={() => onNavigate('equipo')} />
        <StatCard icon={<Quote size={19} />} label="Testimonios" value={stats?.testimonials.total ?? '–'} detail={pub(stats?.testimonials)} onClick={() => onNavigate('testimonios')} />
        <StatCard icon={<BadgePercent size={19} />} label="Promociones" value={stats?.promotions.total ?? '–'} detail={pub(stats?.promotions, 'activas')} onClick={() => onNavigate('promociones')} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[.07]">
          <h2 className="m-0 text-[15px] font-bold text-white">Últimos mensajes</h2>
          <button type="button" onClick={() => onNavigate('mensajes')} className={btn.subtle}>
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-8 text-[13.5px] text-jb-muted">
            <Inbox size={18} /> Aún no hay mensajes del formulario de contacto.
          </div>
        ) : (
          <ul className="p-0 m-0 list-none divide-y divide-white/[.06]">
            {recent.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onNavigate('mensajes')}
                  className="flex items-center w-full gap-4 px-5 py-3.5 text-left hover:bg-white/[.03] cursor-pointer"
                >
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-white truncate">{m.name}</span>
                      {m.status === 'NEW' && <Pill tone="on">Nuevo</Pill>}
                    </span>
                    <span className="block text-[13px] text-jb-muted truncate">{m.message.replace(/\s+/g, ' ')}</span>
                  </span>
                  <span className="flex-none font-mono text-[11.5px] text-jb-muted">
                    {new Date(m.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
