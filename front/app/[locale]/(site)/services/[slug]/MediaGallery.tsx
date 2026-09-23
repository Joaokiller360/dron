'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Instagram } from 'lucide-react';

export interface GalleryItem {
  kind: 'video' | 'image';
  src: string;
  poster?: string;
  label?: string;
  credit?: string | null;
  creditLabel?: string;
}

// Row height the gallery aims for, and the tallest any single item may get
const TARGET_HEIGHT = 260;
const MAX_HEIGHT = 560;
const DEFAULT_RATIO = 16 / 9;

// Muted, inline, and only playing while on screen. `muted` is set on the
// element directly: React doesn't render it as an HTML attribute on the
// server, and without it browsers block autoplay.
function AutoVideo({
  src,
  poster,
  label,
  onRatio,
}: {
  src: string;
  poster?: string;
  label?: string;
  onRatio: (r: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    // Metadata may have loaded before hydration, when onLoadedMetadata wasn't attached yet
    if (video.readyState >= 1 && video.videoWidth) onRatio(video.videoWidth / video.videoHeight);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [onRatio]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      className="block object-cover w-full h-full"
      onLoadedMetadata={(e) => {
        const v = e.currentTarget;
        if (v.videoWidth && v.videoHeight) onRatio(v.videoWidth / v.videoHeight);
      }}
    />
  );
}

function RatioImage({ src, label, onRatio }: { src: string; label?: string; onRatio: (r: number) => void }) {
  const ref = useRef<HTMLImageElement>(null);
  const report = (img: HTMLImageElement) => {
    if (img.naturalWidth && img.naturalHeight) onRatio(img.naturalWidth / img.naturalHeight);
  };
  useEffect(() => {
    // Cached images can finish loading before hydration
    if (ref.current?.complete) report(ref.current);
  });
  return (
    <img
      ref={ref}
      src={src}
      alt={label ?? ''}
      loading="lazy"
      className="block object-cover w-full h-full"
      onLoad={(e) => report(e.currentTarget)}
    />
  );
}

export default function MediaGallery({ items }: { items: GalleryItem[] }) {
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const setRatio = useCallback(
    (i: number, r: number) => setRatios((prev) => (prev[i] === r ? prev : { ...prev, [i]: r })),
    [],
  );
  const callbacks = useMemo(() => items.map((_, i) => (r: number) => setRatio(i, r)), [items, setRatio]);

  return (
    <div className="flex flex-wrap gap-4">
      {items.map((m, i) => {
        const r = ratios[i] ?? DEFAULT_RATIO;
        return (
          <figure
            key={`${m.src}-${i}`}
            className="flex flex-col min-w-0 gap-2 m-0"
            // Grow in proportion to the aspect ratio so items sharing a row end
            // up the same height; cap the width so nothing gets taller than MAX_HEIGHT
            style={{ flex: `${r} 1 ${Math.round(r * TARGET_HEIGHT)}px`, maxWidth: `${Math.round(r * MAX_HEIGHT)}px` }}
          >
            <div
              className="overflow-hidden rounded-2xl border border-white/[.08] jb-stripes"
              style={{ aspectRatio: String(r) }}
            >
              {m.kind === 'video' ? (
                <AutoVideo src={m.src} poster={m.poster} label={m.label} onRatio={callbacks[i]} />
              ) : (
                <RatioImage src={m.src} label={m.label} onRatio={callbacks[i]} />
              )}
            </div>
            {m.credit && (
              <figcaption>
                <a
                  href={m.credit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-jb-muted hover:text-jb-mint"
                >
                  <Instagram size={13} />
                  {m.creditLabel}
                </a>
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
