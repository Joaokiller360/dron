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

export interface Stats {
  messages: { total: number; new: number };
  projects: { total: number; published: number };
  services: { total: number; published: number };
  team: { total: number; published: number };
  clients: { total: number; published: number };
  testimonials: { total: number; published: number };
  promotions: { total: number; published: number };
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
  | 'venues';

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
            : `Request failed with status ${res.status}`;
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

export type UploadFolder = 'projects' | 'services' | 'team' | 'clients' | 'misc';

interface PresignedUpload {
  url: string;
  fields: Record<string, string>;
  publicUrl: string;
}

/**
 * Uploads a file straight from the browser to the S3 bucket: the API only
 * signs the request, so large videos never pass through it. Resolves with the
 * file's public URL.
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

  return signed.publicUrl;
}
