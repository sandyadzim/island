# Phase 1 static calibration and subsequent revisions

Phase 1 delivered the static scene foundation. User positioning/removal revisions
and the full-screen layout extension followed separately. The layout extension
is outside Phase 1; it does not complete navigation, content, or motion phases.

The scene uses the existing full 1536 × 1024 canvases. `Island.png` is the visual
reference and is not a compositing layer. All translations below are logical
stage pixels; scales are uniform. Registration origin is top-left. Source pivots
are measured contact/hull guides, not hit areas or permission to enable motion.

The projection is `stagePoint = translation + scale × sourcePoint`. The single
responsive scale is applied afterward. The CSS-only view expresses translations
and pivots as full-canvas percentages, producing the same registered composition.

## Registration record

| Asset | Translation x, y | Scale | Source pivot x, y | Registered pivot x, y | Assessment |
| --- | --- | --- | --- | --- | --- |
| 00 Environment | — | — | 768, 512 | — | Current full-screen backdrop uses cover fitting outside the island stage. Manifest retains historical (-24, -32, 1.03125) values; CSS bypasses that registration. |
| 01 Base | 0, 0 | 1 | 768, 512 | 768, 512 | Identity anchor; left plateau, terrain edges, paths and docks drift from the master. |
| 02 About house | 552.96, -30.72 | 0.33 | 795, 884 | 815.31, 261 | User-calibrated x 36%, y -3%; top headroom preserves the roof. |
| 03 Workshop | 138.24, 163.84 | 0.5 | 642, 662 | 459.24, 494.84 | User-calibrated CSS translation: x 9%, y 16%; scale retained at 0.5. |
| 04 Greenhouse | 752.64, 148.48 | 0.42 | 1135, 570 | 1229.34, 387.88 | User-calibrated x 49%, y 14.5%; scale retained. |
| 05 Home monument | 522.24, 296.96 | 0.34 | 865, 722 | 816.34, 542.44 | User-calibrated x 34%, y 29%; scale retained. |
| 06 Contact lighthouse v2 | 861.8, 410 | 0.36 | 1120, 900 | 1265, 734 | Contact guide aligned; tower, balcony, outbuildings and dock relationship differ. |
| 07 Experience sailboat | 983.04, 645.12 | 0.28 | 1120, 806 | 1296.64, 870.8 | User-calibrated x 64%, y 63%; scale retained. |
| 08 Grouped foreground | — | — | — | — | Removed from rendered scene at the user's request. Original/public files preserved. |
| 09 Combined FX | — | — | — | — | Removed from rendered scene pending future replacement artwork. Original/public files preserved. |

The landmark guides follow the reference footprints rather than relocating
buildings to invented positions on the regenerated base. Values are visual
calibration estimates; the supplied files cannot establish exact reconstruction.

The current table records the user's final inspected translations, superseding
the first delivery and an intermediate visual correction. Source pivots remain
in original-image coordinates, and no PNG pixels are changed.

## Current user-calibrated composition

The current table supersedes the first delivery's automatic placement estimates.
House, greenhouse, monument, workshop, and boat translations now use the user's
CSS inspection values exactly. Scales remain unchanged. Foreground and FX are
not mounted, requested, or awaited; eight active assets form the scene.

The logical stage remains 1536 × 1024. Its island frame is 1536 × 1056 at full
size, with 32 logical pixels of headroom and the original stage below it. Both
headroom and stage scale uniformly on smaller screens. The full-screen extension
subsequently separated the environment into a screen-covering backdrop; the prior
1.03125 stage overscan is historical. Percent registrations remain relative to
the original 1536 × 1024 stage, not the taller frame or the screen.

The workshop translation was subsequently replaced with the user's inspected
values: `--registration-x: 9%` and `--registration-y: 16%`. These correspond to
138.24 and 163.84 logical px, not 9 and 16 logical px. Its scale remains 0.5.

