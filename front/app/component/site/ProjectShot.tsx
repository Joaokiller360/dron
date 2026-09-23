'use client'

import { Shot } from './index';
import { projectCover, projectVideoUrl, videoSource } from './video';

type ProjectMedia = { coverUrl?: string | null; href?: string | null; mediaUrls?: string[] | null };

// Project card image: the cover, else the video's thumbnail, else the first
// frame of an uploaded video file
export default function ProjectShot({ project, title, className = '' }: { project: ProjectMedia; title: string; className?: string }) {
  const cover = projectCover(project);
  const video = videoSource(projectVideoUrl(project));
  if (!cover && video?.kind === 'file') {
    return (
      <div className={`jb-stripes overflow-hidden ${className}`}>
        <video src={`${video.src}#t=0.5`} muted playsInline preload="metadata" className="object-cover w-full h-full" />
      </div>
    );
  }
  return <Shot src={cover} alt={title} label={title} labelPosition="center" className={className} />;
}
