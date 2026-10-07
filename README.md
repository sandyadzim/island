# Island Portfolio

A layered Astro scene currently displaying eight of the supplied PNG layers, with a ninth
replacement FX source mounted invisibly.
Phase 1 delivered the responsive scene, image readiness/error handling, and a
minimal semantic page shell. The full-screen layout is a separately requested
post-Phase-1 extension.

The ocean fills the viewport, with the island on the right and empty named slots
for identity, header controls, a left card, and a bottom menu. No UI components
are supplied in these slots yet.

## Run locally

Use Node 24 or newer (an even-numbered supported release) and npm.

```sh
npm ci
npm run dev
```

Astro prints the local URL. Production and verification commands:

```sh
npm run check
npm test
npm run verify:assets
npm run build
npm run preview
```

## Scope and delivery status

- **Phase 1 — complete:** static scene foundation, calibration record, reliable
  image loading, controller cleanup, and initial validation.
- **Subsequent calibration revision — complete:** user-supplied landmark
  percentages, 32 logical px of roof headroom, and removal of foreground/FX
  from rendering. All ten original/public asset files remain preserved.
- **Post-Phase-1 layout extension — complete:** full-screen backdrop and empty
  named layout slots. This does not complete Phase 2 navigation or Phase 3 UI.
- **Ocean animation — complete:** an independent WebGL water renderer uses the
  existing background, with a pause control and reduced-motion support.
- **Later phases — pending:** real controls, navigation/history, section content,
  panels, other scene motion, and device performance profiling.

## Current scene contract

- The source images in the project root are preserved. Public files are
  byte-identical deployment copies; no image processing pipeline is used.
- `src/components/island/scene-config.ts` owns layer order, registration,
  source-space pivots, destination mappings, and disabled motion gates.
- CSS supplies a proportional static scene without JavaScript. Enhancement
  applies one shared scale to a fixed 1536 × 1024 stage and reveals the assembly
  after all nine mounted images have loaded and decoded. The foreground and
  original FX remain removed; replacement FX v2 is mounted at opacity zero.
  All original files remain preserved for reference.
- The island frame includes 32 logical pixels of sky above the original stage
  so the house at y -3% is not clipped. The environment renders independently
  across the screen using `object-fit: cover`; the island fits without cropping.
  Its registration remains unchanged; no PNG pixels are edited.
- The desktop island fits within 65vw and 88svh, capped at
  1536px wide, with a 1vw right inset. Landmark registration is unchanged.
- At widths at or below 900 px, the island centers above the future card and menu.
  Short landscape screens retain the left-card/right-island arrangement.
- A failed image or decode hides the incomplete enhanced scene and leaves a
  visible error message. A 120-second deadline covers stalled requests. Reload
  the page to retry; the shell never becomes a blocking loading screen.
- `initIslandScene(root)` is idempotent and returns a disposer. Disposal cancels
  readiness work, disconnects resizing, clears timers/frames, and restores the
  CSS-only scene. Page hide/show handles the browser back-forward cache.
- GSAP is installed for later phases but is neither imported nor bundled here.
  Navigation, panels, portfolio content, and landmark motion are deferred.

## Ocean animation

The sailboat now has an eight-second CSS ambient cycle around its hull pivot,
with ±0.75 logical stage px of bobbing and ±0.15° of rocking. Its static
registration is unchanged. The shared control is labeled **Pause motion** and
pauses both water and boat, including when hidden/offscreen. Reduced motion
removes the boat animation and restores its neutral transform. Desktop motion
extremes, mobile layout, shared pause/resume, and reduced motion were checked in
Ego Lite. The missing, invisible ASSET-09 entry was removed from the active
configuration so it no longer blocks readiness; eight existing images now load.

The user authorized water motion separately on 7 October 2026. This supersedes
the earlier static-only gate for the ocean; other asset motion remains disabled.
`src/scripts/ocean-water.ts` refracts the existing ASSET-00 texture with overlapping
waves, increasing displacement toward the foreground. Source-space exclusion
zones protect the embedded rocks, and the horizon/sky remain static. These are
soft approximate masks, not a separately painted segmentation asset.

The canvas shares the background's centered cover fitting and sits below the
island layers. No new artwork, image edits, dependencies, or island transforms
were needed. Rendering is capped at 30 fps and 1600 × 1200, with pixel density
capped at 1.5. Work pauses when hidden or offscreen. The visible Pause water
control remembers the user's choice; system reduced motion always takes priority.
Unsupported WebGL, setup failure, and context loss retain the original image.

Validation: Astro check/build and all 11 existing tests pass. Ego Lite checks
confirmed animated ocean pixels, static sampled sky/rock interiors, pause/resume,
live reduced-motion changes, a 390 × 844 viewport, and context-loss fallback.
Ordinary mobile-device frame-rate profiling remains unverified.

See [phase-1-calibration.md](phase-1-calibration.md) for registration measurements,
visual limitations, and validation results. The technical specification records
the current scope amendments; the animation specification defines future motion gates. Static assessment and the layout
extension do not approve motion.

## New ASSET-09 candidate — inactive

The user separately authorized replacement FX generation after Phase 1.
`public/assets/island/asset-09-lighting-atmospheric-fx-v2.png` now exists as a
1536 × 1024 transparent candidate. It is now mounted as ASSET-09 at z-index 90, identity registration, and opacity
zero, with static validation disabled. Nine sources are requested and decoded;
eight are visible. Generation still shows registration drift and broad glow, so
exact-fit acceptance has not passed. The original FX file is preserved and FX
motion remains disabled. See [the generation and validation record](output/asset-09/README.md).