## Known limitations

- The base remains fixed even where its regenerated terrain no longer matches
  the master. Landmarks registered to master footprints may meet different
  ground contours or paths in this base.
- Broad baked exterior glows/shadows survive registration. No trimming, masks,
  filter, alternate blend mode, opacity repair, or replacement image is applied.
- The removed foreground contained independently displaced objects; it is no
  longer part of the composition.
- The removed FX contained recognizable building geometry and broad haze/water
  regions. Replacement artwork will be handled in a future request.
- Architectural differences, absent/refashioned details, reflection placement,
  and fixed stacking occlusions remain asset limitations. No exact-fidelity claim
  or gap-free motion claim is made.

## First-delivery validation history

The following results describe the original ten-layer, 3:2 viewport delivery.
The current composition changes above supersede its asset count and dimensions.

Checks performed on 7 October 2026 with Node 24.18.1 and the local Chromium
browser. Package versions are pinned and the npm lockfile is included.

- `npm run check`: zero errors, warnings or hints.
- `npm run build`: successful static build with one page.
- `npm test`: all ten tests pass, including cached/delayed load, decode rejection,
  cancellation during load/decode, missing decoded pixels, and source-pivot
  projection before responsive scaling.
- `npm run verify:assets`: all ten public copies match the originals by SHA-256.
  Their total size is 13,781,784 bytes (about 13.1 MiB); delivery optimization and
  physical mobile-device profiling remain later-phase work.
- Browser checks confirm exactly ten scene requests, cached-load success, fixed
  z-indices 0–90, FX opacity 0, and no CSS ambient animations.
- Holding all ten decode promises keeps the enhanced scene hidden in `loading`;
  releasing them reveals the whole assembly in `ready`. Rejecting a decode,
  blocking the About image, or blocking invisible ASSET-09 produces `error`,
  hides the incomplete scene, and keeps the semantic shell/status available.
- An injected setup failure restores the visible CSS-only `static` view. An
  accelerated 120-second watchdog confirms stalled decode recovery to `error`.
  Resizing also works when ResizeObserver is unavailable.
- Repeated initialization returns the same disposer. Repeated disposal is safe,
  restores `static`, clears the enhanced scale, and allows reinitialization.
- With JavaScript disabled, the scene remains visible; all ten image rectangles
  match their enhanced positions within 0.02 CSS px at the 375px test width.
- The accessibility tree contains one heading and zero announced decorative
  images. Keyboard Tab exposes the skip link; Enter focuses `main`.
- The production preview reaches `ready` and requests exactly ten scene assets.
  Its only client script is an approximately 3.9 KiB inline controller bundle;
  GSAP is absent. An 800 CSS-pixel viewport at device scale 2 tests a 200% layout-
  zoom equivalent, and 2× page zoom retains the 3:2 scene and no document overflow.
  Native browser zoom shortcuts were unavailable in this test surface.
- The UI detector and independent finish review found no material defects within
  the approved Phase 1 contract. Source pixel limitations remain accepted and
  separate from implementation validation.

| Browser viewport | Scene dimensions | Comparison / responsive result |
| --- | --- | --- |
| 1600 × 1400 | 1536 × 1024 | Full-size comparison; all six landmarks visible; residual base/foreground/architecture differences remain. |
| 1536 × 1200 | 1472 × 981.33 | Desktop shell gutters; uniform fit, no horizontal overflow. |
| 832 × 900 | 768 × 512 | Tablet comparison at half logical scale; registration preserved. |
| 768 × 900 | 704 × 469.33 | Tablet shell gutters; no horizontal overflow. |
| 375 × 650 | 375 × 250 | Mobile comparison; entire island visible, no cover cropping. |
| 320 × 600 | 320 × 213.33 | Narrow viewport; proportional scene, no horizontal overflow. |
| 667 × 375 | 603 × 402 | Landscape preserves the whole scene and allows normal vertical scrolling. |

