import { SCENE_ASSETS, ISLAND_BASE_FALLBACK_URL } from "../components/island/scene-config";
import { sceneScale } from "../utils/scene-geometry";
import { waitForImage } from "../utils/image-readiness";
import { initOceanWater } from "./ocean-water";

type SceneState = "static" | "loading" | "ready" | "error";
const controllers = new WeakMap<HTMLElement, () => void>();
const initializedScenes = new WeakSet<HTMLElement>();
const LOAD_TIMEOUT_MS = 120_000;

/** Owns image readiness, responsive scale, and the independent ocean renderer. */
export function initIslandScene(
  root: HTMLElement,
  motionToggle: HTMLButtonElement | null,
): () => void {
  const existing = controllers.get(root);
  if (existing) return existing;
  const firstArrival = !initializedScenes.has(root);
  initializedScenes.add(root);

  const status = root.querySelector<HTMLElement>("[data-scene-status]");
  const viewport = root.querySelector<HTMLElement>("[data-scene-viewport]");
  const images = Array.from(
    root.querySelectorAll<HTMLImageElement>(".island-interaction > img"),
  );
  const layers = images.flatMap(image => {
    const layer = image.closest<HTMLElement>('[data-asset-id]');
    if (!layer) return [];
    const landmark = layer.dataset.destination
      ? root.querySelector<HTMLAnchorElement>(`[data-landmark="${layer.dataset.destination}"]`)
      : null;
    return [{ image, layer, landmark, state: 'pending' as 'pending' | 'ready' | 'error',
      usingFallback: false, previousSrc: image.getAttribute('src'),
      previousState: layer.getAttribute('data-asset-state'),
      previousHidden: landmark?.hidden ?? false, previousInert: landmark?.inert ?? false }];
  });
  const background = layers.find(item => item.layer.dataset.assetId === 'ASSET-00');
  const base = layers.find(item => item.layer.dataset.assetId === 'ASSET-01');
  const lighthouse = layers.find(item => item.layer.dataset.assetId === 'ASSET-06');
  const abort = new AbortController();
  let disposed = false;
  let resizeObserver: ResizeObserver | undefined;
  let frame: number | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let disposeWater: (() => void) | undefined;
  let arrival: ReturnType<typeof initArrivalReveal> | undefined;
  let foundationSettled = false;
  const oldScale = root.style.getPropertyValue("--scene-scale");
  const oldScalePriority = root.style.getPropertyPriority("--scene-scale");
  const oldStatus = status?.textContent ?? "";

  function state(value: SceneState, message = "") {
    root.dataset.sceneState = value;
    if (status) status.textContent = message;
  }

  function measure() {
    frame = undefined;
    if (!disposed && viewport) {
      root.style.setProperty(
        "--scene-scale",
        // Camera transforms change the visual bounds, not the source-space stage.
        // Using those bounds here applies the camera scale twice and leaves the
        // artwork at the previous mode's size after the transition finishes.
        String(sceneScale(parseFloat(getComputedStyle(viewport).width))),
      );
    }
  }

  function scheduleMeasure() {
    if (frame === undefined && !disposed)
      frame = requestAnimationFrame(measure);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    abort.abort();
    clearTimeout(deadline);
    if (frame !== undefined) cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    arrival?.dispose();
    disposeWater?.();
    window.removeEventListener("resize", scheduleMeasure);
    root.removeAttribute("data-scene-enhanced");
    root.removeAttribute('data-lighthouse-ready');
    layers.forEach(item => {
      if (item.previousSrc === null) item.image.removeAttribute('src');
      else if (item.image.getAttribute('src') !== item.previousSrc) item.image.setAttribute('src', item.previousSrc);
      if (item.previousState === null) item.layer.removeAttribute('data-asset-state');
      else item.layer.setAttribute('data-asset-state', item.previousState);
      if (item.landmark) {
        item.landmark.hidden = item.previousHidden;
        item.landmark.inert = item.previousInert;
      }
    });
    if (oldScale)
      root.style.setProperty("--scene-scale", oldScale, oldScalePriority);
    else root.style.removeProperty("--scene-scale");
    state("static", oldStatus);
    controllers.delete(root);
  }

  function updateDetails() {
    if (disposed) return;
    layers.forEach(item => {
      if (!item.landmark) return;
      const active = foundationSettled && base?.state === 'ready' && item.state === 'ready';
      item.landmark.hidden = !active || item.previousHidden;
      item.landmark.inert = !active || item.previousInert;
    });
    root.toggleAttribute('data-lighthouse-ready', lighthouse?.state === 'ready');
    const pending = layers.some(item => item.state === 'pending');
    if (!pending) clearTimeout(deadline);
    if (!foundationSettled || !status) return;
    const message = base?.state !== 'ready'
      ? 'The island base could not load. The portfolio navigation is still available.'
      : layers.some(item => item.state === 'error' || item.usingFallback)
        ? 'Some island details could not load. The portfolio navigation is still available.'
        : pending ? 'Loading island details…' : '';
    if (status.textContent !== message) status.textContent = message;
  }

  function complete(item: typeof layers[number], value: 'ready' | 'error') {
    if (disposed || item.state !== 'pending') return;
    item.state = value;
    item.layer.dataset.assetState = value;
    updateDetails();
  }

  async function load(item: typeof layers[number]) {
    try {
      await waitForImage(item.image, abort.signal);
    } catch (error) {
      if (item !== base || disposed || abort.signal.aborted) throw error;
      // Reuse the terrain layer so every source-space transform stays registered.
      // The backup is not referenced by markup and adds no request to normal loads.
      item.image.src = ISLAND_BASE_FALLBACK_URL;
      await waitForImage(item.image, abort.signal);
      item.usingFallback = true;
    }
  }

  controllers.set(root, dispose);
  try {
    if (!viewport || !status || !background || !base || layers.length !== SCENE_ASSETS.length) {
      throw new Error("Incomplete scene markup.");
    }
    measure();
    if (typeof ResizeObserver !== "undefined") {
      // Update registration before paint when the camera changes layout size.
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(viewport);
    }
    // Also catches viewport changes in browsers without ResizeObserver.
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    layers.forEach(item => { item.layer.dataset.assetState = 'pending'; });
    updateDetails();
    root.dataset.sceneEnhanced = "";
    state("loading", "Loading the island…");
    if (firstArrival) arrival = initArrivalReveal(root, motionToggle);
    deadline = setTimeout(() => {
      layers.forEach(item => complete(item, 'error'));
      abort.abort();
    }, LOAD_TIMEOUT_MS);

    const readiness = new Map(layers.map(item => [item, load(item).then(
      () => complete(item, 'ready'),
      () => complete(item, 'error'),
    )]));
    // Only the background and terrain gate arrival. Other layers reveal independently.
    void Promise.all([readiness.get(background), readiness.get(base)]).then(() => {
      if (disposed) return;
      foundationSettled = true;
      if (base.state === 'ready') {
        arrival?.ready();
        state("ready");
        if (background.state === 'ready') disposeWater = initOceanWater(root, motionToggle);
      } else {
        arrival?.dispose();
        state('error');
      }
      updateDetails();
    });
  } catch {
    // Never leave CSS content hidden after a setup failure.
    dispose();
    if (status)
      status.textContent =
        "The static island view is available. Reload the page to try loading it again.";
  }

  return dispose;
}

