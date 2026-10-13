import assert from 'node:assert/strict';

/** Integration regression for native dialogs on a settled Explore page. */
export async function verifyDestinationDialogs(page) {
  const result = await page.evaluate(async () => {
    const dialog = document.querySelector('[data-destination-dialog]');
    const root = document.querySelector('[data-explore-mode]');
    const title = document.querySelector('[data-dialog-title]');
    const body = document.querySelector('[data-dialog-body]');
    const close = document.querySelector('[data-dialog-close]');
    const url = location.href;
    const overflow = document.documentElement.style.overflow;
    const settle = async () => {
      await Promise.all(
        dialog.getAnimations().map((item) => item.finished.catch(() => {})),
      );
      await new Promise((resolve) => requestAnimationFrame(resolve));
    };
    const click = (element) =>
      element.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }),
      );
    const paths = [];
    for (const link of document.querySelectorAll(
      '[data-explore-destination]',
    )) {
      const targets = link.hasAttribute('data-landmark')
        ? [
            link.querySelector('.landmark-marker'),
            link.querySelector('polygon'),
          ]
        : [link];
      for (const target of targets) {
        click(target);
        await settle();
        paths.push({
          destination: link.dataset.exploreDestination,
          open: dialog.open,
          section: dialog.querySelector('[data-dialog-section]:not([hidden])')
            ?.dataset.dialogSection,
          focus: document.activeElement === title,
          locked: document.documentElement.style.overflow === 'hidden',
          urlStable: location.href === url,
        });
        body.scrollTop = 120;
        click(close);
        await settle();
        paths.at(-1).restored = document.activeElement === link && !dialog.open;
      }
    }
    const project = document.querySelector(
      '.hero-navigation [data-explore-destination="projects"]',
    );
    click(project);
    await settle();
    const header = dialog.querySelector('.island-dialog-header');
    const headerTop = header.getBoundingClientRect().top;
    body.scrollTop = body.scrollHeight;
    const contentOnlyScroll =
      body.scrollTop > 0 &&
      dialog.scrollTop === 0 &&
      Math.abs(header.getBoundingClientRect().top - headerTop) < 0.1;
    click(close);
    click(project);
    await settle();
    const rapidReopen =
      dialog.open && document.activeElement === title && body.scrollTop === 0;
    click(close);
    await settle();
    // A modified click must remain available to native link navigation.
    let modifiedPrevented;
    project.addEventListener(
      'click',
      (event) => {
        modifiedPrevented = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );
    project.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
      }),
    );
    click(project);
    await settle();
    const rect = dialog.getBoundingClientRect();
    const pointer = (type, x, y) =>
      dialog.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerId: 7,
          clientX: x,
          clientY: y,
        }),
      );
    pointer('pointerdown', rect.left + 10, rect.top + 10);
    pointer('pointerup', 0, 0);
    const dragSafe = dialog.open;
    pointer('pointerdown', 0, 0);
    pointer('pointerup', 0, 0);
    await settle();
    const backdropClosed = !dialog.open;
    return {
      paths,
      rapidReopen,
      contentOnlyScroll,
      modifiedPrevented,
      dragSafe,
      backdropClosed,
      scrollRestored: document.documentElement.style.overflow === overflow,
      stillExplore: root.dataset.exploreMode === 'explore',
      urlStable: location.href === url,
    };
  });
  assert.equal(result.paths.length, 15);
  for (const path of result.paths) {
    assert.equal(path.section, path.destination);
    for (const key of ['open', 'focus', 'locked', 'urlStable', 'restored'])
      assert.equal(path[key], true, `${path.destination}: ${key}`);
  }
  assert.equal(result.modifiedPrevented, false);
  for (const key of [
    'rapidReopen',
    'contentOnlyScroll',
    'dragSafe',
    'backdropClosed',
    'scrollRestored',
    'stillExplore',
    'urlStable',
  ])
    assert.equal(result[key], true, key);
  await page.focus('.hero-navigation [data-explore-destination="about"]');
  await page.keyboard.press('Enter');
  await page.waitForFunction(
    () => document.querySelector('[data-destination-dialog]').open,
  );
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
    assert.equal(
      await page.evaluate(() =>
        document
          .querySelector('[data-destination-dialog]')
          .contains(document.activeElement),
      ),
      true,
    );
  }
  await page.keyboard.press('Escape');
  await page.waitForFunction(
    () => !document.querySelector('[data-destination-dialog]').open,
  );
  assert.deepEqual(
    await page.evaluate(() => ({
      mode: document.querySelector('[data-explore-mode]').dataset.exploreMode,
      focus: document.activeElement.dataset.exploreDestination,
    })),
    { mode: 'explore', focus: 'about' },
  );
  await page.keyboard.press('Escape');
  assert.equal(
    await page.evaluate(
      () => document.querySelector('[data-explore-mode]').dataset.exploreMode,
    ),
    'intro',
  );
  await page.click('[data-start-exploring]');
  await page.waitForFunction(
    () => document.querySelector('.island-frame').getAnimations().length === 0,
  );
  return result;
}
