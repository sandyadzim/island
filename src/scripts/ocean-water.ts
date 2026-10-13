/** Water-only refraction of the original painting; no changes to island transforms. */
const VERTEX = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x * .5 + .5, .5 - a_position.y * .5);
  gl_Position = vec4(a_position, 0., 1.);
}`;

const FRAGMENT = `
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_cover;
uniform vec2 u_texel;
uniform float u_time;
varying vec2 v_uv;

// Soft exclusion zones measured in the original 1536 × 1024 painting.
// They protect the silhouettes and shoreline of the embedded rocks.
float rock(vec2 uv, vec2 center, vec2 radius) {
  return smoothstep(.9, 1.15, length((uv - center) / radius));
}

void main() {
  vec2 uv = (v_uv - .5) * u_cover + .5;
  float water = smoothstep(.195, .26, uv.y);
  water *= rock(uv, vec2(.184, .269), vec2(.068, .048));
  water *= rock(uv, vec2(.363, .217), vec2(.03, .025));
  water *= rock(uv, vec2(.137, .215), vec2(.029, .018));
  water *= rock(uv, vec2(.948, .319), vec2(.036, .027));
  float depth = smoothstep(.19, 1., uv.y);
  float t = u_time;
  // Three overlapping waves avoid a uniform sliding or rubber-sheet effect.
  float swell = sin(uv.y * 115. - t * .85 + sin(uv.x * 19. + t * .27));
  float ripple = sin(uv.y * 238. + uv.x * 31. + t * 1.15);
  float cross = sin(uv.x * 86. - uv.y * 45. + t * .65);
  vec2 offset = vec2(
    swell * (2. + depth * 3.5) + ripple * 1.3,
    cross * (.5 + depth * 1.2) + ripple * .45
  ) * u_texel * water * smoothstep(0., 2., t);
  // Fade displacement at the texture boundary so cover never exposes an edge.
  offset *= smoothstep(0., .015, min(min(uv.x, 1. - uv.x), min(uv.y, 1. - uv.y)));
  vec4 color = texture2D(u_image, clamp(uv + offset, u_texel * .5, 1. - u_texel * .5));
  // Modulate existing highlights rather than painting new lights over the art.
  float highlight = smoothstep(.12, .48, max(color.r, color.g));
  color.rgb *= 1. + water * highlight * .035 * ripple * smoothstep(0., 2., t);
  gl_FragColor = color;
}`;

const STORAGE_KEY = "island-water-motion";

export function initOceanWater(
  root: HTMLElement,
  toggle: HTMLButtonElement | null,
): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-ocean-water]");
  const image = root.querySelector<HTMLImageElement>(
    '[data-asset-id="ASSET-00"] img',
  );
  const beams = Array.from(
    root.querySelectorAll<SVGSVGElement>("[data-lighthouse-beam]"),
  );
  const lampGlint = root.querySelector<HTMLElement>("[data-lighthouse-glint]");
  if (!canvas || !image || !toggle) return () => {};
  const toggleLabel =
    toggle.querySelector<HTMLElement>("[data-motion-label]") ?? toggle;
  const dialog = root.closest<HTMLElement>('[data-explore-mode]')
    ?.querySelector<HTMLDialogElement>('[data-destination-dialog]');
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: "low-power",
  });
  if (!gl) return () => {};

  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const events = new AbortController();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let resize: ResizeObserver | undefined;
  let intersection: IntersectionObserver | undefined;
  let dialogObserver: MutationObserver | undefined;
  let frame: number | undefined;
  let disposed = false;
  let onScreen = true;
  let enabled = true;
  let elapsed = 0;
  let lastTime = 0;
  let lastDraw = 0;
  let bufferAllocated = false;
  let measuredWidth = 0;
  let measuredHeight = 0;
  let interacting = false;
  let interactionTimer: ReturnType<typeof setTimeout> | undefined;

  function cleanup() {
    if (disposed) return;
    disposed = true;
    if (frame !== undefined) cancelAnimationFrame(frame);
    clearTimeout(interactionTimer);
    events.abort();
    resize?.disconnect();
    intersection?.disconnect();
    dialogObserver?.disconnect();
    reduce.removeEventListener("change", sync);
    canvas!.removeAttribute("data-water-visible");
    canvas!.removeAttribute("data-water-state");
    root.removeAttribute("data-marine-motion");
    beams.forEach((beam) => {
      beam.style.removeProperty("transform");
      beam.style.removeProperty("opacity");
    });
    lampGlint?.style.removeProperty("opacity");
    lampGlint?.style.removeProperty("transform");
    toggle!.hidden = true;
    gl!.deleteTexture(texture);
    gl!.deleteBuffer(buffer);
    gl!.deleteProgram(program);
    shaders.forEach((shader) => gl!.deleteShader(shader));
  }

  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error("Water shader unavailable");
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS))
      throw new Error("Water shader failed");
    return shader;
  }

  let time: WebGLUniformLocation | null;
  let cover: WebGLUniformLocation | null;

  function draw() {
    gl!.uniform1f(time, elapsed);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    // Two opposing beams face the viewer twice per revolution. A narrow, smooth
    // crest gives the lamp a warm glint without introducing another timer.
    const facing = Math.abs(Math.sin((elapsed * Math.PI * 2) / 32));
    const glint = facing ** 8;
    if (lampGlint) {
      lampGlint.style.opacity = String(0.06 + 0.94 * glint);
      lampGlint.style.transform = `translate(-50%, -50%) scale(${0.95 + 0.85 * glint})`;
    }
    beams.forEach((beam, index) => {
      // A circle projected onto the local ground plane becomes an ellipse. Projecting
      // its endpoint keeps the sweep continuous and the lamp origin stationary.
      const phase = (elapsed * Math.PI * 2) / 32 + index * Math.PI;
      const depth = Math.sin(phase);
      const x = -Math.cos(phase) * 360;
      const y = depth * 220;
      const length = Math.hypot(x, y);
      const angle = (Math.atan2(y, x) * 180) / Math.PI;
      const front = Math.max(0, depth);
      beam.style.transform = `rotate(${angle}deg) scale(${length / 1400}, ${0.2 + front * 0.15})`;
      // Rear light stays visible, slightly narrower and dimmer than the front.
      beam.style.opacity = String(0.32 + front * 0.14);
    });
  }

  function measure() {
    if (disposed) return;
    const { width, height } = canvas!.getBoundingClientRect();
    if (!width || !height) return;
    if (width === measuredWidth && height === measuredHeight) return;
    measuredWidth = width;
    measuredHeight = height;
    // Allocate once for this renderer's lifetime. Safari toolbar/gesture changes
    // must not repeatedly replace GPU surfaces. CSS still fills the viewport;
    // u_cover below preserves the painting's proportions, including rotation.
    if (!bufferAllocated) {
      const scale = Math.min(devicePixelRatio || 1, 1, 960 / width, 640 / height);
      canvas!.width = Math.max(1, Math.round(width * scale));
      canvas!.height = Math.max(1, Math.round(height * scale));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      bufferAllocated = true;
    }
    const fitted = Math.max(
      width / image!.naturalWidth,
      height / image!.naturalHeight,
    );
    gl!.uniform2f(
      cover,
      width / (image!.naturalWidth * fitted),
      height / (image!.naturalHeight * fitted),
    );
    draw();
  }

  function tick(now: number) {
    if (disposed) return;
    elapsed += Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (now - lastDraw >= 1000 / 30) {
      draw();
      lastDraw = now;
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (disposed) return;
    const running = enabled && !reduce.matches && !document.hidden && onScreen && !dialog?.open && !interacting;
    toggle!.disabled = reduce.matches;
    toggleLabel.textContent = reduce.matches
      ? "Motion off"
      : enabled
        ? "Pause motion"
        : "Resume motion";
    toggle!.setAttribute('aria-label', toggleLabel.textContent);
    toggle!.dataset.motionPreference =
      reduce.matches || !enabled ? "off" : "on";
    toggle!.title = reduce.matches
      ? "Reduced motion is enabled in your system settings"
      : toggleLabel.textContent;
    canvas!.dataset.waterState = running ? "running" : "paused";
    root.dataset.marineMotion = reduce.matches
      ? "reduced"
      : running
        ? "running"
        : "paused";
    canvas!.toggleAttribute("data-water-visible", !reduce.matches);
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    if (running) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  function pauseInteraction() {
    clearTimeout(interactionTimer);
    if (!interacting) {
      interacting = true;
      sync();
    }
  }

  function settleInteraction() {
    pauseInteraction();
    // Scroll and visual-viewport events keep extending this through momentum
    // and toolbar animation. Native scrolling and pinch zoom remain available.
    interactionTimer = setTimeout(() => {
      interacting = false;
      sync();
    }, 200);
  }

  try {
    if (!program || !buffer || !texture)
      throw new Error("Water renderer unavailable");
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Water program failed");
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);
    gl.uniform2f(
      gl.getUniformLocation(program, "u_texel"),
      1 / image.naturalWidth,
      1 / image.naturalHeight,
    );
    time = gl.getUniformLocation(program, "u_time");
    cover = gl.getUniformLocation(program, "u_cover");
    if (gl.getError() !== gl.NO_ERROR)
      throw new Error("Water texture unavailable");
    try {
      enabled = localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      /* Storage is optional. */
    }
    measure();
    resize = new ResizeObserver(measure);
    resize.observe(canvas);
    // Native open state also covers external close and rapid close/reopen.
    // Keep this reading pause separate from the visitor's saved preference.
    if (dialog) {
      dialogObserver = new MutationObserver(sync);
      dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
    }
    if (typeof IntersectionObserver !== "undefined") {
      intersection = new IntersectionObserver(([entry]) => {
        onScreen = entry?.isIntersecting ?? false;
        sync();
      });
      intersection.observe(canvas);
    }
    toggle.addEventListener(
      "click",
      () => {
        enabled = !enabled;
        try {
          localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
        } catch {
          /* Storage is optional. */
        }
        sync();
      },
      { signal: events.signal },
    );
    document.addEventListener("visibilitychange", sync, {
      signal: events.signal,
    });
    window.addEventListener('touchstart', pauseInteraction, { passive: true, signal: events.signal });
    window.addEventListener('touchend', settleInteraction, { passive: true, signal: events.signal });
    window.addEventListener('touchcancel', settleInteraction, { passive: true, signal: events.signal });
    window.addEventListener('scroll', settleInteraction, { passive: true, signal: events.signal });
    window.visualViewport?.addEventListener('resize', settleInteraction, { passive: true, signal: events.signal });
    reduce.addEventListener("change", sync);
    canvas.addEventListener("webglcontextlost", cleanup, {
      signal: events.signal,
    });
    toggle.hidden = false;
    sync();
  } catch {
    // Keep the original image visible if WebGL or setup is unavailable.
    cleanup();
  }
  return cleanup;
}
