import assert from 'node:assert/strict';

// Runs before application scripts. Only arrival animations are instrumented;
// frozen playback lets assertions reliably inspect a short entrance mid-flight.
function installProbe(config) {
  const probe = window.__arrivalProbe = { records: [], gates: [] };
  try { localStorage.setItem('island-water-motion', config.saved ?? 'on'); } catch {}
  if (config.blockStorage) {
    Storage.prototype.getItem = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
  }
  if (config.noWebGL) {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl' ? null : getContext.call(this, type, ...args);
    };
  }
  if (config.noObserver) window.IntersectionObserver = undefined;
  const nativeAnimate = Element.prototype.animate;
  if (config.noAnimation) Element.prototype.animate = undefined;
  else Element.prototype.animate = function (keyframes, options) {
    const arrival = this.matches('.island-reveal, .island-environment');
    if (arrival && config.failEnvironment && this.matches('.island-environment')) {
      throw new Error('Simulated arrival setup failure');
    }
    const animation = nativeAnimate.call(this, keyframes, options);
    if (arrival) {
      const record = { target: this.className, keyframes, options, animation, plays: 0,
        sceneState: document.querySelector('[data-island-scene]').dataset.sceneState };
      probe.records.push(record);
      const play = animation.play.bind(animation);
      animation.play = () => {
        record.plays++;
        play();
        if (config.freeze) { animation.pause(); animation.currentTime = 0; }
      };
    }
    return animation;
  };
  if (config.delayDecode || config.failDecode) {
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = async function () {
      await decode.call(this);
      if (!this.matches('.island-interaction > img')) return;
      if (config.failDecode) throw new Error('Simulated core image failure');
      await new Promise(resolve => {
        resolve.assetId = this.closest('[data-asset-id]').dataset.assetId;
        probe.gates.push(resolve);
      });
    };
  }
  probe.setHidden = hidden => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });
    document.dispatchEvent(new Event('visibilitychange'));
  };
  if (config.hidden) probe.setHidden(true);
}

