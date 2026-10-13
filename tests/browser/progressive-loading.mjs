import assert from 'node:assert/strict';

/** Real network failures must preserve loaded art and conventional content access. */
export async function verifyProgressiveFailures(page, baseURL = 'http://localhost:4321/') {
  const passed = [];
  await page.cdp('Network.enable');
  await page.cdp('Network.setCacheDisabled', { cacheDisabled: true });
  try {
    await page.goto(baseURL);
    await page.waitForFunction(() => [...document.querySelectorAll('[data-asset-state]')].length === 8
      && [...document.querySelectorAll('[data-asset-state]')].every(e => e.dataset.assetState === 'ready'));
    assert.equal(await page.evaluate(() => performance.getEntriesByType('resource')
      .filter(e => e.name.includes('island-base-fallback.webp')).length), 0, 'Normal loads must not request the backup.');
    for (const [filenames, id, destination, recovered = false] of [
      [['asset-07-sailboat-experience.webp'], 'ASSET-07', null],
      [['asset-02-creators-house-about.webp'], 'ASSET-02', 'projects'],
      [['asset-00-environment-background.webp'], 'ASSET-00', null],
      [['asset-01-clean-island-base.webp'], 'ASSET-01', null, true],
      [['asset-01-clean-island-base.webp', 'island-base-fallback.webp'], 'ASSET-01', null],
    ]) {
      await page.cdp('Network.setBlockedURLs', { urls: filenames.map(name => `*${name}`) });
      await page.goto(baseURL);
      await page.waitForFunction(() => {
        const layers = [...document.querySelectorAll('[data-asset-state]')];
        return layers.length === 8 && layers.every(e => e.dataset.assetState !== 'pending')
          && document.querySelector('[data-island-scene]').dataset.sceneState !== 'loading';
      });
      const result = await page.evaluate(({ id, destination }) => {
        const scene = document.querySelector('[data-island-scene]');
        const failed = scene.querySelector(`[data-asset-id="${id}"]`);
        const landmark = destination && scene.querySelector(`[data-landmark="${destination}"]`);
        return { state: scene.dataset.sceneState, failed: failed.dataset.assetState,
          terrain: getComputedStyle(scene.querySelector('.island-responsive-scale')).visibility,
          background: getComputedStyle(scene.querySelector('[data-asset-id="ASSET-00"]')).visibility,
          status: scene.querySelector('[data-scene-status]').textContent,
          backupRequested: performance.getEntriesByType('resource').some(e => e.name.includes('island-base-fallback.webp')),
          terrainWidth: scene.querySelector('[data-asset-id="ASSET-01"] img').naturalWidth,
          landmarkHidden: landmark ? landmark.hidden && landmark.inert : null };
      }, { id, destination });
      assert.equal(result.failed, recovered ? 'ready' : 'error');
      const missingTerrain = id === 'ASSET-01' && !recovered;
      assert.equal(result.state, missingTerrain ? 'error' : 'ready');
      assert.equal(result.terrain, missingTerrain ? 'hidden' : 'visible');
      assert.equal(result.background, id === 'ASSET-00' ? 'hidden' : 'visible');
      assert.equal(result.backupRequested, id === 'ASSET-01');
      if (recovered) assert.equal(result.terrainWidth, 768);
      assert.ok(result.status.includes('portfolio navigation'));
      if (destination) assert.equal(result.landmarkHidden, true);
      await page.click('[data-start-exploring]');
      await page.waitForFunction(() => document.querySelector('.island-frame').getAnimations().length === 0);
      await page.click('.hero-navigation [data-explore-destination="projects"]');
      await page.waitForFunction(() => document.querySelector('[data-destination-dialog]').open);
      assert.equal(await page.evaluate(() => document.querySelector('[data-dialog-title]').textContent), 'Projects');
      passed.push({ id, ...result });
    }
    return passed;
  } finally {
    await page.cdp('Network.setBlockedURLs', { urls: [] });
    await page.cdp('Network.setCacheDisabled', { cacheDisabled: false });
    await page.goto(baseURL);
  }
}
