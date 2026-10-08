import type { PublicTestimonial } from './api';

// Quote card with the author's photo (or the client's logo/photo the API
// resolved), falling back to their initials
export default function TestimonialCard({ testimonial: q }: { testimonial: PublicTestimonial }) {
  const initials = q.author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  // A client quoting itself has the same name as author and company: show it once
  const org = q.org && q.org.trim().toLowerCase() !== q.author.trim().toLowerCase() ? q.org : null;
  return (
    <figure className="flex flex-col w-full gap-5 p-[26px] m-0 rounded-2xl bg-jb-card border border-white/[.08]">
      <blockquote className="m-0 text-[16.5px] leading-[1.6] text-jb-text text-pretty">“{q.quote}”</blockquote>
      <figcaption className="flex items-center gap-3 mt-auto">
        {q.photoUrl ? (
          <img src={q.photoUrl} alt={q.author} loading="lazy" className="flex-none object-cover w-11 h-11 rounded-full border border-white/[.12] bg-jb-well" />
        ) : (
          <span aria-hidden="true" className="flex items-center justify-center flex-none w-11 h-11 rounded-full bg-[rgba(52,209,122,.12)] font-mono text-[13px] font-bold text-jb-accent">
            {initials}
          </span>
        )}
        <span className="flex flex-col gap-[3px] min-w-0">
          <span className="text-[14.5px] font-bold text-white">{q.author}</span>
          {org && <span className="font-mono text-[11.5px] text-jb-muted">{org}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
