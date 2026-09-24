// Server-side fetch of public API lists; never throws, falls back to [] / null.
export async function fetchPublic<T>(path: string): Promise<T | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface PublicService {
  id: string;
  slug: string;
  titleEs: string;
  titleEn?: string | null;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  coverUrl: string;
  href?: string | null;
  isPage?: boolean;
}

export interface PublicProject {
  id: string;
  slug: string;
  category?: { id: string; name: string; sortOrder: number } | null;
  titleEs: string;
  titleEn?: string | null;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  coverUrl: string;
  href?: string | null;
  mediaUrls?: string[];
}

export interface PublicClient {
  id: string;
  slug: string;
  name: string;
  category: { id: string; name: string; sortOrder: number } | null;
  photoUrl: string;
  links: { platform: string; url: string }[];
}

export interface PublicPromotion {
  id: string;
  title: string;
  detail?: string | null;
  badge?: string | null;
  untilLabel?: string | null;
  price?: string | null;
  oldPrice?: string | null;
  serviceSlug?: string | null;
}

export interface PublicPromotions {
  settings: { enabled: boolean; bar: boolean; section: boolean; badges: boolean };
  items: PublicPromotion[];
}

export interface PublicProduct {
  id: string;
  slug: string;
  nameEs: string;
  nameEn?: string | null;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  /** null when the store hides prices */
  priceCents: number | null;
  compareAtCents?: number | null;
  /** null = unlimited */
  stock: number | null;
  coverUrl: string;
}

export interface PublicStore {
  settings: { enabled: boolean; sales: boolean; showPrices: boolean; pausedNotice: string };
  /** paypalClientId is null while PayPal isn't configured on the API */
  payments: {
    paypalClientId: string | null;
    currency: string;
    /** Account to transfer to; null while transfer isn't offered */
    transfer: {
      bankName: string;
      accountType: 'AHORROS' | 'CORRIENTE';
      accountNumber: string;
      accountHolder: string;
      holderId: string;
      email: string;
    } | null;
  };
  products: PublicProduct[];
}

/** Whether the store is on (drives the menu link); off when the API is unreachable */
export async function getStoreEnabled(): Promise<boolean> {
  const status = await fetchPublic<{ enabled: boolean }>('/store/status');
  return !!status?.enabled;
}

export interface PublicTestimonial {
  id: string;
  quote: string;
  author: string;
  org?: string | null;
}

export function localized(locale: string, es: string, en?: string | null) {
  return locale === 'en' && en ? en : es;
}

export interface PublicVenue {
  id: string;
  name: string;
  city: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
}

export const DEFAULT_CONTACT_INFO: ContactInfo = { phone: '+593 98 666 0737', email: 'contacto@joaobarres.dev' };

/** Contact phone/email set in the dashboard (falls back to the defaults) */
export async function getContactInfo(): Promise<ContactInfo> {
  return { ...DEFAULT_CONTACT_INFO, ...(await fetchPublic<Partial<ContactInfo>>('/settings/contact')) };
}

/** wa.me link for a phone as typed ("099 123 4567" → Ecuador +593) */
export function whatsappUrl(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `593${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}
