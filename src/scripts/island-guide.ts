const guides = new WeakMap<HTMLElement, () => void>();

/** The readable guide is the source of truth; dialog behavior is optional. */
export function initIslandGuide(root: HTMLElement): () => void {
  const existing = guides.get(root);
  if (existing) return existing;
  const content = root.querySelector<HTMLElement>("[data-guide-content]");
  const dialog = root.querySelector<HTMLDialogElement>("[data-guide-dialog]");
  const container = root.querySelector<HTMLElement>("[data-guide-container]");
  const close = root.querySelector<HTMLButtonElement>("[data-guide-close]");
  if (
    !content ||
    !dialog ||
    !container ||
    !close ||
    typeof dialog.showModal !== "function"
  )
    return () => {};

  const events = new AbortController();
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-guide-link]"),
  );
  const targets = new Map<string, HTMLElement>();
  targets.set("#island-guide", content.querySelector<HTMLElement>("h2")!);
  let opener: HTMLAnchorElement | undefined;
  let disposed = false;

  function restoreFocus() {
    if (!disposed && opener?.isConnected) opener.focus({ preventScroll: true });
    opener = undefined;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    events.abort();
    if (dialog!.open) dialog!.close();
    root.insertBefore(content!, dialog);
    root.removeAttribute("data-guide-enhanced");
    guides.delete(root);
  }

  try {
    close.addEventListener("click", () => dialog.close(), {
      signal: events.signal,
    });
    dialog.addEventListener("close", restoreFocus, { signal: events.signal });
    links.forEach((link) =>
      link.addEventListener(
        "click",
        (event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          const target = targets.get(link.hash);
          if (!target) return;
          try {
            opener = link;
            dialog.showModal();
            event.preventDefault();
            dialog.scrollTop = 0;
            target.focus({ preventScroll: true });
            target.scrollIntoView({ block: "nearest" });
          } catch {
            // Restore fragment navigation if native dialog enhancement ever fails.
            dispose();
          }
        },
        { signal: events.signal },
      ),
    );

    // A direct fallback fragment remains useful even when scripts load normally.
    const initialTarget = targets.get(location.hash);
    if (initialTarget) {
      container.append(content);
      dialog.showModal();
      initialTarget.focus({ preventScroll: true });
      initialTarget.scrollIntoView({ block: "nearest" });
    } else {
      container.append(content);
    }
    root.dataset.guideEnhanced = "";
    guides.set(root, dispose);
    return dispose;
  } catch {
    dispose();
    return () => {};
  }
}
