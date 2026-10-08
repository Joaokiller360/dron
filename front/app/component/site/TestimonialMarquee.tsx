import type { PublicTestimonial } from './api';
import TestimonialCard from './TestimonialCard';

// Cards in each half of the track: enough to cover a wide screen, so the loop never shows a gap
const MIN_PER_HALF = 6;
const SECONDS_PER_CARD = 9;

/**
 * Testimonials sliding sideways in an endless loop. The track holds the list
 * twice and moves by half its width (logo-cloud keyframes), so the end meets
 * the start seamlessly. Pauses on hover/focus; with reduced motion it becomes
 * a plain horizontal scroller.
 */
export default function TestimonialMarquee({ testimonials }: { testimonials: PublicTestimonial[] }) {
  if (testimonials.length < 2) {
    return (
      <div className="max-w-[560px]">
        {testimonials.map((q) => (
          <TestimonialCard key={q.id} testimonial={q} />
        ))}
      </div>
    );
  }

  const reps = Math.ceil(MIN_PER_HALF / testimonials.length);
  const half = Array.from({ length: reps }, () => testimonials).flat();
  const track = [...half, ...half];

  return (
    <div className="group overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
      <ul
        className="flex w-max p-0 m-0 list-none animate-logo-cloud group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${half.length * SECONDS_PER_CARD}s` }}
      >
        {track.map((q, i) => (
          // Only the first copy of each testimonial is read by screen readers
          <li
            key={i}
            aria-hidden={i >= testimonials.length || undefined}
            className={`flex shrink-0 w-[340px] max-w-[82vw] pr-4 ${i >= testimonials.length ? 'motion-reduce:hidden' : ''}`}
          >
            <TestimonialCard testimonial={q} />
          </li>
        ))}
      </ul>
    </div>
  );
}
