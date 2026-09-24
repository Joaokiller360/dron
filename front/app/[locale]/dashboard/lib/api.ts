export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const TOKEN_KEY = 'jbskylens_dashboard_token';

/** Fired on window when an authenticated request comes back 401 */
export const UNAUTHORIZED_EVENT = 'jbskylens:unauthorized';

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type ContactStatus = 'NEW' | 'READ' | 'ARCHIVED';

export type CategoryType = 'PROJECT' | 'CLIENT' | 'SERVICE';

export const CATEGORY_TYPES: CategoryType[] = ['PROJECT', 'CLIENT', 'SERVICE'];

export interface Category {
  id: string;
  slug: string;
  name: string;
  type: CategoryType;
  sortOrder: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  locale: string;
  status: ContactStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  slug: string;
  categoryId: string;
  category: Category;
  titleEs: string;
  titleEn?: string | null;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  coverUrl: string;
  href?: string | null;
  mediaUrls: string[];
  published: boolean;
  sortOrder: number;
}

export type LinkPlatform = 'instagram' | 'whatsapp' | 'website' | 'facebook' | 'tiktok';

export const LINK_PLATFORMS: LinkPlatform[] = [
  'instagram',
  'whatsapp',
  'website',
  'facebook',
  'tiktok',
];

export interface Link {
  platform: LinkPlatform;
  url: string;
}

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  photoUrl: string;
  bio: string | null;
  story: string | null;
  stat: string | null;
  statLabel: string | null;
  base: string | null;
  skills: string[];
  links: Link[];
  published: boolean;
  sortOrder: number;
}

export interface Client {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  category: Category;
  photoUrl: string;
  links: Link[];
  published: boolean;
  sortOrder: number;
}

/** The whole PageServices prop tree, stored as JSON on a full service page. */
export interface ServicePageData {
  D?: { imagen?: string; title?: string; label?: string }[];
  Content?: {
    label?: string;
    subTitle?: string;
    text?: string[];
    list?: { label?: string; text?: string[] }[];
  }[];
  keyword?: string[];
  keywordLink?: Record<string, string>;
  galery?: { imagen?: string; video?: string; label?: string; ref?: string }[];
  P?: { text?: string; buttons?: { label: string; href: string }[] }[];
  CalltoAction?: {
    callToAction?: string;
    SubTitle?: string;
    text?: string[];
    text2?: string[];
    buttons?: { label: string; href: string }[];
    list?: { label?: string; text?: string[] }[];
  }[];
  Animations?: { src?: string }[];
  Example?: {
    label?: string;
    subTitle?: string;
    text?: string[];
    buttons?: { label: string; href: string }[];
    Galeria?: {
      video?: string;
      urlImg?: string;
      label?: string;
      href?: string;
    }[];
  }[];
}

export interface Service {
  id: string;
  slug: string;
  titleEs: string;
  titleEn?: string | null;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  coverUrl: string;
  href?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  published: boolean;
  sortOrder: number;
  isPage: boolean;
  page?: ServicePageData | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords: string[];
}

export interface LegalSection {
  heading?: string;
  text?: string[];
  lists?: { header?: string; description?: string[]; items: string[] }[];
}

