import type { Destination } from '../components/island/scene-config.ts';

const destinations = new Set<Destination>(['home', 'about', 'projects', 'skills', 'experience', 'contact']);
export function destinationFromHash(hash: string): Destination | null {
  if (!hash || hash === '#') return 'home';
  try {
    const destination = decodeURIComponent(hash.slice(1)) as Destination;
    return destinations.has(destination) ? destination : null;
  } catch { return null; }
}

/** Same-section activation focuses content but must not grow browser history. */
export function navigationHash(currentHash: string, destination: Destination): string | null {
  return destinationFromHash(currentHash) === destination ? null : `#${destination}`;
}
