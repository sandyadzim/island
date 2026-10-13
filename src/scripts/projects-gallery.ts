/** Enhances the shared Gallery; unenhanced HTML exposes both collections. */
export function initProjectGalleries(): () => void {
  const disposers = [
    ...document.querySelectorAll<HTMLElement>('[data-project-gallery]'),
  ].map((root) => {
    const events = new AbortController();
    const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panels = [
      ...root.querySelectorAll<HTMLElement>('[data-project-panel]'),
    ];
    const list = root.querySelector<HTMLElement>('.projects-tabs')!;
    const highlight = root.querySelector<HTMLElement>(
      '.projects-tabs-highlight',
    )!;
    const motion = document.querySelector<HTMLElement>(
      '[data-water-motion-toggle]',
    );
    let active = Math.max(
      0,
      tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'),
    );
    let frame = 0;
    function position() {
      if (!list.getClientRects().length) return;
      const offset = tabs[active].offsetLeft - tabs[0].offsetLeft;
      highlight.style.transform = `translateX(${offset}px)`;
      if (!list.hasAttribute('data-ready')) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          list.setAttribute('data-ready', '');
        });
      }
    }
    function select(index: number) {
      active = index;
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === active));
        tab.tabIndex = i === active ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        panel.hidden = i !== active;
      });
      position();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index), {
        signal: events.signal,
      });
      tab.addEventListener(
        'keydown',
        (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
            return;
          event.preventDefault();
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? tabs.length - 1
                : (active +
                    (event.key === 'ArrowRight' ? 1 : -1) +
                    tabs.length) %
                  tabs.length;
          select(next);
          tabs[next].focus({ preventScroll: true });
        },
        { signal: events.signal },
      );
    });
    panels.forEach((panel, i) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[i].id);
      panel.tabIndex = 0;
    });
    root.setAttribute('data-enhanced', '');
    list.hidden = false;
    const resize = new ResizeObserver(position);
    resize.observe(list);
    function syncMotion() {
      list.toggleAttribute(
        'data-motion-off',
        motion?.dataset.motionPreference === 'off',
      );
    }
    const preference = new MutationObserver(syncMotion);
    if (motion)
      preference.observe(motion, {
        attributes: true,
        attributeFilter: ['data-motion-preference'],
      });
    syncMotion();
    select(active);
    return () => {
      events.abort();
      resize.disconnect();
      preference.disconnect();
      cancelAnimationFrame(frame);
      list.removeAttribute('data-ready');
    };
  });
  return () => disposers.forEach((dispose) => dispose());
}