/** One arrival per document; all effects are removable so static styles win. */
function initArrivalReveal(root: HTMLElement, toggle: HTMLButtonElement | null) {
  const island = root.querySelector<HTMLElement>(".island-reveal");
  const environment = root.querySelector<HTMLElement>(".island-environment");
  const frame = root.querySelector<HTMLElement>(".island-frame");
  const shell = root.closest<HTMLElement>("[data-explore-mode]");
  const events = new AbortController();
  const animations = new Set<Animation>();
  let intersection: IntersectionObserver | undefined;
  let preference: MutationObserver | undefined;
  let islandAnimation: Animation | undefined;
  let onScreen: boolean | undefined;
  let ready = false;
  let settled = false;

  function cleanup() {
    intersection?.disconnect();
    preference?.disconnect();
    events.abort();
  }

  function settle() {
    settled = true;
    cleanup();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    islandAnimation = undefined;
  }

  function visibleFraction() {
    const rect = frame!.getBoundingClientRect();
    const width = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
    const height = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    return rect.width * rect.height > 0 ? width * height / (rect.width * rect.height) : 0;
  }

  // The water renderer may be unavailable or may mark reduced motion as "off".
  // Read the saved user choice separately so reduced motion still gets a fade.
  function explicitlyPaused(reduced: boolean) {
    try {
      if (localStorage.getItem("island-water-motion") === "off") return true;
    } catch { /* Storage is optional, as it is for the ocean renderer. */ }
    return !reduced && toggle?.dataset.motionPreference === "off";
  }

  function track(element: HTMLElement, keyframes: Keyframe[], duration: number, easing: string) {
    const animation = element.animate(keyframes, { duration, easing, fill: "both" });
    animations.add(animation);
    animation.pause();
    animation.currentTime = 0;
    void animation.finished.then(() => {
      animation.cancel();
      animations.delete(animation);
      if (animation === islandAnimation) islandAnimation = undefined;
      if (animations.size === 0) settle();
    }, () => {});
    return animation;
  }

  try {
    if (!island || !environment || !frame || typeof island.animate !== "function" || typeof environment.animate !== "function") {
      settle();
      return { ready() {}, dispose: settle };
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (document.hidden || shell?.dataset.exploreMode === "explore" || explicitlyPaused(reduce.matches)) settle();
    };
    preference = new MutationObserver(sync);
    if (shell) preference.observe(shell, { attributes: true, attributeFilter: ["data-explore-mode"] });
    if (toggle) preference.observe(toggle, { attributes: true, attributeFilter: ["data-motion-preference"] });
    reduce.addEventListener("change", () => { if (reduce.matches) settle(); }, { signal: events.signal });
    document.addEventListener("visibilitychange", sync, { signal: events.signal });
    if (typeof IntersectionObserver !== "undefined") {
      intersection = new IntersectionObserver(([entry]) => {
        onScreen = !!entry?.isIntersecting && entry.intersectionRatio >= 0.1;
        if (ready && onScreen && !settled) {
          islandAnimation?.play();
          intersection?.disconnect();
        }
      }, { threshold: 0.1 });
      intersection.observe(frame);
    }

    return {
      ready() {
        if (ready || settled) return;
        ready = true;
        sync();
        if (settled) return;
        try {
          const easing = getComputedStyle(root).getPropertyValue("--ease-out").trim();
          const reduced = reduce.matches;
          const fade = [{ opacity: 0 }, { opacity: 1 }];
          islandAnimation = track(island, reduced ? fade : [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ], reduced ? 120 : 520, easing);
          const background = track(environment, fade, reduced ? 120 : 320, easing);
          background.play();
          if (!intersection || (onScreen ?? visibleFraction() >= 0.1)) {
            islandAnimation.play();
            intersection?.disconnect();
          }
        } catch { settle(); }
      },
      dispose: settle,
    };
  } catch {
    settle();
    return { ready() {}, dispose: settle };
  }
}
