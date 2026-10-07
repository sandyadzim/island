import { SCENE_ASSETS } from '../components/island/scene-config';
import { sceneScale } from '../utils/scene-geometry';
import { waitForImage } from '../utils/image-readiness';
import { initOceanWater } from './ocean-water';

type SceneState = 'static' | 'loading' | 'ready' | 'error';
const controllers = new WeakMap<HTMLElement, () => void>();
const LOAD_TIMEOUT_MS = 120_000;

/** Owns image readiness, responsive scale, and the independent ocean renderer. */
export function initIslandScene(root: HTMLElement): () => void {
  const existing = controllers.get(root);
  if (existing) return existing;

  const status = root.querySelector<HTMLElement>('[data-scene-status]');
  const viewport = root.querySelector<HTMLElement>('[data-scene-viewport]');
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('.island-layer img'));
  const abort = new AbortController();
  let disposed = false;
  let resizeObserver: ResizeObserver | undefined;
  let frame: number | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let disposeWater: (() => void) | undefined;
  const oldScale = root.style.getPropertyValue('--scene-scale');
  const oldScalePriority = root.style.getPropertyPriority('--scene-scale');
  const oldStatus = status?.textContent ?? '';

  function state(value: SceneState, message = '') {
    root.dataset.sceneState = value;
    if (status) status.textContent = message;
  }

  function measure() {
    frame = undefined;
    if (!disposed && viewport) {
      root.style.setProperty('--scene-scale', String(sceneScale(viewport.getBoundingClientRect().width)));
    }
  }

  function scheduleMeasure() {
    if (frame === undefined && !disposed) frame = requestAnimationFrame(measure);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    abort.abort();
    clearTimeout(deadline);
    if (frame !== undefined) cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    disposeWater?.();
    window.removeEventListener('resize', scheduleMeasure);
    root.removeAttribute('data-scene-enhanced');
    if (oldScale) root.style.setProperty('--scene-scale', oldScale, oldScalePriority);
    else root.style.removeProperty('--scene-scale');
    state('static', oldStatus);
    controllers.delete(root);
  }

  function fail(message: string) {
    if (disposed || abort.signal.aborted) return;
    clearTimeout(deadline);
    state('error', message);
    abort.abort();
  }

  controllers.set(root, dispose);
  try {
    if (!viewport || !status || images.length !== SCENE_ASSETS.length) {
      throw new Error('Incomplete scene markup.');
    }
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleMeasure);
      resizeObserver.observe(viewport);
    }
    // Also catches viewport changes in browsers without ResizeObserver.
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    root.dataset.sceneEnhanced = '';
    state('loading', 'Loading the island…');
    deadline = setTimeout(() => {
      fail('The island is taking too long to load. Reload the page to try again.');
    }, LOAD_TIMEOUT_MS);

    void Promise.all(images.map((image) => waitForImage(image, abort.signal))).then(
      () => {
        if (disposed || abort.signal.aborted) return;
        clearTimeout(deadline);
        state('ready');
        disposeWater = initOceanWater(root);
      },
      () => fail('The island could not be loaded. Reload the page to try again.'),
    );
  } catch {
    // Never leave CSS content hidden after a setup failure.
    dispose();
    if (status) status.textContent = 'The static island view is available. Reload the page to try loading it again.';
  }

  return dispose;
}
