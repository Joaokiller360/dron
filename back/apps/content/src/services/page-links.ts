import { SAFE_HREF_PATTERN } from '@app/common/text-patterns';

// Fields of the PageServices tree that end up in href/src attributes on the public site
const URL_KEYS = new Set(['href', 'imagen', 'video', 'urlImg', 'src']);
const MAX_DEPTH = 12;

/**
 * Paths of the links in a service `page` blob that aren't http(s) URLs or
 * site paths (javascript:, data:, //host…). `keywordLink` values are links too.
 */
export function unsafePageLinks(value: unknown, path = 'page', depth = 0): string[] {
  if (value === null || typeof value !== 'object' || depth > MAX_DEPTH) return [];
  const bad: string[] = [];
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const childPath = Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`;
    const isLink = URL_KEYS.has(key) || path.endsWith('.keywordLink');
    if (isLink && typeof child === 'string') {
      if (child !== '' && !SAFE_HREF_PATTERN.test(child)) bad.push(childPath);
    } else {
      bad.push(...unsafePageLinks(child, childPath, depth + 1));
    }
  }
  return bad;
}
