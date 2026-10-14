import assert from 'node:assert/strict';

/** Verify actual composition, including full-viewport background and fixed header. */
export async function verifyResponsiveShell(page) {
  await page.waitForFunction(() =>
    document.querySelector('[data-scene-state="ready"]'),
  );
  await page.evaluate(() => document.fonts.ready);
  const read = () => {
    const rect = (selector) =>
      document.querySelector(selector).getBoundingClientRect().toJSON();
    return {
      width: innerWidth,
      height: innerHeight,
      maxWidth:
        96 * parseFloat(getComputedStyle(document.documentElement).fontSize),
      stacked: !matchMedia('(min-width: 1100px) and (min-height: 720px)')
        .matches,
      shell: rect('.portfolio-shell'),
      header: rect('.layout-header'),
      hero: rect('.hero-card'),
      island: rect('.island-frame'),
      background: rect('.island-environment'),
      overflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    };
  };
  const intro = await page.evaluate(read);
  assert.ok(intro.shell.width <= intro.maxWidth + 1, 'Shell must cap at 96rem');
  assert.ok(
    intro.background.left <= 1 && intro.background.right >= intro.width - 1,
    'Ocean must span the viewport',
  );
  assert.ok(
    intro.background.top <= 1 && intro.background.bottom >= intro.height - 1,
    'Ocean must cover short and tall viewports',
  );
  assert.ok(intro.overflow <= 1, 'Composition must not scroll horizontally');
  if (intro.stacked)
    assert.ok(
      intro.hero.bottom <= intro.island.top + 1,
      'Card must precede the island in every stacked layout',
    );
  else {
    assert.ok(
      intro.hero.left >= intro.shell.left &&
        intro.island.right <= intro.shell.right + 1,
    );
  }
  await page.click('[data-start-exploring]');
  await page.waitForFunction(
    () => !document.querySelector('[data-camera-transition]'),
  );
  const explore = await page.evaluate(read);
  assert.ok(
    explore.header.width <= explore.maxWidth + 1,
    'Fixed Explore header must also cap at 96rem',
  );
  assert.ok(
    explore.header.left >= explore.shell.left - 1 &&
      explore.header.right <= explore.shell.right + 1,
  );
  await page.click('[data-back-to-intro]');
  await page.waitForFunction(
    () => !document.querySelector('[data-camera-transition]'),
  );
  const returned = await page.evaluate(read);
  for (const key of ['left', 'top', 'width'])
    assert.ok(
      Math.abs(returned.island[key] - intro.island[key]) < 1,
      `Intro ${key} must restore`,
    );
  return { intro, explore, returned };
}
