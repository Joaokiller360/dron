'use client'

import { useEffect } from 'react';
import { quoteAction } from './actions';

/**
 * Tells the API the client opened the page. Runs in the browser only, so the
 * link previews WhatsApp and mail apps fetch don't count as a visit.
 */
export default function ViewBeacon({ token }: { token: string }) {
  useEffect(() => {
    quoteAction(token, 'view').catch(() => {});
  }, [token]);
  return null;
}