The reference comparison assessed the supplied assembly rather than claiming a
pixel match. The foreground scale was reduced from an initial full-size trial
to 0.8 to prevent its displaced right rock from covering the sailboat hull.
The rocks still depart from their reference water positions.

## User-position revision validation — before full-screen layout

The rebuilt production preview renders eight images and reaches `ready`. Computed
registration values match the requested percentages exactly: house (36%, -3%),
workshop (9%, 16%), greenhouse (49%, 14.5%), monument (34%, 29%), and boat
(64%, 63%). Foreground and FX are absent from the scene DOM.

The refreshed desktop preview shows the complete house roof and background
coverage across the extra sky. At a 375 × 650 browser viewport, the scene measures
375 × 257.8125 px, with the original logical stage measuring 375 × 250 px and
7.8125 px of proportional headroom. The roof remains visible and the document
has no horizontal overflow. The temporary viewport override was reset afterward.

Astro/TypeScript checks and the production build pass. All 11 unit tests pass,
including exact percentage serialization for negative offsets. SHA-256 checks
confirm that all ten preserved public PNG copies still match their originals.
The earlier full loading/failure validation above is historical; this revision
rechecks the ready preview and responsive composition.

## Post-Phase-1 full-screen layout validation

The subsequent full-screen layout keeps every building and boat registration
above unchanged. The environment is now a separate screen-covering backdrop;
its old stage registration no longer determines background framing. The island
frame fits between reserved header/menu bands and sits to the right of the card
area on desktop. Before desktop enlargement, at 1536 × 1024 its measured size was 1117.086 × 767.992 px;
at 375 × 650, it is 375 × 257.813 px. Both previews reach `ready`, show the full
roof, and have no horizontal overflow. Header/card/menu slots contain no UI.
These checks apply to the layout revision;
they do not repeat or extend the earlier failure-path and motion validation.

## Desktop enlargement revision — superseded

The earlier enlargement used a larger frame on desktop widths above 900px and
heights above 600px: minimum
of 82vw and 88svh × 1536/1056, capped at 1536px, with a 1vw right inset.
At 1536 × 1024 the measured frame was 1259.516 × 865.914 px, approximately
12.75% larger than the prior layout. Roof and full island remain visible;
readiness reaches `ready` with no horizontal overflow. The 375 × 650 frame
remains 375 × 257.813 px. Short-landscape sizing and all registrations are
unchanged. Production build passes.

## Current desktop sizing — user adjustment to 65vw

The user reduced the desktop width limit from 82vw to 65vw. The current rule
for widths above 900px and heights above 600px is
`width: min(65vw, calc(88svh * 1536 / 1056))`, capped at 1536px, with a 1vw
right inset. At 1536 × 1024, the measured frame is 998.398 × 686.398 px,
approximately 20.7% smaller than the superseded 82vw version. The refreshed
preview reaches `ready`, shows the full island and roof, and has no horizontal
overflow. More room is available for the left card. Mobile and short-landscape
rules, background framing, and asset registration are unchanged. The production
build passes. These checks do not repeat the historical failure-path tests.

## Motion gates

Every parallax, interactive transform, ambient loop, and camera flag remains
false. FX baseline is 0. Static visual assessment and motion validation are
separate: Phase 1 never enables motion, even for an individually aligned layer.

## New ASSET-09 candidate — inactive

The user separately authorized replacement FX generation after Phase 1.
`public/assets/island/asset-09-lighting-atmospheric-fx-v2.png` now exists as a
1536 × 1024 transparent candidate. It is now mounted as ASSET-09 at z-index 90, identity registration, and opacity
zero, with static validation disabled. Nine sources are requested and decoded;
eight are visible. Generation still shows registration drift and broad glow, so
exact-fit acceptance has not passed. The original FX file is preserved and all
motion remains disabled. See [the generation and validation record](output/asset-09/README.md).
