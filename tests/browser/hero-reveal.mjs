import assert from 'node:assert/strict';

// Keep short CSS entrances inspectable without changing their authored timing.
function installProbe(config) {
  const probe = window.__heroProbe = { records: [], gates: [] };
  const seen = new WeakSet();
  try { localStorage.setItem('island-water-motion', config.saved ?? 'on'); } catch {}
  if (config.blockStorage) Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
  if (config.noWebGL) {
    const context = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl' ? null : context.call(this, type, ...args);
    };
  }
  probe.setHidden = hidden => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });
    document.dispatchEvent(new Event('visibilitychange'));
  };
  if (config.hidden) probe.setHidden(true);
  if (config.delayDecode) {
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = async function () {
      await decode.call(this);
      if (this.matches('.island-interaction > img')) await new Promise(resolve => probe.gates.push(resolve));
    };
  }
  const getAnimations = Element.prototype.getAnimations;
  Element.prototype.getAnimations = function (...args) {
    const animations = getAnimations.apply(this, args);
    if (this.matches('[data-hero-reveal-group]')) {
      for (const animation of animations) {
        if (!animation.animationName?.startsWith('hero-content-') || seen.has(animation)) continue;
        seen.add(animation);
        probe.records.push({ animation, order: this.dataset.heroRevealGroup,
          timing: animation.effect.getTiming(), keyframes: animation.effect.getKeyframes(),
          armed: this.closest('[data-hero-card]').hasAttribute('data-hero-reveal'),
          sceneState: document.querySelector('[data-island-scene]')?.dataset.sceneState });
        if (config.freeze) { animation.pause(); animation.currentTime = 0; }
      }
    }
    return animations;
  };
  document.addEventListener('animationstart', event => {
    if (event.target.matches('[data-hero-reveal-group]')) event.target.getAnimations();
  }, true);
}

