export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const TOKEN_KEY = 'jbskylens_dashboard_token';

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

export type ProjectCategory =
  | 'BODAS'
  | 'XV'
  | 'EVENTOS'
  | 'INMOBILIARIA'
  | 'INSPECCION'
  | 'TOURS360'
  | 'PRODUCCION';

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'BODAS',
  'XV',
  'EVENTOS',
  'INMOBILIARIA',
  'INSPECCION',
  'TOURS360',
  'PRODUCCION',
];

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
  category: ProjectCategory;
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
  links: Link[];
  published: boolean;
  sortOrder: number;
}

export interface Client {
  id: string;
  slug: string;
  name: string;
  organization: string;
  photoUrl: string;
  links: Link[];
  published: boolean;
  sortOrder: number;
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
  published: boolean;
  sortOrder: number;
}

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
    const message =
      typeof body?.message === 'string'
        ? body.message
        : Array.isArray(body?.message?.message)
          ? body.message.message.join(', ')
          : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
