'use client'

import { useCallback, useEffect, useState, ReactNode } from 'react';
import {
  LayoutDashboard,
  Mail,
  FolderKanban,
  Users,
  Handshake,
  Wrench,
  Scale,
  LogOut,
  Tags,
  Quote,
  BadgePercent,
  Activity,
  Menu,
  X,
  ExternalLink,
  MapPin,
  Phone,
  ShoppingBag,
  Receipt,
} from 'lucide-react';
import LoginForm from './LoginForm';
import OverviewPanel from './OverviewPanel';
import HealthPanel from './HealthPanel';
import MessagesPanel from './MessagesPanel';
import ProjectsPanel from './ProjectsPanel';
import TeamPanel from './TeamPanel';
import ClientsPanel from './ClientsPanel';
import ServicesPanel from './ServicesPanel';
import LegalPanel from './LegalPanel';
import CategoriesPanel from './CategoriesPanel';
import TestimonialsPanel from './TestimonialsPanel';
import PromotionsPanel from './PromotionsPanel';
import VenuesPanel from './VenuesPanel';
import ContactPanel from './ContactPanel';
import StorePanel from './StorePanel';
import OrdersPanel from './OrdersPanel';
import { apiFetch, Stats, TOKEN_KEY, UNAUTHORIZED_EVENT } from './lib/api';
import { LiveProvider, useLive, useLiveStatus } from './lib/live';
import { Toaster, useToast } from './ui';

export type Tab =
  | 'resumen'
  | 'mensajes'
  | 'contacto'
  | 'servicios'
  | 'proyectos'
  | 'equipo'
  | 'clientes'
  | 'testimonios'
  | 'promociones'
  | 'lugares'
  | 'tienda'
  | 'pedidos'
  | 'legal'
  | 'categorias'
  | 'estado';

interface NavItem {
  id: Tab;
  label: string;
  icon: ReactNode;
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'General',
    items: [
      { id: 'resumen', label: 'Resumen', icon: <LayoutDashboard size={17} /> },
      { id: 'mensajes', label: 'Mensajes', icon: <Mail size={17} /> },
      { id: 'contacto', label: 'Contacto', icon: <Phone size={17} /> },
    ],
  },
  {
    group: 'Contenido',
    items: [
      { id: 'servicios', label: 'Servicios', icon: <Wrench size={17} /> },
      { id: 'proyectos', label: 'Proyectos', icon: <FolderKanban size={17} /> },
      { id: 'equipo', label: 'Equipo', icon: <Users size={17} /> },
      { id: 'clientes', label: 'Clientes', icon: <Handshake size={17} /> },
      { id: 'testimonios', label: 'Testimonios', icon: <Quote size={17} /> },
      { id: 'promociones', label: 'Promociones', icon: <BadgePercent size={17} /> },
      { id: 'lugares', label: 'Lugares', icon: <MapPin size={17} /> },
      { id: 'legal', label: 'Legal', icon: <Scale size={17} /> },
      { id: 'categorias', label: 'Categorías', icon: <Tags size={17} /> },
    ],
  },
  {
    group: 'Tienda',
    items: [
      { id: 'tienda', label: 'Productos', icon: <ShoppingBag size={17} /> },
      { id: 'pedidos', label: 'Pedidos', icon: <Receipt size={17} /> },
    ],
  },
  {
    group: 'Sistema',
    items: [{ id: 'estado', label: 'Estado del backend', icon: <Activity size={17} /> }],
  },
];

const ALL_TABS = NAV.flatMap((g) => g.items.map((i) => i.id));
const labelOf = (tab: Tab) => NAV.flatMap((g) => g.items).find((i) => i.id === tab)?.label ?? '';

function tabFromHash(): Tab {
  if (typeof window === 'undefined') return 'resumen';
  const h = window.location.hash.slice(1) as Tab;
  return ALL_TABS.includes(h) ? h : 'resumen';
}

export default function DashboardClient() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let token: string | null = null;
    try {
      token = window.localStorage.getItem(TOKEN_KEY);
    } catch {
      // localStorage blocked (private browsing, disabled storage) -> just show login
    }
    if (!token) return;
    // Validate the saved session and show who is logged in
    apiFetch<{ email?: string }>('/auth/me')
      .then((me) => setEmail(me.email ?? 'admin'))
      .catch(() => {
        try {
          window.localStorage.removeItem(TOKEN_KEY);
        } catch {
          // ignore
        }
      });
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    setEmail(null);
  }, []);

  if (!email) {
    return <LoginForm onSuccess={(loggedInEmail) => setEmail(loggedInEmail)} />;
  }

  return (
    <Toaster>
      <LiveProvider>
        <Shell email={email} onLogout={logout} />
      </LiveProvider>
    </Toaster>
  );
}

