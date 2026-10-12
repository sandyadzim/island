const controllers = new WeakMap<HTMLElement, () => void>();
const initializedRoots = new WeakSet<HTMLElement>();

/** CSS starts at first paint; this controller only settles and cleans up entry. */
export function initHeroReveal(root: HTMLElement): () => void {
  const existing = controllers.get(root);
  if (existing) return existing;
  const card = root.querySelector<HTMLElement>("[data-hero-card]");
  if (!card) return () => {};
  const firstArrival = !initializedRoots.has(root);
  initializedRoots.add(root);
  const events = new AbortController();
  let preference: MutationObserver | undefined;

  function settle() {
    card!.removeAttribute("data-hero-reveal");
    events.abort();
    preference?.disconnect();
    controllers.delete(root);
  }

  controllers.set(root, settle);
  try {
    if (!firstArrival || !card.hasAttribute("data-hero-reveal")) {
      settle();
      return settle;
    }
    const groups = Array.from(card.querySelectorAll<HTMLElement>("[data-hero-reveal-group]"));
    // Loading the module late must not replay CSS animations that already ended.
    const pending = new Set(groups.filter(group => group.getAnimations().some(animation =>
      animation.playState !== "finished" && animation.playState !== "idle")));
    if (pending.size === 0) {
      settle();
      return settle;
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const toggle = root.querySelector<HTMLElement>("[data-water-motion-toggle]");
    function explicitlyPaused() {
      try {
        if (localStorage.getItem("island-water-motion") === "off") return true;
      } catch { /* Storage is optional, including when WebGL is unavailable. */ }
      return !reduce.matches && toggle?.dataset.motionPreference === "off";
    }
    const sync = () => {
      if (document.hidden || root.dataset.exploreMode === "explore" || explicitlyPaused()) settle();
    };
    card.addEventListener("focusin", settle, { capture: true, signal: events.signal });
    card.addEventListener("pointerdown", settle, { capture: true, signal: events.signal });
    card.addEventListener("animationend", event => {
      if (event.animationName !== "hero-content-reveal" && event.animationName !== "hero-content-fade") return;
      if (event.target instanceof HTMLElement) pending.delete(event.target);
      if (pending.size === 0) settle();
    }, { signal: events.signal });
    reduce.addEventListener("change", () => { if (reduce.matches) settle(); }, { signal: events.signal });
    document.addEventListener("visibilitychange", sync, { signal: events.signal });
    preference = new MutationObserver(sync);
    preference.observe(root, { attributes: true, attributeFilter: ["data-explore-mode"] });
    if (toggle) preference.observe(toggle, { attributes: true, attributeFilter: ["data-motion-preference"] });
    sync();
    if (card.contains(document.activeElement)) settle();
  } catch {
    // Enhancement failures always fall back to readable, stationary content.
    settle();
  }
  return settle;
}
