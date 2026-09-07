import { Instagram, PhoneCall, Globe, Facebook, Music2 } from 'lucide-react';

export interface DbLink {
  platform: string;
  url: string;
}

const PLATFORM_ICON: Record<string, React.ReactNode> = {
  instagram: <Instagram size={24} strokeWidth={2} />,
  whatsapp: <PhoneCall size={24} strokeWidth={2} />,
  website: <Globe size={24} strokeWidth={2} />,
  facebook: <Facebook size={24} strokeWidth={2} />,
  tiktok: <Music2 size={24} strokeWidth={2} />,
};

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  whatsapp: 'Contacto',
  website: 'Website',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

export function linksToButtons(links: DbLink[] = []) {
  return links.map((link, index) => ({
    id: index + 1,
    href: link.url,
    active: true,
    name: PLATFORM_LABEL[link.platform] ?? link.platform,
    icon: PLATFORM_ICON[link.platform] ?? <Globe size={24} strokeWidth={2} />,
  }));
}
