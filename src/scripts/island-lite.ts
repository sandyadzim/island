import { waitForImage } from '../utils/image-readiness';

const controllers = new WeakMap<HTMLElement, () => void>();

/** Two decoded images, no canvas, ambient controller, or animation ticker. */
export function initLiteIsland(root: HTMLElement): () => void {
  const existing = controllers.get(root);
  if (existing) return existing;
  const image = root.querySelector<HTMLImageElement>('[data-mobile-island]');
  const background = root.querySelector<HTMLImageElement>(
    '[data-lite-background]',
  );
  const status = root.querySelector<HTMLElement>('[data-scene-status]');
  const landmarks = Array.from(
    root.querySelectorAll<HTMLElement>('[data-landmark]'),
  );
  const abort = new AbortController();
  let disposed = false;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  function dispose() {
    if (disposed) return;
    disposed = true;
    abort.abort();
    clearTimeout(deadline);
    controllers.delete(root);
  }
  controllers.set(root, dispose);
  // BFCache retains this decoded image and its hit regions. Do not hide/redecode
  // it on restore; a second decode can stall even though it is already paintable.
  if (
    root.dataset.sceneState === 'ready' &&
    image?.complete &&
    image.naturalWidth > 0
  )
    return dispose;
  landmarks.forEach((link) => {
    link.hidden = true;
    link.inert = true;
  });
  root.dataset.sceneState = 'loading';
  if (status) status.textContent = 'Loading the island…';
  if (background) void waitForImage(background, abort.signal).catch(() => {});
  if (image) {
    deadline = setTimeout(() => abort.abort(), 120_000);
    void waitForImage(image, abort.signal)
      .then(
        () => {
          if (disposed) return;
          root.dataset.sceneState = 'ready';
          landmarks.forEach((link) => {
            link.hidden = false;
            link.inert = false;
          });
          if (status) status.textContent = '';
        },
        () => {
          if (disposed) return;
          root.dataset.sceneState = 'error';
          if (status)
            status.textContent =
              'The island could not load. The portfolio navigation is still available.';
        },
      )
      .finally(() => clearTimeout(deadline));
  } else {
    root.dataset.sceneState = 'error';
    if (status)
      status.textContent =
        'The island could not load. Read Portfolio is still available.';
  }
  return dispose;
}
