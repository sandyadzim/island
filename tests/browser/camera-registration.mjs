import assert from 'node:assert/strict';

/** Run against the live Astro page through Ego Browser. Tests artwork, not just the camera box. */
export async function verifyCameraRegistration(page) {
  await page.waitForFunction(() =>
    document.querySelector('[data-scene-state="ready"]'),
  );
  const result = await page.evaluate(async () => {
    const root = document.querySelector('.island-scene');
    const frame = document.querySelector('.island-frame');
    const stage = document.querySelector('.island-responsive-scale');
    const read = () => {
      const rect = frame.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        layoutWidth: parseFloat(getComputedStyle(frame).width),
        scale: parseFloat(root.style.getPropertyValue('--scene-scale')),
        artworkRatio: stage.getBoundingClientRect().width / rect.width,
      };
    };
    const click = (selector) =>
      document.querySelector(selector).dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          detail: 1,
        }),
      );
    const settle = async () => {
      await Promise.all(
        frame
          .getAnimations()
          .map((animation) => animation.finished.catch(() => {})),
      );
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    };
    const initial = read();
    const cycles = [];
    for (let i = 0; i < 3; i++) {
      click('[data-start-exploring]');
      await settle();
      const explore = read();
      click('[data-back-to-intro]');
      await settle();
      cycles.push({ explore, returned: read() });
    }
    return { initial, cycles };
  });
  for (const { explore, returned } of result.cycles) {
    for (const pose of [explore, returned]) {
      assert.ok(
        Math.abs(pose.scale - Math.min(1, pose.layoutWidth / 1536)) < 0.00001,
        `Artwork scale must follow layout width: ${JSON.stringify(pose)}`,
      );
      assert.ok(
        Math.abs(pose.artworkRatio - result.initial.artworkRatio) < 0.001,
        'Artwork must keep its registration relative to the camera frame',
      );
    }
    assert.ok(
      Math.abs(returned.width - result.initial.width) < 0.1,
      'Intro width must restore exactly',
    );
    assert.ok(
      Math.abs(returned.left - result.initial.left) < 0.1,
      'Intro horizontal position must restore exactly',
    );
    assert.ok(
      Math.abs(returned.top - result.initial.top) < 0.1,
      'Intro vertical position must restore exactly',
    );
  }
  return result;
}
