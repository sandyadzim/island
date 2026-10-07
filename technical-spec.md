# Interactive Portfolio Technical Specification

## 1. Purpose and authority

This document defines the architecture and implementation plan for a static, progressively enhanced interactive portfolio. The user authorized and completed Phase 1 implementation, followed by explicit calibration revisions and a separate full-screen layout extension. Requirements for later phases remain planned; this document alone does not authorize those phases.

[island-animation-spec.md](island-animation-spec.md) is authoritative for motion behavior, limits, transform ownership, accessibility gates, and visual validation. `Island.png` is the visual composition reference. This document defines application architecture and the approved scope amendments below. Future motion must respect the current composition and its validation gates.

The island is a navigation experience alongside accessible text navigation and semantic portfolio content. Content and navigation must remain usable without JavaScript, GSAP, or successfully loaded scene images.

## Current scope amendments — 7 October 2026

The user subsequently authorized ocean animation. An independent WebGL canvas
now refracts the existing ASSET-00 background, below the fixed island layers,
with source-space masks for sky and embedded rocks. It includes a persistent
pause control, live reduced-motion handling, hidden/offscreen suspension, and
static-image fallback. This overrides the earlier static-only requirement for
water; navigation, landmark motion, and ASSET-09 remain deferred. See the
README ocean-animation section for implementation and validation limits.

Phase 1 is complete. Its original delivery was the ten-layer, centered 3:2 scene with a minimal semantic shell. Subsequent user instructions supersede those rendering requirements:

- Render eight assets, ASSET-00 through ASSET-07. Preserve all ten original and public PNGs. ASSET-08 and ASSET-09 are removed from markup, requests, and readiness checks; replacement FX is deferred to a separate request.
- Keep the 1536 × 1024 island stage and base identity registration. Use the exact user-calibrated landmark percentages in [phase-1-calibration.md](phase-1-calibration.md), with 32 logical px of roof headroom.
- The full-screen layout is a **post-Phase-1 extension**, not part of the Phase 1 acceptance scope or completion of Phase 2/3. ASSET-00 covers the screen independently; the island frame fits uniformly on the right. Empty slots reserve identity, header controls, left-card, and bottom-menu space. No buttons, cards, menu items, portfolio content, or motion are implemented.
- Below 900px, center the island above the card/menu spaces. Short landscape screens use the side-by-side arrangement. Preserve landmarks without cropping; only the background uses cover fitting.
- Navigation, section behavior, GSAP coordination, and all motion remain future work. [DESIGN.md](DESIGN.md) describes the current layout. Historical validation is explicitly labeled in the calibration record.

These amendments take precedence over the original rendering plan and historical asset-production tickets.

## 2. Inspected project baseline

At initial inspection, the project contained only the reference, ten scene PNGs, and the two asset/motion specifications. It now contains a runnable static Astro application, strict TypeScript, Tailwind via its Vite integration, a locked npm dependency tree, and scene/readiness utilities. The structure below mixes implemented foundation files with planned navigation/content files; those future files are not delivery claims.

All eleven inspected images are 1536 × 1024. `Island.png` and ASSET-00 have no alpha channel; ASSET-01 through ASSET-09 have alpha channels. An alpha channel does not establish that every exterior pixel is transparent or that a layer composites cleanly. The ten scene files total approximately 13.1 MiB before transfer compression.

Visual inspection confirms that the supplied layers are generated candidates: landmarks have different sizes/details from the reference, several have broad exterior halos, and base/foreground placement differs. ASSET-09 includes window/building geometry, haze, and water regions. Static assembly has been assessed and revised; combined-motion tests remain future work. Exact reconstruction must not be claimed from this inspection.

## 3. Stack and styling responsibilities

Use Astro.js to generate static HTML, TypeScript for browser behavior and typed configuration, Tailwind CSS for general UI, dedicated CSS for the scene, and GSAP for complex coordinated motion only. Select mutually compatible stable versions and lock them during implementation. No backend or client UI framework is required.

| Technology | Responsibility |
| --- | --- |
| Astro components | Page structure, layout, navigation, scene markup, and server-rendered portfolio sections |
| TypeScript and native DOM | Navigation state, events, image readiness, geometry, preferences, observers, and cleanup |
| Tailwind CSS | General layout, typography, spacing, responsive UI, sections, buttons, cards, navigation, and panels |
| Dedicated scene CSS | Logical coordinates, layer placement, compositing, z-index, registration properties, transform wrappers, hit-area geometry, optional CSS masks, and scene effects |
| CSS transitions/keyframes | Hover/press feedback, labels, simple opacity transitions, validated boat bobbing and FX variation |
| GSAP | Pointer parallax, shared camera pan/zoom, interruptible coordinated scene transitions, and any justified complex multi-layer motion |

