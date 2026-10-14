/** Browser-only diagnostics. These measurements do not certify iOS stability. */
export function installMobileAudit() {
  const audit = (window.__mobileStabilityAudit = {
    contexts: 0,
    contextRequests: 0,
    draws: 0,
    uploads: 0,
    bufferWrites: [],
    errors: [],
    contextLosses: 0,
    rafRequests: 0,
  });
  const getContext = HTMLCanvasElement.prototype.getContext;
  const requestFrame = window.requestAnimationFrame;
  window.requestAnimationFrame = function (callback) {
    audit.rafRequests++;
    return requestFrame.call(this, callback);
  };
  const seenContexts = new WeakSet();
  HTMLCanvasElement.prototype.getContext = function (...args) {
    const context = getContext.apply(this, args);
    if (context && ['webgl', 'webgl2'].includes(args[0])) {
      audit.contextRequests++;
      if (!seenContexts.has(context)) {
        seenContexts.add(context);
        audit.contexts++;
      }
    }
    return context;
  };
  for (const method of ['drawArrays', 'texImage2D']) {
    const original = WebGLRenderingContext.prototype[method];
    WebGLRenderingContext.prototype[method] = function (...args) {
      audit[method === 'drawArrays' ? 'draws' : 'uploads']++;
      return original.apply(this, args);
    };
  }
  for (const key of ['width', 'height']) {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLCanvasElement.prototype,
      key,
    );
    Object.defineProperty(HTMLCanvasElement.prototype, key, {
      ...descriptor,
      set(value) {
        audit.bufferWrites.push({ key, value });
        descriptor.set.call(this, value);
      },
    });
  }
  addEventListener('error', (event) => audit.errors.push(event.message));
  addEventListener('unhandledrejection', (event) =>
    audit.errors.push(String(event.reason)),
  );
  document.addEventListener(
    'webglcontextlost',
    () => audit.contextLosses++,
    true,
  );
}

export function readMobileAudit() {
  const images = [
    ...new Map(
      [...document.images]
        .filter((image) => image.currentSrc)
        .map((image) => [
          image.currentSrc,
          {
            url: image.currentSrc,
            width: image.naturalWidth,
            height: image.naturalHeight,
          },
        ]),
    ).values(),
  ];
  const resources = performance.getEntriesByType('resource').map((entry) => ({
    url: entry.name,
    type: entry.initiatorType,
    responseBodyBytes: entry.decodedBodySize,
    transferBytes: entry.transferSize,
  }));
  return {
    ...window.__mobileStabilityAudit,
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    resources,
    images,
    // Pixel sizing model for unique source images, not resident memory.
    sourceRGBABytes: images.reduce(
      (total, image) => total + image.width * image.height * 4,
      0,
    ),
    canvas: [...document.querySelectorAll('canvas')].map((canvas) => ({
      width: canvas.width,
      height: canvas.height,
      state: canvas.dataset.waterState,
    })),
    animations: document.getAnimations().reduce((counts, animation) => {
      counts[animation.playState] = (counts[animation.playState] || 0) + 1;
      return counts;
    }, {}),
  };
}

export async function sampleMobileAudit(page, label, duration = 1000) {
  const before = await page.evaluate(`(${readMobileAudit.toString()})()`);
  await page.evaluate(
    (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    duration,
  );
  const after = await page.evaluate(`(${readMobileAudit.toString()})()`);
  return {
    label,
    duration,
    draws: after.draws - before.draws,
    requests: after.resources.slice(before.resources.length),
    bufferWrites: after.bufferWrites.slice(before.bufferWrites.length),
    state: after,
  };
}

export async function readLayerSummary(page) {
  const event = (await page.events())
    .filter((item) => item.method === 'LayerTree.layerTreeDidChange')
    .at(-1);
  if (!event) return null;
  const layers = event.params.layers || [];
  const drawing = layers.filter((layer) => layer.drawsContent);
  return {
    layers: layers.length,
    drawingLayers: drawing.length,
    largeDrawingLayers: drawing.filter(
      (layer) => layer.width > 2000 && layer.height > 1500,
    ).length,
    // Reported layer bounds do not account for tiling, clipping, sharing or eviction.
    nominalRGBABytes: drawing.reduce(
      (total, layer) => total + layer.width * layer.height * 4,
      0,
    ),
  };
}
