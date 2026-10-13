import assert from 'node:assert/strict';

/** Run on a ready Explore page with motion enabled. Count actual WebGL draws. */
export async function verifyDialogMotion(page) {
  const result = await page.evaluate(async () => {
    const scene = document.querySelector('[data-island-scene]');
    const dialog = document.querySelector('[data-destination-dialog]');
    const link = document.querySelector(
      '.hero-navigation [data-explore-destination="about"]',
    );
    const close = dialog.querySelector('[data-dialog-close]');
    const toggle = document.querySelector('[data-water-motion-toggle]');
    const originalDraw = WebGLRenderingContext.prototype.drawArrays;
    const originalPreference = localStorage.getItem('island-water-motion');
    let draws = 0;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      draws++;
      return originalDraw.apply(this, args);
    };
    const settle = async () => {
      await Promise.all(
        dialog.getAnimations().map((a) => a.finished.catch(() => {})),
      );
      await new Promise((resolve) => requestAnimationFrame(resolve));
    };
    const sample = async (duration = 250) => {
      const before = draws;
      await new Promise((resolve) => setTimeout(resolve, duration));
      return draws - before;
    };
    try {
      const initial = await sample();
      link.click();
      await settle();
      const paused = await sample();
      const pausedAmbient = scene
        .getAnimations({ subtree: true })
        .every((a) => a.playState !== 'running');
      const preferenceUnchanged =
        localStorage.getItem('island-water-motion') === originalPreference &&
        toggle.dataset.motionPreference === 'on';
      close.click();
      await settle();
      // Resuming many composited layers can delay the first draw on software GPUs.
      const resumed = await sample(1000);
      // Native close followed immediately by reopen must retain the reading pause.
      link.click();
      await settle();
      dialog.close();
      link.click();
      await settle();
      const reopened = dialog.open && (await sample()) === 0;
      dialog.close();
      await settle();
      const nativeResumed = await sample(1000);
      toggle.click();
      link.click();
      await settle();
      close.click();
      await settle();
      const savedPause =
        (await sample()) === 0 && toggle.dataset.motionPreference === 'off';
      return {
        initial,
        paused,
        pausedAmbient,
        preferenceUnchanged,
        resumed,
        reopened,
        nativeResumed,
        savedPause,
      };
    } finally {
      if (dialog.open) {
        close.click();
        await settle();
      }
      if (toggle.dataset.motionPreference === 'off') toggle.click();
      if (originalPreference === null)
        localStorage.removeItem('island-water-motion');
      else localStorage.setItem('island-water-motion', originalPreference);
      WebGLRenderingContext.prototype.drawArrays = originalDraw;
    }
  });
  assert.ok(result.initial > 0, 'Ocean must run before dialog opens.');
  assert.equal(result.paused, 0, 'Ocean must stop drawing while reading.');
  assert.ok(result.resumed > 0, 'Ocean must resume after dialog closes.');
  assert.ok(
    result.nativeResumed > 0,
    'External native close must resume motion.',
  );
  for (const key of [
    'pausedAmbient',
    'preferenceUnchanged',
    'reopened',
    'savedPause',
  ]) {
    assert.equal(result[key], true, key);
  }
  return result;
}