Do not encode complex scene geometry as Tailwind utility chains. CSS masks are not a default repair strategy and must not remove landmark geometry or manufacture replacement artwork. CSS and GSAP must never own transforms on the same element. Do not add a motion library, state library, router, UI framework, or GSAP plugin without a concrete need.

## 4. Proposed project structure

```text
/
├── technical-spec.md
├── island-animation-spec.md
├── island-asset-production.md
├── Island.png                         # Original visual reference
├── asset-00-…png through asset-09-…png # Original files remain preserved
├── public/
│   └── assets/island/                 # Byte-identical copies of the ten PNGs
├── src/
│   ├── pages/index.astro
│   ├── layouts/PortfolioLayout.astro
│   ├── components/
│   │   ├── PortfolioNav.astro
│   │   ├── MotionToggle.astro
│   │   ├── island/
│   │   │   ├── IslandScene.astro
│   │   │   ├── IslandLayer.astro
│   │   │   ├── LandmarkControl.astro
│   │   │   └── scene-config.ts
│   │   └── sections/
│   │       ├── SectionPanel.astro
│   │       ├── About.astro
│   │       ├── Projects.astro
│   │       ├── Skills.astro
│   │       ├── Experience.astro
│   │       └── Contact.astro
│   ├── styles/
│   │   ├── global.css                # Tailwind entry and shared UI tokens
│   │   └── island-scene.css          # Dedicated scene rules
│   ├── scripts/
│   │   ├── portfolio-navigation.ts
│   │   └── island-controller.ts
│   ├── data/portfolio.ts             # Typed, supplied portfolio content
│   └── utils/
│       ├── scene-geometry.ts
│       └── motion-preference.ts
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

The ellipses above abbreviate filenames only; use the exact filenames in the asset manifest below. Public copies are deployment copies, not new image variants. Do not move, edit, rename, or delete the originals. `Island.png` remains a reference rather than an eleventh compositing layer.

Keep Astro components presentational. A bundled Astro script initializes the native DOM controllers once; no `client:*` hydration directives are needed. `scene-config.ts` is the single typed manifest for asset IDs, URLs, fixed z-index, registration, source-space pivots, hit geometry, destinations, motion limits, and validation flags. General navigation must not depend on the scene controller being ready.

## 5. Unified island scene

### Asset manifest and stacking

The asset inventory below preserves all ten supplied files. Render only ASSET-00 through ASSET-07, with normal blending and fixed back-to-front order. ASSET-00 is a separate full-screen backdrop; the seven island layers share their calibrated stage:

| ID | Exact filename | z-index | Role / navigation |
| --- | --- | --- | --- |
| ASSET-00 | `asset-00-environment-background.png` | 0 | Environment |
| ASSET-01 | `asset-01-clean-island-base.png` | 10 | Primary spatial anchor |
| ASSET-02 | `asset-02-creators-house-about.png` | 20 | About → About Me |
| ASSET-03 | `asset-03-workshop-projects.png` | 30 | Projects → Selected Work |
| ASSET-04 | `asset-04-greenhouse-skills.png` | 40 | Skills → Tech Stack |
| ASSET-05 | `asset-05-sr-monument-home.png` | 50 | Home → navigation hub |
| ASSET-06 | `asset-06-lighthouse-contact-v2.png` | 60 | Contact |
| ASSET-07 | `asset-07-sailboat-experience.png` | 70 | Experience → Career Journey |
| ASSET-08 | `asset-08-foreground-occlusion.png` | 80 | Removed from rendering; preserved reference file |
| ASSET-09 | `asset-09-lighting-atmospheric-fx.png` | 90 | Removed from rendering; future replacement deferred |

ASSET-06 must use v2. Hover never changes z-index. ASSET-08 and ASSET-09 are inactive preserved files; do not remount them as part of navigation or motion work.

### Coordinates, registration, and transform ownership

Use a fixed 1536 × 1024 logical stage. Every island layer retains its entire canvas and padding and occupies that same stage rectangle before registration. Do not use per-landmark `object-fit: cover`, trim transparent bounds, or independently center visible content. ASSET-00 alone uses `object-fit: cover` in the separate screen backdrop.

The wrapper hierarchy is:

`responsive scale → shared camera → fixed-z asset layer → static registration → GSAP parallax → CSS ambient → CSS interaction → existing image`

The responsive wrapper owns uniform viewport scaling. The island camera applies equally to the seven stage layers. The backdrop is outside that camera; any future coordinated backdrop motion requires separate coverage validation. The static registration wrapper owns calibrated translation and uniform scale only. ASSET-01 has neutral animation wrappers and remains the registration anchor; shared camera motion may move the whole assembly. Resolve actual ground-contact origins for interaction and hull-center origin for boat motion. Store source-space origins and transform them through registration rather than applying master-coordinate guesses directly to enlarged source artwork.

Calibrate against original footprints in `Island.png` before motion. Record each layer's translation, scale, pivot, and validation outcome in configuration. Do not rotate, mirror, skew, or change perspective to compensate. Runtime transforms cannot repair architectural differences. Report residual drift; if motion exposes it, retain neutral transforms and control/label feedback.

### Responsive scaling

Reserve a full-screen shell of at least 100svh. The island frame has aspect ratio 1536:1056, including 32 logical px of roof headroom above the original 3:2 stage. Its width fits the available header/menu band and desktop right-side area, capped at 1536px. Apply `s = frameWidth / 1536` once to the original stage; the CSS-only fallback must match. Clip only at the outer screen viewport, never around buildings. The full-screen background may cover-crop; island landmarks may not.

Keep registration constant across desktop, tablet, and mobile. Adapt surrounding navigation and panels independently; place panels below the scene on narrow screens. Keep every landmark visible without horizontal scrolling or mobile cover-cropping. Logical motion pixels are scaled by the parent; never multiply their values by `s` again.

## 6. Navigation and hit areas

Use real fragment links in this logical DOM order: Home (`#home`), About (`#about`), Projects (`#projects`), Skills (`#skills`), Experience (`#experience`), Contact (`#contact`). The landmark mapping is ASSET-05, 02, 03, 04, 07, 06 respectively. Render the same destinations in an always-visible text navigation outside the scene. Include a skip link to portfolio content.