/** Integration checks against a live Astro page; preserves the saved motion choice. */
export async function verifyHeroReveal(page, baseURL = 'http://localhost:4321/') {
  const original = await page.evaluate(() => localStorage.getItem('island-water-motion'));
  const passed = [];
  const records = () => page.evaluate(() => window.__heroProbe.records.map(record => ({
    order: record.order, timing: record.timing, keyframes: record.keyframes,
    armed: record.armed, sceneState: record.sceneState,
  })));
  async function final(allowAttribute = false) {
    await page.waitForFunction(allow => (allow || !document.querySelector('[data-hero-reveal]')) &&
      [...document.querySelectorAll('[data-hero-reveal-group]')].every(group => !group.getAnimations().length), allowAttribute);
    const state = await page.evaluate(() => ({
      armed: document.querySelector('[data-hero-card]').hasAttribute('data-hero-reveal'),
      groups: [...document.querySelectorAll('[data-hero-reveal-group]')].map(group => {
        const style = getComputedStyle(group);
        return { opacity: style.opacity, transform: style.transform, inert: group.inert };
      }),
    }));
    if (!allowAttribute) assert.equal(state.armed, false);
    assert.equal(state.groups.length, 5);
    for (const group of state.groups) {
      assert.equal(group.opacity, '1');
      assert.equal(group.transform, 'none');
      assert.equal(group.inert, false);
    }
  }
  async function finish() {
    await page.evaluate(() => window.__heroProbe.records.forEach(record => record.animation.finish()));
    await final();
  }
  async function scenario(name, config, check) {
    await page.cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: config.reduced ? 'reduce' : 'no-preference' }] });
    const { identifier } = await page.cdp('Page.addScriptToEvaluateOnNewDocument', {
      source: `(${installProbe.toString()})(${JSON.stringify(config)})`,
    });
    try {
      if (config.blockController) {
        await page.cdp('Network.setCacheDisabled', { cacheDisabled: true });
        await page.cdp('Network.setBlockedURLs', { urls: ['*src/scripts/hero-reveal.ts*'] });
      }
      await page.goto(baseURL);
      await page.waitForSelector('[data-hero-card]');
      if (!config.blockController) await page.waitForFunction(() => !document.querySelector('[data-hero-reveal]') || window.__heroProbe.records.length === 5);
      await check();
      passed.push(name);
    } catch (error) {
      throw new Error(`${name}: ${error.message}`, { cause: error });
    } finally {
      await page.cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier });
      if (config.blockController) {
        await page.cdp('Network.setBlockedURLs', { urls: [] });
        await page.cdp('Network.setCacheDisabled', { cacheDisabled: false });
      }
    }
  }

  try {
    await page.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await scenario('five intact groups, exact stagger, neutral card', { freeze: true }, async () => {
      const entrance = await records();
      assert.deepEqual(entrance.map(record => record.order), ['0', '1', '2', '3', '4']);
      assert.deepEqual(entrance.map(record => record.timing.delay), [0, 60, 120, 180, 240]);
      assert.ok(entrance.every(record => record.timing.duration === 280 && record.timing.fill === 'backwards' && record.armed));
      for (const record of entrance) {
        // CSS timing functions are represented on keyframes in the WAAPI view.
        assert.deepEqual(record.keyframes[0].easing.match(/[\d.]+/g).map(Number), [0.23, 1, 0.32, 1]);
        assert.equal(record.keyframes[0].transform, 'translateY(8px)');
      }
      await page.evaluate(() => document.fonts.ready);
      const before = await page.evaluate(() => ({ card: document.querySelector('[data-hero-card]').getBoundingClientRect().toJSON(), height: document.documentElement.scrollHeight }));
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('[data-hero-card]')).transform), 'none');
      await finish();
      const after = await page.evaluate(() => ({ card: document.querySelector('[data-hero-card]').getBoundingClientRect().toJSON(), height: document.documentElement.scrollHeight }));
      assert.deepEqual(after, before, 'Reveal must not change card layout or page height');
    });
    await scenario('hero reveals while island decode is pending', { delayDecode: true }, async () => {
      await page.waitForFunction(() => window.__heroProbe.gates.length === 8);
      await final();
      assert.equal(await page.evaluate(() => document.querySelector('[data-island-scene]').dataset.sceneState), 'loading');
      assert.equal((await records()).length, 5);
      await page.evaluate(() => window.__heroProbe.gates.splice(0).forEach(resolve => resolve()));
    });
    await scenario('reload replays; Explore and Intro do not', { freeze: true }, async () => {
      await finish();
      await page.click('[data-start-exploring]');
      await page.click('[data-back-to-intro]');
      await final();
      assert.equal((await records()).length, 5);
      await page.reload();
      await page.waitForFunction(() => window.__heroProbe.records.length === 5);
      assert.equal(await page.evaluate(() => document.querySelector('[data-hero-card]').hasAttribute('data-hero-reveal')), true);
      await finish();
    });
    await scenario('early keyboard focus settles all content and activates Explore', { freeze: true }, async () => {
      await page.keyboard.press('Tab');
      await page.focus('[data-start-exploring]');
      await final();
      assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'solid');
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('.portfolio-shell').dataset.exploreMode === 'explore');
    });
    await scenario('pointer press settles content before activation', { freeze: true }, async () => {
      // Low-level mouse state is independent of Ego's semantic hover action.
      const point = await page.evaluate(() => {
        const rect = document.querySelector('[data-start-exploring]').getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      });
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
      await final();
      assert.equal(await page.evaluate(() => document.querySelector('.portfolio-shell').dataset.exploreMode), 'intro');
      await page.mouse.up();
      await page.waitForFunction(() => document.querySelector('.portfolio-shell').dataset.exploreMode === 'explore');
      await page.click('[data-back-to-intro]');
      await final();
    });
    await scenario('programmatic mode change settles hero', { freeze: true }, async () => {
      await page.evaluate(() => document.querySelector('[data-start-exploring]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })));
      await final();
      await page.click('[data-back-to-intro]');
      assert.equal((await records()).length, 5);
    });
    for (const noWebGL of [false, true]) {
      await scenario(`saved Pause skips hero (WebGL ${!noWebGL})`, { saved: 'off', noWebGL }, async () => {
        assert.equal((await records()).length, 0); await final();
      });
    }
    await scenario('live Pause settles; Resume does not replay', { freeze: true }, async () => {
      await page.waitForSelector('[data-water-motion-toggle]:not([hidden])');
      await page.click('[data-water-motion-toggle]'); await final();
      await page.click('[data-water-motion-toggle]'); await final();
      assert.equal((await records()).length, 5);
    });
    await scenario('reduced motion is simultaneous 120ms opacity only', { reduced: true, freeze: true }, async () => {
      const entrance = await records();
      assert.equal(entrance.length, 5);
      assert.ok(entrance.every(record => record.timing.duration === 120 && record.timing.delay === 0 && record.keyframes.every(frame => !('transform' in frame))));
      await finish();
    });
    await scenario('enabling reduced motion settles active stagger', { freeze: true }, async () => {
      await page.cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await final();
    });
    await scenario('hidden document settles and never replays', { freeze: true }, async () => {
      await page.evaluate(() => window.__heroProbe.setHidden(true)); await final();
      await page.evaluate(() => window.__heroProbe.setHidden(false)); await final();
      assert.equal((await records()).length, 5);
    });
    await scenario('hidden startup skips bootstrap', { hidden: true }, async () => {
      assert.equal((await records()).length, 0); await final();
    });
    await scenario('persisted lifecycle skips replay', { freeze: true }, async () => {
      await page.evaluate(() => {
        window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
        window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
      });
      await final();
      assert.equal((await records()).length, 5);
    });
    for (const [name, config] of [
      ['blocked storage defaults to enabled', { blockStorage: true }],
      ['unavailable WebGL still reveals hero', { noWebGL: true }],
    ]) {
      await scenario(name, config, async () => {
        await final(); assert.equal((await records()).length, 5);
      });
    }
    await scenario('controller module failure still completes CSS entrance', { blockController: true }, async () => {
      await final(true);
      assert.equal(await page.evaluate(() => document.querySelector('[data-hero-card]').hasAttribute('data-hero-reveal')), true);
    });
    await page.cdp('Emulation.setScriptExecutionDisabled', { value: true });
    try {
      await page.goto(baseURL);
      await final();
      passed.push('no JavaScript leaves static readable hero');
    } finally { await page.cdp('Emulation.setScriptExecutionDisabled', { value: false }); }
    return passed;
  } finally {
    await page.cdp('Emulation.setEmulatedMedia', { features: [] });
    await page.goto(baseURL);
    await page.evaluate(value => {
      if (value === null) localStorage.removeItem('island-water-motion');
      else localStorage.setItem('island-water-motion', value);
    }, original);
    await page.reload();
  }
}
