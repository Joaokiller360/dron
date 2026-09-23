'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { API_URL } from './api';

type Listener = (resource: string) => void;

interface LiveContextValue {
  connected: boolean;
  subscribe: (listener: Listener) => () => void;
}

const LiveContext = createContext<LiveContextValue>({ connected: false, subscribe: () => () => {} });

/**
 * One EventSource per dashboard session on the API's /events stream. Panels
 * subscribe to the resources they show and reload silently when any client
 * (this tab, another tab, another admin) changes them.
 */
export function LiveProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const listeners = useRef(new Set<Listener>());
  const [value] = useState<LiveContextValue>(() => ({
    connected: false,
    subscribe: (listener) => {
      listeners.current.add(listener);
      return () => listeners.current.delete(listener);
    },
  }));

  useEffect(() => {
    const source = new EventSource(`${API_URL}/events`);
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false); // EventSource retries on its own
    source.addEventListener('change', (e) => {
      try {
        const { resource } = JSON.parse((e as MessageEvent).data) as { resource: string };
        listeners.current.forEach((l) => l(resource));
      } catch {
        // ignore malformed events
      }
    });
    return () => source.close();
  }, []);

  return <LiveContext.Provider value={{ ...value, connected }}>{children}</LiveContext.Provider>;
}

export function useLiveStatus() {
  return useContext(LiveContext).connected;
}

/** Calls `onChange` (debounced) whenever one of `resources` changes on the server. */
export function useLive(resources: string | string[], onChange: () => void) {
  const { subscribe } = useContext(LiveContext);
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  });
  const key = Array.isArray(resources) ? resources.join(',') : resources;

  useEffect(() => {
    const wanted = new Set(key.split(','));
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = subscribe((resource) => {
      if (!wanted.has(resource)) return;
      clearTimeout(timer);
      timer = setTimeout(() => callback.current(), 250);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [key, subscribe]);
}
