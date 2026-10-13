/** Shared, interruptible motion for the homepage's native dialogs. */
export function initDialogMotion(dialog: HTMLDialogElement, sheet = false) {
  let animations: Animation[] = [];

  function cancel() {
    animations.forEach((animation) => animation.cancel());
    animations = [];
  }

  function play(entering: boolean) {
    if (
      document.querySelector<HTMLElement>('[data-water-motion-toggle]')?.dataset
        .motionPreference === 'off'
    ) {
      cancel();
      return Promise.resolve(true);
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileSheet = sheet && matchMedia('(max-width: 600px)').matches;
    const styles = getComputedStyle(dialog);
    const backdrop = getComputedStyle(dialog, '::backdrop');
    const interrupted = animations.length > 0;
    const current = { opacity: styles.opacity, transform: styles.transform };
    const currentBackdrop = backdrop.opacity;
    cancel();
    const hidden = {
      opacity: mobileSheet && !reduced ? 1 : 0,
      transform: reduced
        ? 'none'
        : mobileSheet
          ? 'translateY(100%)'
          : 'translateY(12px)',
    };
    const visible = { opacity: 1, transform: 'none' };
    const easing = styles
      .getPropertyValue(mobileSheet ? '--ease-drawer' : '--ease-out')
      .trim();
    const options = {
      duration: reduced ? 120 : mobileSheet && entering ? 280 : 220,
      easing,
      fill: 'forwards' as FillMode,
    };
    const surface = dialog.animate(
      [
        interrupted ? current : entering ? hidden : visible,
        entering ? visible : hidden,
      ],
      options,
    );
    const scrim = dialog.animate(
      [
        { opacity: interrupted ? currentBackdrop : entering ? 0 : 1 },
        { opacity: entering ? 1 : 0 },
      ],
      { ...options, pseudoElement: '::backdrop' },
    );
    animations = [surface, scrim];
    // The surface owns completion; pseudo-element finish events can lag a frame.
    void scrim.finished.catch(() => {});
    return surface.finished.then(
      () => {
        if (animations[0] !== surface) return false;
        if (entering) cancel();
        return true;
      },
      () => false,
    );
  }

  return { play, cancel };
}
