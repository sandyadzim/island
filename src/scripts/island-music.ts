/** User-started, lazily downloaded music with a decoded, seamless audio loop. */
export function initIslandMusic(root: HTMLElement): () => void {
  const button = root.querySelector<HTMLButtonElement>("[data-music-toggle]");
  const status = root.querySelector<HTMLElement>("[data-music-status]");
  if (!button || typeof AudioContext === "undefined") return () => {};

  const events = new AbortController();
  let context: AudioContext | undefined;
  let gain: GainNode | undefined;
  let source: AudioBufferSourceNode | undefined;
  let loading: Promise<void> | undefined;
  let suspendTimer: ReturnType<typeof setTimeout> | undefined;
  let enabled = false;
  let disposed = false;
  let revision = 0;

  function label() {
    const text = enabled ? "Mute background music" : "Play background music";
    button!.setAttribute("aria-pressed", String(enabled));
    button!.setAttribute("aria-label", text);
    button!.title = text;
  }

  function ready(): Promise<void> {
    if (source) return Promise.resolve();
    if (loading) return loading;
    button!.setAttribute("aria-busy", "true");
    loading = (async () => {
      const response = await fetch("/audio/rainy-cafe.mp3", {
        signal: events.signal,
      });
      if (!response.ok) throw new Error("Music could not be downloaded");
      const buffer = await context!.decodeAudioData(
        await response.arrayBuffer(),
      );
      if (disposed) return;
      source = context!.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain!);
      source.start();
    })().finally(() => {
      loading = undefined;
      button!.removeAttribute("aria-busy");
    });
    return loading;
  }

  async function sync() {
    const current = ++revision;
    clearTimeout(suspendTimer);
    if (!enabled) {
      if (context && gain) {
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setTargetAtTime(0, context.currentTime, 0.08);
        suspendTimer = setTimeout(() => {
          void context?.suspend().catch(() => {});
        }, 350);
      }
      return;
    }
    try {
      // Resume immediately in the click gesture, before fetching or decoding.
      context ??= new AudioContext();
      if (!gain) {
        gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(context.destination);
      }
      await Promise.all([context.resume(), ready()]);
      if (disposed || current !== revision || !enabled) return;
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0.24, context.currentTime, 0.35);
    } catch {
      if (disposed || current !== revision) return;
      enabled = false;
      label();
      if (status)
        status.textContent =
          "Music could not play. Tap the sound button to try again.";
      void context?.suspend().catch(() => {});
    }
  }

  button.disabled = false;
  button.addEventListener(
    "click",
    () => {
      enabled = !enabled;
      if (status) status.textContent = "";
      label();
      void sync();
    },
    { signal: events.signal },
  );

  return () => {
    disposed = true;
    revision++;
    events.abort();
    clearTimeout(suspendTimer);
    source?.stop();
    source?.disconnect();
    gain?.disconnect();
    void context?.close().catch(() => {});
    enabled = false;
    label();
    button.disabled = true;
  };
}
