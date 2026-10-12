import { SCENE_ASSETS } from "../components/island/scene-config";
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
  const abort = new AbortController();
  let disposed = false;
  let resizeObserver: ResizeObserver | undefined;
  let frame: number | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let disposeWater: (() => void) | undefined;
  let arrival: ReturnType<typeof initArrivalReveal> | undefined;
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
    if (oldScale)
      root.style.setProperty("--scene-scale", oldScale, oldScalePriority);
    else root.style.removeProperty("--scene-scale");
    state("static", oldStatus);
    controllers.delete(root);
  }

  function fail(message: string) {
    if (disposed || abort.signal.aborted) return;
    clearTimeout(deadline);
    arrival?.dispose();
    state("error", message);
    abort.abort();
  }

  controllers.set(root, dispose);
  try {
    if (!viewport || !status || images.length !== SCENE_ASSETS.length) {
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
    root.dataset.sceneEnhanced = "";
    state("loading", "Loading the island…");
    if (firstArrival) arrival = initArrivalReveal(root, motionToggle);
    deadline = setTimeout(() => {
      fail(
        "The island is taking too long to load. Reload the page to try again.",
      );
    }, LOAD_TIMEOUT_MS);

    void Promise.all(
      images.map((image) => waitForImage(image, abort.signal)),
    ).then(
      () => {
        if (disposed || abort.signal.aborted) return;
        clearTimeout(deadline);
        // Install both starting poses while loading still hides the scene.
        arrival?.ready();
        state("ready");
        disposeWater = initOceanWater(root, motionToggle);
      },
      () =>
        fail("The island could not be loaded. Reload the page to try again."),
    );
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