function Shell({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [tab, setTabState] = useState<Tab>(tabFromHash);
  const [drawer, setDrawer] = useState(false);
  const [newMessages, setNewMessages] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const live = useLiveStatus();
  const toast = useToast();

  const setTab = useCallback((next: Tab) => {
    setTabState(next);
    setDrawer(false);
    window.history.replaceState(null, '', `#${next}`);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onHash = () => setTabState(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Session expired mid-use -> back to login with a notice
  useEffect(() => {
    const onUnauthorized = () => {
      toast.error('Tu sesión expiró. Vuelve a iniciar sesión.');
      onLogout();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [onLogout, toast]);

  const loadBadge = useCallback(() => {
    apiFetch<Stats>('/stats')
      .then((s) => {
        setNewMessages(s.messages.new);
        setPendingOrders(s.orders?.pending ?? 0);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    loadBadge();
  }, [loadBadge]);
  useLive(['contact-messages', 'orders'], loadBadge);

  const sidebar = (
    <nav aria-label="Secciones" className="flex flex-col gap-6">
      {NAV.map((g) => (
        <div key={g.group} className="flex flex-col gap-0.5">
          <span className="px-3 mb-1.5 font-mono text-[10px] font-semibold tracking-[.18em] uppercase text-jb-muted/80">
            {g.group}
          </span>
          {g.items.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[14px] text-left transition cursor-pointer ${
                  active ? 'bg-[rgba(52,209,122,.14)] text-white font-semibold' : 'text-jb-soft hover:text-white hover:bg-white/[.05]'
                }`}
              >
                <span className={active ? 'text-jb-accent' : 'text-jb-muted'}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {(item.id === 'mensajes' ? newMessages : item.id === 'pedidos' ? pendingOrders : 0) > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-jb-accent text-jb-ink text-[11px] font-bold flex items-center justify-center">
                    {item.id === 'mensajes' ? newMessages : pendingOrders}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-2.5 px-3">
      <img src="/img/logo-p.png" alt="" className="bg-white rounded-full w-7 h-7" />
      <div className="leading-tight">
        <div className="font-mono text-[14px] font-bold text-white">JB.SKYLENS</div>
        <div className="font-mono text-[10px] tracking-[.14em] uppercase text-jb-mint">Dashboard</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-jb-bg text-jb-text lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen lg:flex flex-col gap-8 px-3 py-6 border-r border-white/[.07] bg-jb-band overflow-y-auto">
        {brand}
        {sidebar}
        <div className="mt-auto px-3 pt-4 border-t border-white/[.07]">
          <div className="text-[12px] text-jb-muted truncate" title={email}>{email}</div>
          <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 mt-2 text-[13px] text-jb-soft hover:text-white cursor-pointer">
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Drawer (mobile) */}
      {drawer && (
        <div className="fixed inset-0 z-[110] lg:hidden" onClick={() => setDrawer(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 left-0 w-[272px] flex flex-col gap-8 px-3 py-5 bg-jb-band border-r border-white/[.08] overflow-y-auto animate-jb-fade"
          >
            <div className="flex items-center justify-between">
              {brand}
              <button type="button" aria-label="Cerrar menú" onClick={() => setDrawer(false)} className="p-2 text-jb-soft">
                <X size={18} />
              </button>
            </div>
            {sidebar}
            <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 px-3 mt-auto text-[13px] text-jb-soft">
              <LogOut size={15} /> Cerrar sesión
            </button>
          </aside>
        </div>
      )}

      <div className="min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-8 h-14 border-b border-white/[.07] bg-[rgba(10,28,18,.88)] backdrop-blur-md">
          <button type="button" aria-label="Abrir menú" onClick={() => setDrawer(true)} className="p-1.5 -ml-1.5 text-jb-soft lg:hidden">
            <Menu size={20} />
          </button>
          <span className="font-mono text-[12px] tracking-[.1em] uppercase text-jb-muted truncate">{labelOf(tab)}</span>
          <div className="flex items-center gap-2 ml-auto">
            <span
              title={live ? 'Conectado: los cambios aparecen al instante' : 'Reconectando…'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[.1] text-[11.5px] text-jb-soft"
            >
              <span className={`w-2 h-2 rounded-full ${live ? 'bg-jb-accent animate-pulse' : 'bg-amber-400'}`} />
              {live ? 'En vivo' : 'Reconectando'}
            </span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] text-jb-soft hover:text-white hover:bg-white/[.06]"
            >
              <ExternalLink size={14} /> Ver sitio
            </a>
          </div>
        </header>

        <main className="w-full px-4 py-8 sm:px-8">
          {tab === 'resumen' && <OverviewPanel onNavigate={setTab} />}
          {tab === 'mensajes' && <MessagesPanel />}
          {tab === 'contacto' && <ContactPanel />}
          {tab === 'servicios' && <ServicesPanel />}
          {tab === 'proyectos' && <ProjectsPanel />}
          {tab === 'equipo' && <TeamPanel />}
          {tab === 'clientes' && <ClientsPanel />}
          {tab === 'testimonios' && <TestimonialsPanel />}
          {tab === 'promociones' && <PromotionsPanel />}
          {tab === 'lugares' && <VenuesPanel />}
          {tab === 'tienda' && <StorePanel />}
          {tab === 'pedidos' && <OrdersPanel />}
          {tab === 'legal' && <LegalPanel />}
          {tab === 'categorias' && <CategoriesPanel />}
          {tab === 'estado' && <HealthPanel />}
        </main>
      </div>
    </div>
  );
}