/** Run through Ego Browser against a live Astro homepage. Restores saved Pause. */
export async function verifyIslandArrival(page, baseURL = 'http://localhost:4321/') {
  const originalPreference = await page.evaluate(() => localStorage.getItem('island-water-motion'));
  const passed = [];
  const settled = () => page.waitForFunction(() =>
    ['.island-reveal', '.island-environment'].every(selector =>
      document.querySelector(selector)?.getAnimations().length === 0));
  const ready = () => page.waitForFunction(() => document.querySelector('[data-scene-state="ready"]'));
  const records = () => page.evaluate(() => window.__arrivalProbe.records.map(record => ({
    target: record.target, keyframes: record.keyframes, duration: record.options.duration,
    easing: record.options.easing, sceneState: record.sceneState, plays: record.plays,
  })));
  const assertFinal = async () => {
    await settled();
    const poses = await page.evaluate(() => ['.island-reveal', '.island-environment'].map(selector => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      return { opacity: style.opacity, transform: style.transform, inline: element.getAttribute('style') };
    }));
    for (const pose of poses) {
      assert.equal(pose.opacity, '1');
      assert.equal(pose.transform, 'none');
      assert.equal(pose.inline, null, 'Temporary entrance styles must not survive');
    }
  };
  async function scenario(name, config, check, size = { width: 1440, height: 900 }) {
    await page.cdp('Emulation.setDeviceMetricsOverride', { ...size, deviceScaleFactor: 1, mobile: size.width < 600 });
    await page.cdp('Emulation.setEmulatedMedia', { features: [
      { name: 'prefers-reduced-motion', value: config.reduced ? 'reduce' : 'no-preference' },
    ] });
    const { identifier } = await page.cdp('Page.addScriptToEvaluateOnNewDocument', {
      source: `(${installProbe.toString()})(${JSON.stringify(config)})`,
    });
    try {
      await page.goto(baseURL);
      if (!config.delayDecode && !config.failDecode) await ready();
      await check();
      passed.push(name);
    } finally {
      await page.cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier });
    }
  }

  try {
    await page.cdp('Network.setCacheDisabled', { cacheDisabled: true });
    await scenario('cold load, starting poses, natural completion', {}, async () => {
      const entrance = await records();
      assert.equal(entrance.length, 2);
      assert.deepEqual(entrance.map(item => item.duration), [520, 320]);
      assert.ok(entrance.every(item => item.sceneState === 'loading'));
      assert.equal(entrance[0].keyframes[0].transform, 'translateY(12px)');
      assert.equal(entrance[1].keyframes[0].transform, undefined);
      const easing = await page.evaluate(() => getComputedStyle(document.querySelector('[data-island-scene]')).getPropertyValue('--ease-out').trim());
      assert.ok(entrance.every(item => item.easing === easing));
      await assertFinal();
    });
    await page.cdp('Network.setCacheDisabled', { cacheDisabled: false });
    await scenario('cached reload replays, Intro return does not', { freeze: true }, async () => {
      assert.equal((await records()).length, 2);
      await page.evaluate(() => window.__arrivalProbe.records.forEach(record => record.animation.finish()));
      await assertFinal();
      await page.click('[data-start-exploring]');
      await page.click('[data-back-to-intro]');
      assert.equal((await records()).length, 2);
      await assertFinal();
      await page.reload(); await ready();
      assert.equal((await records()).length, 2, 'A new document must reveal again');
    });
    await scenario('early Explore settles arrival without cancelling camera', { freeze: true }, async () => {
      await page.click('[data-start-exploring]');
      await assertFinal();
      await page.waitForFunction(() => document.querySelector('.island-frame').getAnimations().length === 0);
      assert.equal(await page.evaluate(() => document.querySelector('.portfolio-shell').dataset.exploreMode), 'explore');
      await page.click('[data-back-to-intro]');
      assert.equal((await records()).length, 2);
    });
    await scenario('Pause interrupts, Resume does not replay', { freeze: true }, async () => {
      await page.click('[data-water-motion-toggle]');
      await assertFinal();
      await page.click('[data-water-motion-toggle]');
      assert.equal((await records()).length, 2);
      await assertFinal();
    });
    for (const noWebGL of [false, true]) {
      await scenario(`saved Pause skips reveal (WebGL ${!noWebGL})`, { saved: 'off', noWebGL }, async () => {
        assert.equal((await records()).length, 0); await assertFinal();
      });
    }
    await scenario('reduced motion uses 120ms opacity only', { reduced: true, freeze: true }, async () => {
      const entrance = await records();
      assert.equal(entrance.length, 2);
      assert.ok(entrance.every(item => item.duration === 120 && item.keyframes.every(keyframe => !('transform' in keyframe))));
      await page.evaluate(() => window.__arrivalProbe.records.forEach(record => record.animation.finish()));
      await assertFinal();
    });
    await scenario('live reduced motion settles active reveal', { freeze: true }, async () => {
      await page.cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await assertFinal();
    });
    await scenario('hidden tab settles active reveal', { freeze: true }, async () => {
      await page.evaluate(() => window.__arrivalProbe.setHidden(true));
      await assertFinal();
      await page.evaluate(() => window.__arrivalProbe.setHidden(false));
      assert.equal((await records()).length, 2);
    });
    await scenario('hidden at readiness skips reveal', { hidden: true }, async () => {
      assert.equal((await records()).length, 0); await assertFinal();
    });
    await scenario('persisted page lifecycle never replays', { freeze: true }, async () => {
      await page.evaluate(() => {
        window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
        window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
      });
      await ready(); await assertFinal();
      assert.equal((await records()).length, 2);
    });
    for (const [name, config, count] of [
      ['unavailable WebGL still reveals', { noWebGL: true }, 2],
      ['blocked storage defaults to enabled', { blockStorage: true }, 2],
      ['missing animation API shows static scene', { noAnimation: true }, 0],
      ['partial animation setup failure shows static scene', { failEnvironment: true }, 1],
    ]) {
      await scenario(name, config, async () => {
        assert.equal((await records()).length, count); await assertFinal();
      });
    }
    await scenario('offscreen mobile waits, then reveals once', { freeze: true }, async () => {
      await page.waitForFunction(() => window.__arrivalProbe.records.length === 2);
      const entrance = await records();
      assert.equal(entrance[0].plays, 0);
      assert.equal(entrance[1].plays, 1);
      const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.evaluate(() => document.querySelector('.island-frame').scrollIntoView());
      await page.waitForFunction(() => window.__arrivalProbe.records[0].plays === 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollHeight), initialHeight);
      await page.evaluate(() => window.__arrivalProbe.records.forEach(record => record.animation.finish()));
      await assertFinal();
      await page.evaluate(() => window.scrollTo(0, 0));
      assert.equal((await records()).length, 2);
    }, { width: 390, height: 300 });
    await scenario('missing observer reveals offscreen immediately', { noObserver: true, freeze: true }, async () => {
      assert.equal((await records())[0].plays, 1);
      await page.evaluate(() => window.__arrivalProbe.records.forEach(record => record.animation.finish()));
      await assertFinal();
    }, { width: 390, height: 300 });
    await scenario('foundation reveals before delayed landmarks, which activate independently', { delayDecode: true, freeze: true }, async () => {
      await page.waitForFunction(() => window.__arrivalProbe.gates.length === 8);
      assert.equal(await page.evaluate(() => document.querySelector('[data-island-scene]').dataset.sceneState), 'loading');
      assert.equal((await records()).length, 0);
      await page.evaluate(() => {
        const gates = window.__arrivalProbe.gates;
        for (let index = gates.length - 1; index >= 0; index--) {
          if (['ASSET-00', 'ASSET-01'].includes(gates[index].assetId)) gates.splice(index, 1)[0]();
        }
      });
      await ready();
      assert.equal((await records()).length, 2);
      const foundation = await page.evaluate(() => ({
        pending: window.__arrivalProbe.gates.length,
        stage: getComputedStyle(document.querySelector('.island-responsive-scale')).visibility,
        house: document.querySelector('[data-asset-id="ASSET-02"]').dataset.assetState,
        landmarkHidden: document.querySelector('[data-landmark="projects"]').hidden,
        beam: getComputedStyle(document.querySelector('.lighthouse-beam-origin')).visibility,
      }));
      assert.deepEqual(foundation, { pending: 6, stage: 'visible', house: 'pending', landmarkHidden: true, beam: 'hidden' });
      await page.evaluate(() => {
        const gates = window.__arrivalProbe.gates;
        const index = gates.findIndex(resolve => resolve.assetId === 'ASSET-02');
        gates.splice(index, 1)[0]();
      });
      await page.waitForFunction(() => !document.querySelector('[data-landmark="projects"]').hidden);
      assert.equal(await page.evaluate(() => document.querySelector('[data-landmark="about"]').hidden), true);
      await page.evaluate(() => window.__arrivalProbe.gates.splice(0).forEach(resolve => resolve()));
      await page.waitForFunction(() => [...document.querySelectorAll('[data-asset-state]')].every(e => e.dataset.assetState === 'ready'));
    });
    await scenario('Explore before readiness skips entrance', { delayDecode: true }, async () => {
      await page.waitForFunction(() => window.__arrivalProbe.gates.length === 8);
      await page.click('[data-start-exploring]');
      await page.evaluate(() => window.__arrivalProbe.gates.splice(0).forEach(resolve => resolve()));
      await ready(); await assertFinal();
      assert.equal((await records()).length, 0);
    });
    await scenario('image decode failure retains error behavior', { failDecode: true }, async () => {
      await page.waitForFunction(() => document.querySelector('[data-scene-state="error"]'));
      assert.equal((await records()).length, 0);
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.island-responsive-scale')).visibility), 'hidden');
    });
    return passed;
  } finally {
    await page.cdp('Network.setCacheDisabled', { cacheDisabled: false });
    await page.cdp('Emulation.setEmulatedMedia', { features: [] });
    await page.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await page.goto(baseURL);
    await page.evaluate(value => {
      if (value === null) localStorage.removeItem('island-water-motion');
      else localStorage.setItem('island-water-motion', value);
    }, originalPreference);
    await page.reload();
  }
}
