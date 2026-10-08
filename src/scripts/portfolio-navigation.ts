import type { Destination } from '../components/island/scene-config';
import { destinationFromHash, navigationHash } from '../utils/portfolio-state';

const navigations = new WeakMap<HTMLElement, () => void>();

/** Enhance the readable sections independently of illustration/WebGL readiness. */
export function initPortfolioNavigation(root: HTMLElement): () => void {
  const existing = navigations.get(root);
  if (existing) return existing;
  const hero = root.querySelector<HTMLElement>('[data-hero-card]');
  const sections = root.querySelector<HTMLElement>('[data-portfolio-sections]');
  const card = root.querySelector<HTMLElement>('.layout-card');
  const identity = root.querySelector<HTMLAnchorElement>('.hero-identity');
  if (!hero || !sections || !card || !identity) return () => {};
  const panels = new Map<Destination, HTMLElement>();
  sections.querySelectorAll<HTMLElement>('[data-portfolio-section]').forEach((panel) => {
    const destination = destinationFromHash(`#${panel.dataset.portfolioSection}`);
    if (destination && destination !== 'home' && panel.querySelector('h2')) panels.set(destination, panel);
  });
  if (panels.size !== 5) return () => {};

  const parent = sections.parentNode!;
  const sibling = sections.nextSibling;
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-portfolio-link]'));
  const landmarks = links.filter((link) => link.hasAttribute('data-landmark'));
  const layers = Array.from(root.querySelectorAll<HTMLElement>('.island-layer[data-destination]'));
  const closeButtons = Array.from(sections.querySelectorAll<HTMLButtonElement>('[data-section-close]'));
  const read = root.querySelector<HTMLAnchorElement>('[data-read-portfolio]');
  const events = new AbortController();
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const wideLayout = matchMedia('(min-width: 1100px) and (min-height: 720px)');
  const openers = new Map<Destination, HTMLAnchorElement>();
  let active: Destination = 'home';
  let hovered: Destination | null = null;
  let focused: Destination | null = null;
  let disposed = false;

  function feedback() {
    const label = focused ?? hovered ?? (active === 'home' ? null : active);
    landmarks.forEach((link) => link.toggleAttribute('data-label-visible', link.dataset.landmark === label));
    layers.forEach((layer) => {
      layer.toggleAttribute('data-landmark-hover', layer.dataset.destination === hovered);
      layer.toggleAttribute('data-landmark-focus', layer.dataset.destination === focused);
    });
  }
  function apply(destination: Destination, focusContent: boolean) {
    active = destination;
    hero!.hidden = destination !== 'home';
    sections!.hidden = destination === 'home';
    panels.forEach((panel, id) => { panel.hidden = id !== destination; });
    links.forEach((link) => {
      if (destinationFromHash(link.hash) === destination) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (read) read.href = destination === 'home' ? '/portfolio/' : `/portfolio/#${destination}`;
    feedback();
    if (focusContent && destination !== 'home') panels.get(destination)!.querySelector<HTMLElement>('h2')!.focus({ preventScroll: wideLayout.matches });
  }
  function navigate(destination: Destination, focusContent = true) {
    const hash = navigationHash(location.hash, destination);
    if (hash) history.pushState(null, '', hash);
    apply(destination, focusContent);
  }
  function returnHome() {
    const opener = openers.get(active);
    navigate('home', false);
    (opener?.isConnected ? opener : identity)!.focus({ preventScroll: wideLayout.matches });
  }
  function syncHistory() {
    const destination = destinationFromHash(location.hash);
    if (!destination || destination === active) return;
    apply(destination, destination !== 'home');
    if (destination === 'home') identity!.focus({ preventScroll: wideLayout.matches });
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    events.abort();
    parent.insertBefore(sections!, sibling?.parentNode === parent ? sibling : null);
    hero!.hidden = false;
    sections!.hidden = false;
    panels.forEach((panel) => { panel.hidden = false; });
    closeButtons.forEach((button) => { button.hidden = true; });
    links.forEach((link) => { link.removeAttribute('aria-current'); link.removeAttribute('data-label-visible'); });
    layers.forEach((layer) => { layer.removeAttribute('data-landmark-hover'); layer.removeAttribute('data-landmark-focus'); });
    if (read) read.href = '/portfolio/';
    root.removeAttribute('data-portfolio-enhanced');
    navigations.delete(root);
  }
  try {
    links.forEach((link) => link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
      if (link.origin !== location.origin || link.pathname !== location.pathname || link.search !== location.search) return;
      const destination = destinationFromHash(link.hash);
      if (!destination) return;
      event.preventDefault();
      if (destination !== 'home') openers.set(destination, link);
      navigate(destination);
      if (destination === 'home') link.focus({ preventScroll: wideLayout.matches });
    }, { signal: events.signal }));
    closeButtons.forEach((button) => button.addEventListener('click', returnHome, { signal: events.signal }));
    window.addEventListener('popstate', syncHistory, { signal: events.signal });
    window.addEventListener('hashchange', syncHistory, { signal: events.signal });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented || active === 'home' || document.querySelector('dialog[open]')) return;
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      event.preventDefault();
      returnHome();
    }, { signal: events.signal });
    landmarks.forEach((link) => {
      const destination = destinationFromHash(link.hash)!;
      link.addEventListener('pointerenter', () => { if (finePointer.matches) { hovered = destination; feedback(); } }, { signal: events.signal });
      link.addEventListener('pointerleave', () => { if (hovered === destination) { hovered = null; feedback(); } }, { signal: events.signal });
      link.addEventListener('pointercancel', () => { hovered = null; feedback(); }, { signal: events.signal });
      link.addEventListener('focus', () => { focused = destination; feedback(); }, { signal: events.signal });
      link.addEventListener('blur', () => { focused = null; feedback(); }, { signal: events.signal });
    });
    finePointer.addEventListener('change', () => { hovered = null; feedback(); }, { signal: events.signal });
    window.addEventListener('blur', () => { hovered = null; feedback(); }, { signal: events.signal });
    card.append(sections);
    closeButtons.forEach((button) => { button.hidden = false; });
    root.dataset.portfolioEnhanced = '';
    const initial = destinationFromHash(location.hash) ?? 'home';
    apply(initial, initial !== 'home');
    navigations.set(root, dispose);
    return dispose;
  } catch {
    dispose();
    return () => {};
  }
}
