import global from './global';

let query: MediaQueryList | null | undefined;

// `matches` stays live on the MediaQueryList, so the object is resolved once and read on demand.
// Resolving lazily keeps the module import-safe in SSR and in environments without matchMedia.
export default function prefersReducedMotion(): boolean {
  if (typeof query === 'undefined') {
    query =
      typeof global.matchMedia === 'function'
        ? global.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
  }

  return query?.matches ?? false;
}
