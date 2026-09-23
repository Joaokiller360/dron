'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LottieClip({ name }: { name: string }) {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/[.08] jb-stripes">
      <DotLottieReact src={`/animation/${name}.json`} loop autoplay className="absolute inset-0 w-full h-full" />
    </div>
  );
}
