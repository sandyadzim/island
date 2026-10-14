import { readExperienceProfile } from '../utils/experience-profile';
import { initIslandExplorer } from './island-explorer';
import { initIslandMusic } from './island-music';

// The inline gate and template mount already chose a scene before module loading.
const profile = readExperienceProfile();
let disposers: Array<() => void> = [];
let generation = 0;

function dispose() {
  generation++;
  disposers.forEach((release) => release());
  disposers = [];
}

async function initialize() {
  dispose();
  const current = generation;
  const root = document.querySelector<HTMLElement>('.portfolio-shell');
  const scene = root?.querySelector<HTMLElement>('[data-island-scene]');
  if (!root || !scene) return;
  disposers.push(initIslandExplorer(root, profile), initIslandMusic(root));
  try {
    if (profile === 'lite') {
      const { initLiteIsland } = await import('./island-lite');
      if (generation !== current) return;
      disposers.push(initLiteIsland(scene));
    } else {
      const [{ initIslandScene }, { initHeroReveal }] = await Promise.all([
        import('./island-controller'),
        import('./hero-reveal'),
      ]);
      if (generation !== current) return;
      disposers.push(
        initIslandScene(
          scene,
          root.querySelector('[data-water-motion-toggle]'),
        ),
        initHeroReveal(root),
      );
    }
  } catch {
    if (generation !== current) return;
    // Keep the selected static artwork and reading/navigation paths available.
    scene.dataset.sceneState = profile === 'lite' ? 'error' : 'static';
    const status = scene.querySelector<HTMLElement>('[data-scene-status]');
    if (status)
      status.textContent =
        'Read Portfolio or use the portfolio navigation to browse all sections.';
  }
}

void initialize();
window.addEventListener('pagehide', dispose);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) void initialize();
});
