import assert from 'node:assert/strict';

/** Inspect the actual painted region, including ancestor clipping, mid-camera. */
export async function verifyCameraContinuity(page) {
  await page.waitForFunction(() =>
    document.querySelector('[data-scene-state="ready"]'),
  );
  const result = await page.evaluate(async () => {
    const frame = document.querySelector('.island-frame');
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
    click('[data-start-exploring]');
    await settle();
    const previous = frame.getBoundingClientRect().toJSON();
    click('[data-back-to-intro]');
    const animation = frame.getAnimations()[0];
    if (!animation)
      throw new Error('Enable motion to exercise the return camera');
    animation.pause();
    const samples = [];
    for (const time of [0, 160, 325, 500, 649]) {
      animation.currentTime = time;
      const rect = frame.getBoundingClientRect();
      let painted = {
        left: Math.max(0, rect.left),
        right: Math.min(innerWidth, rect.right),
        top: Math.max(0, rect.top),
        bottom: Math.min(innerHeight, rect.bottom),
      };
      const visibleArea =
        Math.max(0, painted.right - painted.left) *
        Math.max(0, painted.bottom - painted.top);
      const clips = [];
      for (
        let parent = frame.parentElement;
        parent;
        parent = parent.parentElement
      ) {
        const style = getComputedStyle(parent);
        const clipX = ['hidden', 'clip', 'scroll', 'auto'].includes(
          style.overflowX,
        );
        const clipY = ['hidden', 'clip', 'scroll', 'auto'].includes(
          style.overflowY,
        );
        if (!clipX && !clipY) continue;
        const bounds = parent.getBoundingClientRect();
        clips.push(parent.className);
        if (clipX) {
          painted.left = Math.max(painted.left, bounds.left);
          painted.right = Math.min(painted.right, bounds.right);
        }
        if (clipY) {
          painted.top = Math.max(painted.top, bounds.top);
          painted.bottom = Math.min(painted.bottom, bounds.bottom);
        }
      }
      const paintedArea =
        Math.max(0, painted.right - painted.left) *
        Math.max(0, painted.bottom - painted.top);
      samples.push({
        time,
        rect: rect.toJSON(),
        clippedFraction: visibleArea ? 1 - paintedArea / visibleArea : 0,
        clips,
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      });
    }
    animation.finish();
    await settle();
    return {
      previous,
      samples,
      cleanup: !document.querySelector('[data-camera-transition]'),
    };
  });
  const start = result.samples[0].rect;
  assert.ok(
    Math.abs(start.top - result.previous.top) < 1 &&
      Math.abs(start.left - result.previous.left) < 1,
    'Return must start at the visible Explore pose',
  );
  for (const sample of result.samples) {
    assert.ok(
      sample.clippedFraction < 0.01,
      `Intro container cuts off ${(sample.clippedFraction * 100).toFixed(1)}% of the moving frame at ${sample.time}ms: ${JSON.stringify(sample)}`,
    );
    assert.ok(
      sample.horizontalOverflow <= 1,
      'Opening camera clipping must not create horizontal scrolling',
    );
  }
  assert.equal(
    result.cleanup,
    true,
    'Camera completion must restore ordinary clipping',
  );
  return result;
}
