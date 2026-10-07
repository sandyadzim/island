export type SceneImage = EventTarget & {
  readonly complete: boolean;
  readonly naturalWidth: number;
  decode?: () => Promise<void>;
};

function abortError(): DOMException {
  return new DOMException('Scene loading was cancelled.', 'AbortError');
}

/** Load events alone do not establish that an image is decoded and paintable. */
export async function waitForImage(image: SceneImage, signal: AbortSignal): Promise<void> {
  if (signal.aborted) throw abortError();

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
      signal.removeEventListener('abort', onAbort);
    };
    const onLoad = () => {
      cleanup();
      if (image.naturalWidth > 0) resolve();
      else reject(new Error('The scene image has no decoded pixels.'));
    };
    const onError = () => {
      cleanup();
      reject(new Error('A scene image could not be loaded.'));
    };
    const onAbort = () => { cleanup(); reject(abortError()); };

    if (image.complete) { onLoad(); return; }
    image.addEventListener('load', onLoad);
    image.addEventListener('error', onError);
    signal.addEventListener('abort', onAbort, { once: true });
  });

  if (signal.aborted) throw abortError();
  if (!image.decode) return;

  await new Promise<void>((resolve, reject) => {
    const onAbort = () => { cleanup(); reject(abortError()); };
    const cleanup = () => signal.removeEventListener('abort', onAbort);
    signal.addEventListener('abort', onAbort, { once: true });
    try {
      image.decode!().then(
        () => { cleanup(); resolve(); },
        (error: unknown) => { cleanup(); reject(error); },
      );
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}
