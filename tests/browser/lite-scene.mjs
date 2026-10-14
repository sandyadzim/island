import assert from 'node:assert/strict';

/** Cached scene restoration must not hide an image that was already decoded. */
export async function verifyLiteBfcache(page) {
  await page.waitForFunction(() =>
    document.querySelector('[data-scene-state="ready"]'),
  );
  const states = await page.evaluate(async () => {
    const states = [];
    const image = document.querySelector('[data-mobile-island]');
    const descriptor = Object.getOwnPropertyDescriptor(image, 'decode');
    const pending = [];
    // A previously decoded, still-complete image must not depend on another decode.
    image.decode = () => new Promise((resolve) => pending.push(resolve));
    try {
      for (let i = 0; i < 5; i++) {
        window.dispatchEvent(
          new PageTransitionEvent('pagehide', { persisted: true }),
        );
        window.dispatchEvent(
          new PageTransitionEvent('pageshow', { persisted: true }),
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        states.push(
          document.querySelector('[data-island-scene]').dataset.sceneState,
        );
      }
    } finally {
      if (descriptor) Object.defineProperty(image, 'decode', descriptor);
      else delete image.decode;
      pending.forEach((resolve) => resolve());
    }
    return states;
  });
  assert.deepEqual(states, Array(5).fill('ready'));
  return states;
}

/** Run with installMobileAudit injected before navigating to a touch-profile page. */
export async function verifyLiteScene(page, cycles = 30) {
  await page.waitForFunction(() =>
    document.querySelector('[data-scene-state="ready"]'),
  );
  const result = await page.evaluate(async (cycles) => {
    const root = document.querySelector('[data-explore-mode]');
    const scene = document.querySelector('[data-island-scene]');
    const frame = document.querySelector('.island-frame');
    const image = document.querySelector('[data-mobile-island]');
    const dialog = document.querySelector('[data-destination-dialog]');
    const audit = window.__mobileStabilityAudit;
    const initial = {
      profile: document.documentElement.dataset.experience,
      viewport: {
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
      },
      canvases: document.querySelectorAll('canvas').length,
      images: [...scene.querySelectorAll('img')].map((node) => node.currentSrc),
      effects: scene.querySelectorAll(
        '.scene-light-glow,.workshop-smoke,.island-clouds,.island-birds',
      ).length,
      animations: document.getAnimations().length,
      heroReveal: document.querySelector('[data-hero-reveal]') !== null,
      motionHidden:
        getComputedStyle(document.querySelector('[data-water-motion-toggle]'))
          .display === 'none',
      initialBounds: frame.getBoundingClientRect().toJSON(),
      sceneNodes: scene.querySelectorAll('*').length,
    };
    const click = (selector) =>
      document.querySelector(selector).dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          detail: 1,
        }),
      );
    const settle = async (element) => {
      await Promise.all(
        element
          .getAnimations()
          .map((animation) => animation.finished.catch(() => {})),
      );
    };
    const resourceNames = () =>
      performance.getEntriesByType('resource').map((entry) => entry.name);
    const requestsBefore = resourceNames();
    let cameraRuns = 0;
    let sheetRuns = 0;
    let registrationError = 0;
    for (let i = 0; i < cycles; i++) {
      click('[data-start-exploring]');
      const camera = frame.getAnimations()[0];
      if (camera) cameraRuns++;
      // Exercise both the start and end of the real WAAPI effect without a 650ms sleep per cycle.
      if (camera) {
        camera.pause();
        camera.currentTime = 325;
      }
      const art = image.getBoundingClientRect();
      const bounds = frame.getBoundingClientRect();
      registrationError = Math.max(
        registrationError,
        Math.abs(art.left - bounds.left),
        Math.abs(art.top - bounds.top),
        Math.abs(art.width - bounds.width),
      );
      frame.getAnimations().forEach((animation) => animation.finish());
      await settle(frame);
      click('.hero-navigation [data-explore-destination="contact"]');
      if (dialog.getAnimations().length) sheetRuns++;
      dialog.getAnimations().forEach((animation) => animation.finish());
      await settle(dialog);
      click('[data-dialog-close]');
      dialog.getAnimations().forEach((animation) => animation.finish());
      await settle(dialog);
      click('[data-back-to-intro]');
      if (frame.getAnimations().length) cameraRuns++;
      frame.getAnimations().forEach((animation) => animation.finish());
      await settle(frame);
    }
    const rafBefore = audit.rafRequests;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      initial,
      cycles,
      cameraRuns,
      sheetRuns,
      registrationError,
      mode: root.dataset.exploreMode,
      dialogClosed: !dialog.open,
      restoredBounds: frame.getBoundingClientRect().toJSON(),
      sceneNodes: scene.querySelectorAll('*').length,
      idleAnimations: document.getAnimations().length,
      idleRaf: audit.rafRequests - rafBefore,
      contexts: audit.contexts,
      uploads: audit.uploads,
      errors: audit.errors,
      extraRequests: resourceNames().slice(requestsBefore.length),
      allRequests: resourceNames(),
    };
  }, cycles);
  assert.equal(result.initial.profile, 'lite');
  assert.equal(result.initial.canvases, 0);
  assert.equal(result.initial.images.length, 2);
  assert.equal(result.initial.effects, 0);
  assert.equal(result.initial.animations, 0);
  assert.equal(result.initial.heroReveal, false);
  assert.equal(result.initial.motionHidden, true);
  assert.equal(result.cameraRuns, cycles * 2);
  assert.equal(result.sheetRuns, cycles);
  assert.ok(
    result.registrationError < 0.1,
    'Image and hit-region frame must move together',
  );
  assert.equal(result.sceneNodes, result.initial.sceneNodes);
  for (const key of ['left', 'top', 'width']) {
    assert.ok(
      Math.abs(result.restoredBounds[key] - result.initial.initialBounds[key]) <
        0.1,
      `Intro ${key} restores`,
    );
  }
  assert.equal(result.mode, 'intro');
  assert.equal(result.dialogClosed, true);
  assert.equal(result.idleAnimations, 0);
  assert.equal(result.idleRaf, 0);
  assert.equal(result.contexts, 0);
  assert.equal(result.uploads, 0);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.extraRequests, []);
  assert.equal(
    result.allRequests.some((url) =>
      /island-controller\.|hero-reveal\.|asset-0[1-7]|workshop-smoke-puff/.test(
        url,
      ),
    ),
    false,
  );
  return result;
}
