import { cameraFromTransform, exploreCameraPose } from '../utils/camera-transition';
import type { Destination } from '../components/island/scene-config';
import { initDestinationDialogs } from './island-dialog';

const explorers = new WeakMap<HTMLElement, () => void>();

/** Intro gates every landmark; Explore opens shared destination dialogs. */
export function initIslandExplorer(root: HTMLElement): () => void {
  const existing = explorers.get(root);
  if (existing) return existing;
  const start = root.querySelector<HTMLButtonElement>('[data-start-exploring]');
  const back = root.querySelector<HTMLButtonElement>('[data-back-to-intro]');
  const stack = root.querySelector<HTMLElement>('.layout-stack');
  const frame = root.querySelector<HTMLElement>('.island-frame');
  const navigation = root.querySelector<HTMLElement>('[data-explore-navigation]');
  const dock = root.querySelector<HTMLElement>('.layout-menu');
  const header = root.querySelector<HTMLElement>('.layout-header');
  const controls = root.querySelector<HTMLElement>('[data-island-controls]');
  if (!start || !back || !stack || !frame || !navigation || !controls || !dock || !header) return () => {};

  const events = new AbortController();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const motion = root.querySelector<HTMLButtonElement>('[data-water-motion-toggle]');
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-explore-destination]'));
  const dialogs = initDestinationDialogs(root);
  const originalLinkAttributes = links.map(link => [link, link.getAttribute('aria-haspopup'), link.getAttribute('aria-controls')] as const);
  if (dialogs) links.forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', 'island-destination-dialog');
  });
  const landmarks = links.filter(link => link.hasAttribute('data-landmark'));
  const layers = Array.from(root.querySelectorAll<HTMLElement>('.island-layer[data-destination]'));
  const originalStackStyle = stack.getAttribute('style');
  let exploring = false;
  let introScroll = { left: 0, top: 0 };
  let hovered: string | null = null;
  let focused: string | null = null;
  let animation: Animation | undefined;
  let disposed = false;

  function clearCamera() { animation?.cancel(); animation = undefined; }
  function motionOff() { return reduce.matches || motion?.dataset.motionPreference === 'off'; }
  function syncMotion() {
    root.toggleAttribute('data-ui-motion-off', motionOff());
    if (motionOff()) clearCamera();
  }
  const preference = new MutationObserver(syncMotion);
  const layout = new ResizeObserver(() => { if (exploring && measureCamera()) clearCamera(); });
  function measureCamera(): boolean {
    const dockTop = window.innerHeight - parseFloat(getComputedStyle(dock!).bottom) - dock!.offsetHeight;
    const pose = exploreCameraPose(window.innerWidth, header!.getBoundingClientRect().bottom, dockTop);
    const width = `${pose.width.toFixed(3)}px`;
    const top = `${pose.centerY.toFixed(3)}px`;
    const changed = frame!.style.getPropertyValue('--explore-width') !== width || frame!.style.getPropertyValue('--explore-y') !== top;
    frame!.style.setProperty('--explore-width', width);
    frame!.style.setProperty('--explore-y', top);
    return changed;
  }
  function feedback() {
    const label = exploring ? focused ?? hovered : null;
    landmarks.forEach(link => link.toggleAttribute('data-label-visible', link.dataset.landmark === label));
    layers.forEach(layer => {
      layer.toggleAttribute('data-landmark-hover', exploring && layer.dataset.destination === hovered);
      layer.toggleAttribute('data-landmark-focus', exploring && layer.dataset.destination === focused);
    });
  }
  function restoreStack() {
    if (originalStackStyle === null) stack!.removeAttribute('style');
    else stack!.setAttribute('style', originalStackStyle);
  }
  function changeMode(next: boolean, keyboard = false) {
    if (next === exploring) return;
    const previous = frame!.getBoundingClientRect();
    clearCamera();
    if (next) {
      introScroll = { left: window.scrollX, top: window.scrollY };
      // Keep the exiting card at its visible position when normal flow changes.
      const rect = stack!.getBoundingClientRect();
      Object.assign(stack!.style, { position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, margin: '0' });
    } else restoreStack();
    exploring = next;
    hovered = null;
    focused = null;
    root.dataset.exploreMode = next ? 'explore' : 'intro';
    root.toggleAttribute('data-keyboard-transition', keyboard);
    stack!.inert = next;
    stack!.setAttribute('aria-hidden', String(next));
    navigation!.inert = !next;
    navigation!.setAttribute('aria-hidden', String(!next));
    controls!.inert = !next;
    controls!.setAttribute('aria-hidden', String(!next));
    back!.inert = !next;
    back!.setAttribute('aria-hidden', String(!next));
    feedback();
    if (next) window.scrollTo({ top: 0, behavior: 'instant' });
    if (next) measureCamera();
    if (!next) {
      start!.focus({ preventScroll: true });
      window.scrollTo({ ...introScroll, behavior: 'instant' });
    }
    const target = frame!.getBoundingClientRect();
    if (next) back!.focus({ preventScroll: true });
    const base = getComputedStyle(frame!).transform;
    const matrix = new DOMMatrix(base);
    if (!keyboard && !motionOff() && typeof frame!.animate === 'function') {
      const camera = frame!.animate([
        { transform: cameraFromTransform(previous, target, { x: matrix.e, y: matrix.f }) },
        { transform: base },
      ], { duration: 650, easing: 'cubic-bezier(.77, 0, .175, 1)' });
      animation = camera;
      camera.finished.then(() => { if (animation === camera) animation = undefined; }, () => {});
    }
  }
  const ordinaryClick = (event: MouseEvent) => !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey;
  function dispose() {
    if (disposed) return;
    disposed = true;
    events.abort();
    preference.disconnect();
    layout.disconnect();
    clearCamera();
    dialogs?.dispose();
    originalLinkAttributes.forEach(([link, popup, controlsId]) => {
      if (popup === null) link.removeAttribute('aria-haspopup'); else link.setAttribute('aria-haspopup', popup);
      if (controlsId === null) link.removeAttribute('aria-controls'); else link.setAttribute('aria-controls', controlsId);
    });
    restoreStack();
    frame!.style.removeProperty('--explore-width');
    frame!.style.removeProperty('--explore-y');
    exploring = false;
    hovered = focused = null;
    feedback();
    stack!.inert = false;
    stack!.removeAttribute('aria-hidden');
    [navigation!, controls!].forEach(element => { element.inert = true; element.setAttribute('aria-hidden', 'true'); });
    back!.hidden = true;
    back!.inert = true;
    start!.removeAttribute('role');
    start!.removeAttribute('aria-controls');
    root.dataset.exploreMode = 'intro';
    root.removeAttribute('data-ui-motion-off');
    root.removeAttribute('data-keyboard-transition');
    explorers.delete(root);
  }
  try {
    start.addEventListener('click', event => { if (ordinaryClick(event)) { event.preventDefault(); changeMode(true, event.detail === 0); } }, { signal: events.signal });
    start.addEventListener('keydown', event => { if (event.key === ' ') { event.preventDefault(); changeMode(true, true); } }, { signal: events.signal });
    back.addEventListener('click', event => changeMode(false, event.detail === 0), { signal: events.signal });
    root.querySelector<HTMLAnchorElement>('[data-intro-link]')?.addEventListener('click', event => {
      if (ordinaryClick(event)) { event.preventDefault(); changeMode(false, event.detail === 0); }
    }, { signal: events.signal });
    links.forEach(link => link.addEventListener('click', event => {
      if (!ordinaryClick(event)) return;
      if (exploring && !dialogs) return;
      event.preventDefault();
      if (!exploring) return;
      hovered = focused = null;
      feedback();
      dialogs?.open(link.dataset.exploreDestination as Exclude<Destination, 'home'>, link);
    }, { signal: events.signal }));
    landmarks.forEach(link => {
      link.addEventListener('pointerenter', () => { if (exploring && fine.matches) { hovered = link.dataset.landmark!; feedback(); } }, { signal: events.signal });
      link.addEventListener('pointerleave', () => { hovered = null; feedback(); }, { signal: events.signal });
      link.addEventListener('pointercancel', () => { hovered = null; feedback(); }, { signal: events.signal });
      link.addEventListener('focus', () => { focused = link.dataset.landmark!; feedback(); }, { signal: events.signal });
      link.addEventListener('blur', () => { focused = null; feedback(); }, { signal: events.signal });
    });
    fine.addEventListener('change', () => { hovered = null; feedback(); }, { signal: events.signal });
    reduce.addEventListener('change', syncMotion, { signal: events.signal });
    window.addEventListener('resize', () => { clearCamera(); if (exploring) measureCamera(); }, { signal: events.signal });
    window.addEventListener('blur', () => { hovered = null; feedback(); }, { signal: events.signal });
    document.addEventListener('keydown', event => {
      if (!exploring || dialogs?.isOpen || event.key !== 'Escape' || event.defaultPrevented) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      event.preventDefault();
      changeMode(false, true);
    }, { signal: events.signal });
    if (motion) preference.observe(motion, { attributes: true, attributeFilter: ['data-motion-preference'] });
    layout.observe(header);
    layout.observe(dock);
    syncMotion();
    start.setAttribute('role', 'button');
    start.setAttribute('aria-controls', 'main');
    back.hidden = false;
    back.inert = true;
    back.setAttribute('aria-hidden', 'true');
    explorers.set(root, dispose);
    return dispose;
  } catch { dispose(); return () => {}; }
}
