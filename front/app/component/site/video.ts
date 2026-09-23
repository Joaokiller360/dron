// Turns a pasted video link (YouTube, Instagram, TikTok, Vimeo, Facebook or a
// direct .mp4 / Cloudinary video) into something the site can play inline.

export type VideoSource =
  | { kind: 'iframe'; src: string; vertical: boolean }
  | { kind: 'file'; src: string };

const YOUTUBE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/;
const CLOUDINARY_VIDEO = /res\.cloudinary\.com\/.+\/video\/upload\//;

export function videoSource(url?: string | null): VideoSource | null {
  const u = url?.trim();
  if (!u) return null;
  let m: RegExpMatchArray | null;

  if ((m = u.match(YOUTUBE))) {
    return { kind: 'iframe', src: `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`, vertical: u.includes('/shorts/') };
  }
  if ((m = u.match(/instagram\.com\/(?:[\w.]+\/)?(p|reels?|tv)\/([\w-]+)/))) {
    const type = m[1] === 'reels' ? 'reel' : m[1];
    return { kind: 'iframe', src: `https://www.instagram.com/${type}/${m[2]}/embed`, vertical: true };
  }
  if ((m = u.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/))) {
    return { kind: 'iframe', src: `https://www.tiktok.com/embed/v2/${m[1]}`, vertical: true };
  }
  if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/))) {
    return { kind: 'iframe', src: `https://player.vimeo.com/video/${m[1]}?autoplay=1`, vertical: false };
  }
  if (/(?:facebook\.com\/|fb\.watch\/)/.test(u)) {
    return {
      kind: 'iframe',
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&autoplay=true`,
      vertical: /\/reel\//.test(u),
    };
  }
  if (/\.(mp4|webm|mov)(\?|#|$)/i.test(u) || CLOUDINARY_VIDEO.test(u)) {
    return { kind: 'file', src: u };
  }
  return null;
}

// Still image for a video link when no cover was uploaded (only providers that
// expose one without an API key)
export function videoThumbnail(url?: string | null): string | null {
  const u = url?.trim();
  if (!u) return null;
  const yt = u.match(YOUTUBE);
  if (yt) return `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`;
  if (CLOUDINARY_VIDEO.test(u)) return u.replace(/\.(mp4|webm|mov)(?=\?|#|$)/i, '.jpg');
  return null;
}

type WithVideo = { coverUrl?: string | null; href?: string | null; mediaUrls?: string[] | null };

// The link a project plays: the pasted video link, else its first uploaded clip
export function projectVideoUrl(p: WithVideo): string | null {
  if (videoSource(p.href)) return p.href!.trim();
  return p.mediaUrls?.find((u) => videoSource(u)) ?? null;
}

export function projectCover(p: WithVideo): string | null {
  return (
    p.coverUrl?.trim() ||
    [p.href, ...(p.mediaUrls ?? [])].map((u) => videoThumbnail(u)).find(Boolean) ||
    null
  );
}
