import { initDialogMotion } from './dialog-motion';
import { DESTINATIONS } from '../components/hero/destinations';
import type { Destination } from '../components/island/scene-config';

type ContentDestination = Exclude<Destination, 'home'>;
export interface DestinationDialogs {
  open(destination: ContentDestination, trigger: HTMLElement): void;
  close(): void;
  readonly isOpen: boolean;
  dispose(): void;
}

/** Native focus containment; one modal owns focus, scroll, and its animation. */
export function initDestinationDialogs(
  root: HTMLElement,
): DestinationDialogs | null {
  const dialog = root.querySelector<HTMLDialogElement>(
    '[data-destination-dialog]',
  );
  const title = dialog?.querySelector<HTMLElement>('[data-dialog-title]');
  const closeButton = dialog?.querySelector<HTMLButtonElement>(
    '[data-dialog-close]',
  );
  if (
    !dialog ||
    !title ||
    !closeButton ||
    typeof dialog.showModal !== 'function'
  )
    return null;
  const sections = Array.from(
    dialog.querySelectorAll<HTMLElement>('[data-dialog-section]'),
  );
  const events = new AbortController();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = root.querySelector<HTMLElement>('[data-water-motion-toggle]');
  let trigger: HTMLElement | undefined;
  const animation = initDialogMotion(dialog, true);
  let closing = false;
  let disposed = false;
  let outsidePointer: number | undefined;
  let restoreScroll: (() => void) | undefined;

  function motionOff() {
    return motion?.dataset.motionPreference === 'off';
  }
  function cancelAnimation() {
    animation.cancel();
  }
  function lockScroll() {
    if (restoreScroll) return;
    const html = document.documentElement;
    const properties = [
      'overflow',
      'scrollbar-gutter',
      'padding-right',
    ] as const;
    const previous = properties.map(
      (name) =>
        [
          name,
          html.style.getPropertyValue(name),
          html.style.getPropertyPriority(name),
        ] as const,
    );
    const gutter = Math.max(0, window.innerWidth - html.clientWidth);
    if (gutter > 0) {
      if (CSS.supports('scrollbar-gutter', 'stable'))
        html.style.setProperty('scrollbar-gutter', 'stable');
      else
        html.style.paddingRight = `${parseFloat(getComputedStyle(html).paddingRight) + gutter}px`;
    }
    html.style.overflow = 'hidden';
    restoreScroll = () => {
      previous.forEach(([name, value, priority]) =>
        value
          ? html.style.setProperty(name, value, priority)
          : html.style.removeProperty(name),
      );
      restoreScroll = undefined;
    };
  }
  function finishClose(restoreFocus = true) {
    cancelAnimation();
    closing = false;
    outsidePointer = undefined;
    if (dialog!.open) dialog!.close();
    restoreScroll?.();
    sections.forEach((section) => {
      section.hidden = true;
    });
    if (restoreFocus && trigger?.isConnected)
      trigger.focus({ preventScroll: true });
    trigger = undefined;
  }
  function close() {
    if (!dialog!.open || closing || disposed) return;
    if (motionOff()) {
      finishClose();
      return;
    }
    closing = true;
    void animation.play(false).then((finished) => {
      if (finished && closing) finishClose();
    });
  }
  function outside(event: PointerEvent) {
    const rect = dialog!.getBoundingClientRect();
    return (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    );
  }
  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault();
      close();
    },
    { signal: events.signal },
  );
  // Handles external/native close too, while avoiding an old queued close event on reopen.
  dialog.addEventListener(
    'close',
    () => {
      if (!dialog.open && restoreScroll) finishClose();
    },
    { signal: events.signal },
  );
  closeButton.addEventListener('click', close, { signal: events.signal });
  dialog.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          !element.closest('[hidden], [inert]'),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        title.focus();
        return;
      }
      if (
        !focusable.includes(document.activeElement as HTMLElement) ||
        (event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    },
    { signal: events.signal },
  );
  dialog.addEventListener(
    'pointerdown',
    (event) => {
      outsidePointer = outside(event) ? event.pointerId : undefined;
    },
    { signal: events.signal },
  );
  dialog.addEventListener(
    'pointerup',
    (event) => {
      const dismiss = outsidePointer === event.pointerId && outside(event);
      outsidePointer = undefined;
      if (dismiss) close();
    },
    { signal: events.signal },
  );
  dialog.addEventListener(
    'pointercancel',
    () => {
      outsidePointer = undefined;
    },
    { signal: events.signal },
  );
  function syncMotion() {
    if (!motionOff() && !reduce.matches) return;
    if (closing) finishClose();
    else cancelAnimation();
  }
  const preference = new MutationObserver(syncMotion);
  if (motion)
    preference.observe(motion, {
      attributes: true,
      attributeFilter: ['data-motion-preference'],
    });
  reduce.addEventListener('change', syncMotion, { signal: events.signal });

  return {
    get isOpen() {
      return dialog.open;
    },
    open(destination, opener) {
      if (disposed) return;
      const entry = DESTINATIONS.find((item) => item.id === destination);
      const selected = sections.find(
        (section) => section.dataset.dialogSection === destination,
      );
      if (!entry || !selected) return;
      const wasOpen = dialog.open;
      const wasClosing = closing;
      closing = false;
      outsidePointer = undefined;
      trigger = opener;
      title.textContent = entry.label;
      closeButton.setAttribute(
        'aria-label',
        `Close ${entry.label} and return to the island`,
      );
      sections.forEach((section) => {
        section.hidden = section !== selected;
      });
      lockScroll();
      if (!dialog.open) dialog.showModal();
      const body = dialog.querySelector<HTMLElement>('[data-dialog-body]');
      if (body) body.scrollTop = 0;
      title.focus({ preventScroll: true });
      if (!motionOff()) {
        if (!wasOpen || wasClosing) void animation.play(true);
      }
    },
    close,
    dispose() {
      if (disposed) return;
      disposed = true;
      events.abort();
      preference.disconnect();
      finishClose(false);
    },
  };
}