Decorative images have empty alternative text, are non-focusable, and use `pointer-events: none`. Full-canvas images must never become full-scene link targets. Give each landmark an independently positioned, named DOM control and a visible label/discoverability cue.

Maintain hit geometry in logical source coordinates tied to static registration. Project registered positions through current parallax, camera, and responsive scale into a separate controls overlay. Cache geometry and update controls alongside motion writes, without layout reads on every event. Keep control sizes and 2 CSS px focus outlines in CSS pixels, with at least 44 × 44 CSS px targets where feasible. Avoid occluded regions and overlapping targets; on small screens rely on the equally usable text navigation if enlargement would create ambiguity. Keyboard focus styling must remain visible outside artwork occlusion.

### Enhanced section state

Use a single state: `home | about | projects | skills | experience | contact`. Render all section content in HTML initially. Once navigation initializes successfully, present the active section as a nonmodal panel, with inactive sections hidden and removed from keyboard navigation. Reuse the existing section DOM; do not duplicate content or require remote requests.

Intercept only ordinary internal-link activation after enhancement is ready; preserve modified clicks and native links otherwise. Synchronize state with fragments and browser history. Resolve direct fragment loads, Back/Forward, and repeated activation deterministically; unknown fragments must retain native behavior. Home closes the panel and restores the hub. Navigation begins immediately and never waits for an animation.

Move focus to the opened section heading; provide a close button and Escape handling. Close restores focus to the initiating control, or the Home text link if that control is unavailable. Keep navigation accessible while the nonmodal panel is open; do not trap focus. A future modal design would require a separate modal focus contract.

## 7. Motion and GSAP lifecycle

Implement the complete state rules and budgets in `island-animation-spec.md`; the following are architecture defaults, not replacements for that document:

- Buildings never have idle transform, brightness, opacity, or rotation loops. CSS owns hover/press/leave feedback. Focus alone leaves artwork neutral.
- Differential parallax starts at zero for every layer. Enable individual coefficients only after seam/coverage tests at extremes, diagonals, combined hover/bob/camera states, and smallest/largest supported viewports.
- Boat bobbing is disabled until static and reflection checks pass. If enabled, CSS uses the specified 8-second cycle, ±0.75 logical px y and ±0.15° rotation.
- ASSET-09 is absent, with no FX loop. Do not enable or restore the removed image. A future replacement needs separate authorization and a fresh compositing/motion review.
- Optional pointer camera focus uses the shared camera, at most scale 1.02 and ±8/±5 logical px translation over 280 ms with `power2.out`. Preserve the entire island; disable unsafe translation/zoom. Keyboard activation resets the camera immediately without positional motion.

Initialize an idempotent controller scoped to the scene root, returning a disposer. Import GSAP dynamically only when an enabled motion feature needs it. Its failure must leave navigation and static composition intact. Use a scoped GSAP context, cached targets, reusable setters or retargeted tweens, and overwrite behavior to avoid queued animations. Preserve current values when retargeting interrupted camera motion.

Use one scene pointer handler, fine-pointer hover media queries, clamped normalized input, and the specified 280 ms parallax response. Return to neutral on pointer leave/cancel. Refresh cached geometry on resize/scroll in a batched read/write schedule. Do not run permanent RAF polling.

Pause CSS loops and GSAP work when the document is hidden, the scene is offscreen, or a section is open. Freeze parallax while a section is open; closing allows input-driven resumption subject to all gates. On disposal, remove listeners, disconnect observers, cancel pending frames, kill/revert scoped tweens, and clear temporary `will-change`. Use ordinary page lifecycle; Astro client routing is unnecessary. If added later, disposal/reinitialization must also cover its navigation lifecycle.

## 8. Motion preference and accessibility

Read `prefers-reduced-motion` before enabling motion and listen for changes. Provide a visible Motion on/off button with an accessible pressed state. Effective decorative motion requires OS motion permission, user permission, scene readiness/visibility, and the applicable visual validation flags. A user setting cannot override an OS reduce preference. Persist an explicit choice if preference storage exists; storage failures must be harmless.

Reduced motion and user Motion off suppress parallax, bobbing, FX breathing/drift, camera motion, and landmark positional feedback. Kill GSAP work and reset animation wrappers to neutral while retaining static registration and an approved constant FX baseline. Preserve labels, colors, cursor, and high-contrast focus feedback with immediate updates or opacity transitions no longer than 100 ms. Keyboard focus never starts camera/parallax or ambient motion.

Use semantic header/nav/main/section/footer elements, one descriptive h1, meaningful section headings, logical tab order, readable contrast, and no duplicate decorative screen-reader announcements. Links support Enter; buttons support Enter/Space. Coarse pointers receive immediate tap navigation without simulated hover. Verify keyboard use, screen-reader navigation, browser zoom, and live preference changes.

## 9. Asset loading and performance

Serve byte-identical PNGs from `public/assets/island/` using ordinary image elements and explicit intrinsic dimensions. Do not run them through image transforms, format conversion, resizing, crop exports, generated `srcset`, or replacement artwork. Optimization means delivery/caching and runtime efficiency within the fixed-image constraint.

Prioritize the environment request if it is the measured initial visual bottleneck; avoid unnecessary preload duplication of the eight active images. Request the visible scene layers without lazy-loading them into staggered arrivals. Decode all eight active sources once before revealing the backdrop and island together. Do not request or await ASSET-08/09. Respect cached load completion and handle load/decode errors. A failed scene must leave visible text navigation/content and a short DOM status message, without an endless loading screen.

Use HTTP caching with release-aware invalidation, transfer compression where useful, and an early HTML/CSS render for content. The eight active PNGs total 10,838,452 bytes (approximately 10.3 MiB); all ten preserved files total approximately 13.1 MiB. Measure actual active-image transfer on a throttled mobile connection; do not promise a small first load. No image-based loading placeholder or new bitmap is allowed.

Animate transform and opacity only; never animate layout offsets/dimensions, full-canvas filters, or blend modes. Avoid permanent promotion of full-canvas layers and all wrappers. Apply `will-change` selectively during active motion and clear it afterward. No runtime alpha scans or repeated rectangle reads during pointer events. Profile on desktop and an ordinary mobile device for sustained painting, memory pressure, and frame delivery; reduce decorative motion first.

## 10. SEO and progressive enhancement

