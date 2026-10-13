import assert from 'node:assert/strict';

/** The complete Intro frame must fit above the browser toolbar on portrait phones. */
export async function verifyMobileIntro(page) {
  await page.waitForFunction(() => document.querySelector('[data-scene-state="ready"]')
    && [...document.querySelectorAll('[data-asset-state]')].every(layer => layer.dataset.assetState === 'ready')
    && document.querySelector('.island-reveal').getAnimations().length === 0);
  const bounds = await page.evaluate(() => ({
    height: innerHeight,
    width: innerWidth,
    frame: document.querySelector('.island-frame').getBoundingClientRect().toJSON(),
    card: document.querySelector('.hero-card').getBoundingClientRect().toJSON(),
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(bounds.frame.bottom <= bounds.height - 12,
    `Complete island must fit above the toolbar: ${JSON.stringify(bounds)}`);
  assert.ok(bounds.frame.top >= bounds.card.bottom, 'Island must not overlap the card');
  assert.ok(bounds.scrollWidth <= bounds.width, 'Intro must not scroll horizontally');
  return bounds;
}

/** Toolbar/gesture resizing must reuse the GPU buffer rather than reallocating it. */
export async function verifyWaterResize(page) {
  await page.waitForFunction(() => document.querySelector('[data-water-state]'));
  const result = await page.evaluate(async () => {
    const canvas = document.querySelector('[data-ocean-water]');
    const initial = { width: canvas.width, height: canvas.height };
    const writes = [];
    for (const key of ['width', 'height']) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, key);
      Object.defineProperty(canvas, key, {
        configurable: true,
        get() { return descriptor.get.call(this); },
        set(value) { writes.push({ key, value }); descriptor.set.call(this, value); },
      });
    }
    const previous = canvas.getAttribute('style');
    try {
      for (const height of [720, 740, 760, 780, 800, 780, 760, 740, 720, 696]) {
        canvas.style.height = `${height}px`;
        window.dispatchEvent(new Event('resize'));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      return { initial, final: { width: canvas.width, height: canvas.height }, writes };
    } finally {
      if (previous === null) canvas.removeAttribute('style'); else canvas.setAttribute('style', previous);
      delete canvas.width;
      delete canvas.height;
    }
  });
  assert.equal(result.writes.length, 0,
    `Gesture resizing must not reallocate the drawing buffer: ${JSON.stringify(result)}`);
  return result;
}

/** Touch pauses actual WebGL draws and ambient animation without saving Pause. */
export async function verifyWaterGestures(page) {
  await page.waitForFunction(() => document.querySelector('[data-water-state="running"]'));
  const paused = await page.evaluate(async () => {
    const canvas = document.querySelector('[data-ocean-water]');
    const gl = canvas.getContext('webgl');
    const original = gl.drawArrays;
    let draws = 0;
    gl.drawArrays = function (...args) { draws++; return original.apply(this, args); };
    try {
      window.dispatchEvent(new Event('touchstart'));
      for (let i = 0; i < 6; i++) await new Promise(resolve => requestAnimationFrame(resolve));
      return {
        draws,
        state: canvas.dataset.waterState,
        preference: document.querySelector('[data-water-motion-toggle]').dataset.motionPreference,
        runningAmbient: document.querySelector('.island-camera').getAnimations({ subtree: true })
          .filter(animation => animation.playState === 'running').length,
      };
    } finally {
      gl.drawArrays = original;
      window.dispatchEvent(new Event('touchend'));
    }
  });
  assert.equal(paused.draws, 0, 'Water must stop drawing while the finger is down');
  assert.equal(paused.state, 'paused');
  assert.equal(paused.preference, 'on', 'A gesture must not overwrite the saved motion preference');
  assert.equal(paused.runningAmbient, 0, 'Ambient animations must also pause');
  await page.waitForFunction(() => document.querySelector('[data-water-state="running"]'));
  // A user who selected Pause must remain paused after scroll momentum settles.
  await page.click('[data-water-motion-toggle]');
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('scroll'));
    await new Promise(resolve => setTimeout(resolve, 250));
  });
  assert.equal(await page.evaluate(() => document.querySelector('[data-ocean-water]').dataset.waterState), 'paused');
  await page.click('[data-water-motion-toggle]');
  return paused;
}
