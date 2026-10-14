export type ExperienceProfile = 'full' | 'lite';

/** Self-contained so the same decision runs inline before paint and in tests. */
export function resolveExperienceProfile(
  match?: (query: string) => { readonly matches: boolean },
): ExperienceProfile {
  try {
    if (!match) return 'lite';
    return match('(pointer: coarse)').matches || match('(hover: none)').matches
      ? 'lite'
      : 'full';
  } catch {
    return 'lite';
  }
}

export function readExperienceProfile(): ExperienceProfile {
  return document.documentElement.dataset.experience === 'full'
    ? 'full'
    : 'lite';
}

/** Saved ocean Pause belongs to desktop; OS reduced motion applies everywhere. */
export function uiMotionOff(
  profile: ExperienceProfile,
  reduced: boolean,
  desktopPaused: boolean,
): boolean {
  return reduced || (profile === 'full' && desktopPaused);
}