Generate semantic static HTML with all supplied portfolio content, section IDs, a descriptive title/meta description, language, viewport metadata, and one h1. Set canonical URL and robots/sitemap data when the real deployment URL is known. Use truthful supplied identity/project information; do not invent credentials, portfolio entries, social links, or contact endpoints. Social metadata may reference the existing `Island.png` if appropriate; no generated social image.

Without JavaScript, every section remains visible and both navigation systems use normal fragment links. Do not ship content hidden by default behind enhancement classes. Scene image failure or GSAP failure must not disable content links. Navigation enhancement and decorative-motion initialization are independent. With JavaScript enabled, expose enhanced-only controls after handlers exist; with reduced motion, preserve full section functionality.

## 11. Implementation phases

| Phase | Scope | Completion criteria |
| --- | --- | --- |
| 1. Island Scene Foundation — complete | Required stack, minimal semantic shell, typed manifest, scene CSS, responsive stage, readiness/error handling, and static calibration. Original ten-layer delivery was subsequently revised to eight active layers. | Build/type checks, checksum checks, calibration record, and initial browser validation delivered. Lighthouse v2 and base identity preserved; all motion disabled. Historical validation is distinguished from later revision checks. |
| Post-Phase-1 layout extension — complete | Full-screen backdrop; uniformly fitted island on the right; empty header, card, and bottom-menu slots; narrow/landscape layout rules. | Desktop/mobile composition verified without horizontal overflow. No UI components, navigation, content, or motion added. This extension is outside Phase 1 and does not complete Phase 2/3. |
| 2. Navigation & Scene Transitions — pending | Add six landmark links, persistent text navigation, fragment/history state, nonmodal section shell, focus/close behavior, motion toggle, and optional validated GSAP coordination. | Every destination works by mouse, keyboard, and touch; direct fragments and Back/Forward work; Escape/close restore focus; no queued camera motion; no-JS and no-GSAP paths work; reduced motion applies at load and when changed. No fabricated content is required to verify the shell. |
| 3. Portfolio Content — pending | Populate About Me, Selected Work, Tech Stack, Career Journey, and Contact with supplied content; style responsive sections, cards, and panels using Tailwind. | Approved content is present in static HTML, headings/links are meaningful, contact links are real, panels remain readable on mobile, and both navigation systems reach identical sections. Missing content is recorded rather than invented. |
| 4. Performance, Accessibility & Polish — pending | Validate motion gates, delivery/runtime performance, lifecycle cleanup, accessibility, SEO, and responsive behavior. | Production build/type checks pass; test no-JS, failed images/GSAP, OS/user motion settings, keyboard and touch, rapid navigation, resize, hidden/offscreen pause, and combined motion extremes. Verify on ordinary mobile hardware; retain static behavior for failed visual/performance gates and document limitations. |

Do not enable a motion feature merely to complete a phase. A documented static fallback is valid where supplied pixels prevent safe movement; claiming exact reference fidelity is not.

## 12. Definition of Done

- [x] Required foundation stack and responsibility boundaries are implemented with minimal client JavaScript and dependencies.
- [x] All ten original/public PNGs remain unchanged; eight active assets use the documented stacking, calibration, and visual limitations.
- [x] Static foundation responsiveness was validated; current full-screen layout was checked on desktop/mobile with the original 3:2 stage inside its headroom frame. Future motion/UI responsiveness still needs validation.
- [ ] All six destinations work through island controls and always-accessible text navigation, including without JavaScript.
- [ ] Motion follows `island-animation-spec.md`; unvalidated FX/parallax stay disabled, and buildings stay grounded.
- [ ] Keyboard/focus behavior, reduced motion, user motion control, pause/resume, and cleanup are verified.
- [ ] Supplied content, basic SEO, build/type checks, and desktop/mobile performance checks are complete.
- [ ] No GIF, video, new/modified image assets, or unnecessary dependencies are introduced.

## New ASSET-09 candidate — inactive

The user separately authorized replacement FX generation after Phase 1.
`public/assets/island/asset-09-lighting-atmospheric-fx-v2.png` now exists as a
1536 × 1024 transparent candidate. It is now mounted as ASSET-09 at z-index 90, identity registration, and opacity
zero, with static validation disabled. Nine sources are requested and decoded;
eight are visible. Generation still shows registration drift and broad glow, so
exact-fit acceptance has not passed. The original FX file is preserved and all
motion remains disabled. See [the generation and validation record](output/asset-09/README.md).