export interface LegalPage {
  id: string;
  slug: string;
  titleEs: string;
  titleEn?: string | null;
  label?: string | null;
  lastUpdate?: string | null;
  keywords: string[];
  content: LegalSection[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  published: boolean;
  sortOrder: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  org?: string | null;
  published: boolean;
  sortOrder: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  published: boolean;
  sortOrder: number;
}

export interface Promotion {
  id: string;
  title: string;
  detail?: string | null;
  badge?: string | null;
  untilLabel?: string | null;
  price?: string | null;
  oldPrice?: string | null;
  serviceSlug?: string | null;
  endsAt?: string | null;
  active: boolean;
  sortOrder: number;
}

export interface PromotionSettings {
  enabled: boolean;
  bar: boolean;
  section: boolean;
  badges: boolean;
}

export interface Product {
  id: string;
  slug: string;
  nameEs: string;
  nameEn?: string | null;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  priceCents: number;
  compareAtCents?: number | null;
  /** null = unlimited */
  stock: number | null;
  coverUrl: string;
  mediaUrls: string[];
  /** Details table on the product page (measurements, material…) */
  specs: ProductSpec[];
  /** Choices that change the price (size, color…) */
  options: ProductOption[];
  published: boolean;
  sortOrder: number;
}

/** e.g. Medida → 30 × 40 cm (+0), 50 × 70 cm (+1500) */
export interface ProductOption {
  name: string;
  values: { label: string; priceCents: number }[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface StoreSettings {
  enabled: boolean;
  sales: boolean;
  showPrices: boolean;
  pausedNotice: string;
  /** Products section on the landing page */
  homeSection: boolean;
  /** Store header texts; empty = the site's default */
  heroEyebrowEs: string;
  heroEyebrowEn: string;
  heroTitleEs: string;
  heroTitleEn: string;
  heroIntroEs: string;
  heroIntroEn: string;
  transferEnabled: boolean;
  bankName: string;
  accountType: 'AHORROS' | 'CORRIENTE';
  accountNumber: string;
  accountHolder: string;
  /** Cédula (10 digits) or RUC (13) */
  holderId: string;
  transferEmail: string;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export interface OrderLine {
  productId: string;
  name: string;
  /** Options the buyer picked, already included in unitCents */
  options?: { name: string; value: string }[];
  unitCents: number;
  quantity: number;
}

export interface Order {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note?: string | null;
  locale: string;
  items: OrderLine[];
  totalCents: number;
  status: OrderStatus;
  paymentMethod: 'PAYPAL' | 'TRANSFER';
  transferBank?: string | null;
  transferReference?: string | null;
  paypalOrderId?: string | null;
  paypalCaptureId?: string | null;
  paidAt?: string | null;
  refundedAt?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
  paidEmailAt?: string | null;
  shippedEmailAt?: string | null;
  createdAt: string;
}

/** PayPal setup as seen by the API (no secrets) */
export interface PaymentStatus {
  configured: boolean;
  mode: 'sandbox' | 'live';
  webhook: boolean;
}

/** PaymentStatus plus a live round trip to PayPal */
export interface PaymentCheck extends PaymentStatus {
  connected: boolean;
  message: string;
  latencyMs?: number;
  checkedAt: string;
}

/** 2500 → "$25.00" */
export const formatMoney = (cents: number) =>
  (cents / 100).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });

export interface Stats {
  messages: { total: number; new: number };
  projects: { total: number; published: number };
  services: { total: number; published: number };
  team: { total: number; published: number };
  clients: { total: number; published: number };
  testimonials: { total: number; published: number };
  promotions: { total: number; published: number };
  products: { total: number; published: number };
  orders: { total: number; toShip: number; toVerify: number };
}

/** Resources that support PATCH /reorder/:resource */
export type ReorderResource =
  | 'projects'
  | 'services'
  | 'team-members'
  | 'clients'
  | 'categories'
  | 'legal-pages'
  | 'promotions'
  | 'testimonials'
  | 'venues'
  | 'products';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // The API's exception filter wraps Nest's error body, so the text can be
    // body.message (string), body.message.message (string) or an array of
    // validation messages.
    const inner = body?.message?.message;
    const message =
      typeof body?.message === 'string'
        ? body.message
        : typeof inner === 'string'
          ? inner
          : Array.isArray(inner)
            ? inner.join(', ')
            : `La solicitud falló (código ${res.status})`;
    // Expired/invalid session: let the dashboard shell drop back to the login
    if (res.status === 401 && token && !path.startsWith('/auth/login')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function reorder(resource: ReorderResource, ids: string[]) {
  return apiFetch<{ count: number }>(`/reorder/${resource}`, {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });
}

export function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export type UploadFolder = 'projects' | 'services' | 'team' | 'clients' | 'products' | 'misc';

const MB = 1024 * 1024;

// Same allow-list as the API (back/src/uploads/upload-types.ts). The API
// re-checks everything; this only gives instant feedback before uploading.
export const UPLOAD_FORMATS = {
  image: { types: ['image/jpeg', 'image/png', 'image/webp'], label: 'JPG, PNG o WebP', maxBytes: 20 * MB },
  video: { types: ['video/mp4', 'video/quicktime', 'video/webm'], label: 'MP4, MOV o WebM', maxBytes: 1024 * MB },
} as const;

const ascii = (b: Uint8Array, start: number, end: number) => String.fromCharCode(...b.subarray(start, end));
const SNIFF: Record<string, (b: Uint8Array) => boolean> = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v),
  'image/webp': (b) => ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP',
  'video/mp4': (b) => ascii(b, 4, 8) === 'ftyp',
  'video/quicktime': (b) => ['ftyp', 'moov', 'mdat', 'wide', 'free', 'skip', 'pnot'].includes(ascii(b, 4, 8)),
  'video/webm': (b) => [0x1a, 0x45, 0xdf, 0xa3].every((v, i) => b[i] === v),
};

/** Rejects files whose type, size or actual bytes are not an allowed image/video. */
export async function checkUploadFile(file: File, accept: 'image' | 'video' | 'any'): Promise<string | null> {
  const kinds = accept === 'any' ? (['image', 'video'] as const) : ([accept] as const);
  const kind = kinds.find((k) => (UPLOAD_FORMATS[k].types as readonly string[]).includes(file.type));
  if (!kind) {
    return `Formato no permitido. Usa ${kinds.map((k) => UPLOAD_FORMATS[k].label).join(' o ')}.`;
  }
  const { maxBytes } = UPLOAD_FORMATS[kind];
  if (file.size > maxBytes) {
    return `El archivo pesa ${Math.round(file.size / MB)} MB; el máximo es ${maxBytes / MB} MB.`;
  }
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!SNIFF[file.type](head)) {
    return 'El contenido del archivo no coincide con su extensión.';
  }
  return null;
}

interface PresignedUpload {
  url: string;
  fields: Record<string, string>;
  key: string;
}

/**
 * Uploads a file straight from the browser to the bucket's private incoming
 * area (the API only signs the request, so large videos never pass through
 * it), then asks the API to verify the real content and publish it. Resolves
 * with the file's public URL.
 */
export async function uploadFile(file: File, folder: UploadFolder, onProgress?: (pct: number) => void): Promise<string> {
  const signed = await apiFetch<PresignedUpload>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size, folder }),
  });

  const form = new FormData();
  Object.entries(signed.fields).forEach(([k, v]) => form.append(k, v));
  form.append('file', file); // must be the last field

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', signed.url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`El almacenamiento rechazó el archivo (${xhr.status})`));
    xhr.onerror = () => reject(new Error('No se pudo conectar con el almacenamiento (revisa el CORS del bucket)'));
    xhr.send(form);
  });

  const { publicUrl } = await apiFetch<{ publicUrl: string }>('/uploads/complete', {
    method: 'POST',
    body: JSON.stringify({ key: signed.key }),
  });
  return publicUrl;
}
