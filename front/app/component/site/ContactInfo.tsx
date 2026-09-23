'use client'

import { createContext, useContext, ReactNode } from 'react';
import { ContactInfo, DEFAULT_CONTACT_INFO, whatsappUrl } from './api';

// Contact phone/email from the dashboard, loaded once in the locale layout
const Ctx = createContext<ContactInfo>(DEFAULT_CONTACT_INFO);

export function ContactInfoProvider({ value, children }: { value: ContactInfo; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContactInfo() {
  const info = useContext(Ctx);
  return { ...info, whatsapp: whatsappUrl(info.phone) };
}
