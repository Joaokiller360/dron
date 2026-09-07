'use client'

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function ImagePreview({ url }: { url: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const broken = failedUrl === url;

  if (!url.trim() || broken) {
    return (
      <div className="flex items-center justify-center w-full h-32 shrink-0 rounded-xl bg-honeydew-900 text-white/30 sm:w-32">
        <ImageOff size={22} />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="preview"
      onError={() => setFailedUrl(url)}
      className="object-cover w-full h-32 shrink-0 rounded-xl bg-honeydew-900 sm:w-32"
    />
  );
}
