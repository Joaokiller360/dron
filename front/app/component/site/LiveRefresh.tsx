'use client'

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Content the public pages render; a change to any of them re-renders the page
const PUBLIC_RESOURCES = new Set([
  'projects',
  'services',
  'team-members',
  'clients',
  'categories',
  'legal-pages',
  'promotions',
  'testimonials',
]);

/**
 * Keeps the public site in sync with the dashboard: listens to the API's
 * /events stream and refreshes the current route's server data when content
 * changes. Hidden tabs refresh once when they become visible again.
 */
export default function LiveRefresh() {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const onDashboard = /(^|\/)dashboard(\/|$)/.test(pathname);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || onDashboard || typeof EventSource === 'undefined') return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let stale = false;
    const refresh = () => {
      if (document.visibilityState === 'hidden') {
        stale = true;
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 400);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible' && stale) {
        stale = false;
        router.refresh();
      }
    };

    const source = new EventSource(`${apiUrl}/events`);
    source.addEventListener('change', (e) => {
      try {
        const { resource } = JSON.parse((e as MessageEvent).data) as { resource: string };
        if (PUBLIC_RESOURCES.has(resource)) refresh();
      } catch {
        // ignore malformed events
      }
    });
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      source.close();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router, onDashboard]);

  return null;
}
