# Island Asset Production

Status: historical asset-production brief. Ten supplied PNGs now exist and are
preserved byte-for-byte in the project root and public directory. This record
does not establish which generation tickets produced them or claim acceptance.

## Current runtime scope

Phase 1 static foundation is complete. Subsequent user calibration removed
ASSET-08 and ASSET-09 from the rendered scene; their files remain preserved.
The active lighthouse is `asset-06-lighthouse-contact-v2.png`. The original
ASSET-06 ticket filename below describes the historical production brief.

A separate post-Phase-1 layout extension uses ASSET-00 as an edge-to-edge
background and places the calibrated island beside empty header/card/menu
spaces. This changes runtime framing, not PNG pixels or source-canvas rules.
The 1536 × 1024 production canvas is still required for any separately requested
asset work. The current scene has 32 logical px of roof headroom.

The ten-layer compositing order and ASSET-08/09 tickets below are historical
production intent, not instructions to remount retired layers. New FX is planned
for a later request; reading this document does not authorize its generation.
See [technical-spec.md](technical-spec.md), [DESIGN.md](DESIGN.md), and
[phase-1-calibration.md](phase-1-calibration.md) for current implementation truth.

Master reference: `Island.png` in this project. Inspect and supply this exact image as the visual reference for every generation task. This document supplements the image; descriptions and coordinates never override visible evidence in it.

The island is an interactive portfolio: SR Monument → Home / Navigation Hub; Creator's House + Observatory → About Me; Workshop → Projects / Selected Work; Greenhouse → Skills / Tech Stack; Lighthouse → Contact; Sailboat / Harbor → Experience / Career Journey.

Execute only the ticket ID explicitly requested by the user. Each ticket produces one image, never a batch of other tickets. Do not generate images while preparing or reading this document.

## Global Alignment Rules

1. **One world, one camera, one lighting setup, one scale system.** Preserve the master’s exact viewing direction, camera elevation, apparent focal length, perspective, object orientation, and relative scale. Match the image itself rather than imposing a mathematically ideal isometric projection. Do not rotate, redesign, enlarge, or reframe subjects.
2. **Shared canvas:** use the master’s 1536 × 1024 pixel canvas, aspect ratio 3:2, with top-left origin `(0, 0)`. Every output retains this full canvas and its subject’s original screen position. Composite at `(0, 0)`, scale 1, without per-layer fitting. If generation cannot deliver this exact size, mark the output unaligned for review; do not silently stretch or accept it. Any later export resizing must apply the same uniform transform to every layer.
3. **Registration guides:** approximate centers are house `(845, 183)`, workshop `(544, 425)`, greenhouse `(1203, 346)`, SR `(872, 489)`, lighthouse complex `(1266, 623)`, and sailboat `(1306, 789)`. These are locating aids, not replacement geometry or crop bounds. Derive actual silhouettes, footprints, and positions from the master. Retain full-canvas transparent padding; no automatic trimming or tight crops.
4. **Art direction:** polished, stylized low-poly 3D miniature diorama; cozy fantasy island; simplified but detailed geometry; faceted rocks; rounded stylized trees; warm Mediterranean / European-inspired architecture with cream walls, wood accents, tiled roofs, and illuminated windows. Preserve each building’s actual roof color: the workshop has a dark blue-gray roof, unlike the warm tiled roofs of the house and lighthouse annex.
5. **Lighting:** match the sunset glow from the right-hand horizon, the master’s warm highlights and cool blue shadows, deep blue ocean, warm orange/yellow practical lights, soft global illumination, and restrained bloom. Match visible shading rather than inventing a new sun direction. No daylight, night-time relighting, additional light sources, or stylistic changes.
6. **Asset ownership:** environment owns sky, horizon, distant islands, open water, distant lights, and their reflections. Base owns island terrain, retaining walls, paths, stairs, lawns, planted vegetation, beach, fixed harbor/docks, loose rowboat, and ground lanterns, except the explicitly assigned foreground pieces. Interactive assets own their building/monument/boat geometry and attached details. Occlusion owns only the explicitly identified front tree and detached foreground rocks. FX owns only supplemental atmospheric effects, never opaque scene geometry.
7. **Removal and reconstruction:** environment and base are clean plates. Remove specified objects, their silhouettes, attached details, and object-specific shadows, spill, reflections, and haze; reconstruct what they concealed using adjacent terrain/water/material cues. No blank holes, ghost silhouettes, obvious cloning, or replacement landmarks. Preserve illumination from retained sources. Hidden content is a conservative reconstruction, not a claim of exact recovery.
8. **Interactive isolation:** use RGBA PNG with genuine transparency outside geometry, clean antialiased edges, and safe transparent padding. No painted checkerboard, matte color, background scenery, labels, UI, characters, or extra props. Preserve glass and other translucent materials through partial alpha where appropriate, without retaining the reference scenery inside them.
9. **Grounding and animation:** keep body shading, lit window surfaces, and attached light sources on the owning object. Exclude long terrain shadows, broad ground light pools, water reflections, and exterior halos from isolated geometry. Base removes effects belonging to removed landmarks. ASSET-09 can restore subtle grounding effects for the resting scene, but is supplemental: a single FX image does not provide independently animatable shadows/reflections for every landmark. Later dynamic effects require separately authorized work.
10. **Occlusion:** preserve reference-visible surfaces. Complete only hidden geometry needed for a continuous silhouette when a small hover/translation reveals it, using the same design. Do not render removed trees or walls into a building. These are 2D layers suited to modest motion, parallax, and image zoom; they do not establish new camera views or unseen 3D architecture.
11. **Lettering:** the monument must read exactly **SR**, uppercase Latin S followed by uppercase Latin R. Preserve the master’s sculptural arrangement while maintaining that reading. Never RS, extra characters, invented writing, or labels.
12. **Acceptance:** compare each output over the master and over the assembled plates at the shared origin. Reject camera, silhouette, footprint, scale, light, or design drift. Inspect alpha edges against light and dark backgrounds. Generative reconstruction may require revision before convincing registration; a matching prompt alone is not proof of alignment.

## Original production compositing order — historical

Back to front, using normal source-over compositing unless an effect is explicitly authored otherwise:

1. ASSET-00 — Environment Background.
2. ASSET-01 — Clean Island Base.
3. ASSET-02 — Creator's House / About.
4. ASSET-03 — Workshop / Projects.
5. ASSET-04 — Greenhouse / Skills.
6. ASSET-05 — SR Monument / Home.
7. ASSET-06 — Lighthouse / Contact.
8. ASSET-07 — Sailboat / Experience.
9. ASSET-08 — Foreground Occlusion.
10. ASSET-09 — Lighting & Atmospheric FX, restrained overlay.

The landmark order is a starting stack: confirm overlaps against the master. Use masks derived from the retained base vegetation/walls where they must cover landmark geometry; do not paint duplicates of those occluders onto landmarks. ASSET-08 restores the designated front pieces. ASSET-09 should not wash out geometry; its local grounding effects may need compositing masks to remain behind objects. Camera focus/zoom transforms the assembled scene as one group; independent hover transforms use each landmark’s original base/footprint as the pivot.

---

## ASSET-00 — Environment Background

- **Ticket ID:** ASSET-00
- **Purpose:** Continuous background behind the island, supporting parallax and revealing clean water around modest island movement.
- **Include:** Sunset sky and clouds, distant rocky islands, horizon, deep blue ocean, existing distant warm lights and their water reflections. Naturally reconstruct open water hidden by the entire main island and its nearshore structures.
- **Exclude:** Main island, all its buildings, SR, vegetation, beach, bridges, docks, both nearshore boats, island-specific lighting/reflections/foam, and the detached foreground rocks assigned to ASSET-08.
- **Layer/transparency requirements:** Opaque full-canvas PNG, 1536 × 1024. No transparency or remaining foreground silhouettes.
- **Complete image-generation prompt:**

  > Use the attached Island.png as the sole master visual reference. Generate only a clean environment background plate for that exact scene, on its original 1536 × 1024 canvas with identical framing. Preserve the exact camera direction, elevation, perspective, apparent focal length, horizon height, scale, sunset lighting direction, cool shadows, deep blue ocean, warm distant reflections, soft global illumination, restrained bloom, and polished stylized low-poly 3D miniature-diorama aesthetic. Keep the reference sky, clouds, distant rocky islands, distant lights, and open ocean at their original positions. Remove the entire central island and everything belonging to it: buildings, monument, trees, terrain, beach, docks, bridge, rowboat, sailboat, associated foam, shadows, light spill, and water reflections. Also remove the detached rocks nearest the camera along the lower edge. Reconstruct all concealed areas as continuous, naturally varying blue ocean matching adjacent water and the existing perspective. Preserve distant background rocks and islands. No replacement island, new landmarks, characters, text, labels, UI, or reframing. Output one opaque PNG background plate only.
- **Acceptance criteria:** Horizon and distant features register with the master; removed subjects leave no ghosts or lighting remnants; reconstructed water has natural continuity; full canvas is opaque.
- **Output filename:** `asset-00-environment-background.png`

## ASSET-01 — Clean Island Base

- **Ticket ID:** ASSET-01
- **Purpose:** Stable terrain and infrastructure supporting all independently interactive landmarks.
- **Include:** Main island landmass and coastal rock geometry; terraces, cream stone walls, central paths and stairs; lawns, flowers, shrubs and trees except the ASSET-08 tree; beach, bridge, fixed wooden docks, harbor fixtures, loose rowboat on the beach; independent ground lanterns and their lighting. Reconstruct terrain behind removed landmarks and foreground tree.
- **Exclude:** House/observatory and attached gardens/pergola; workshop and attached work props; greenhouse and contained plants; SR sculpture and pedestal; lighthouse and annex; sailboat; object-owned shadows/light spill/reflections; sky, open ocean, detached foreground rocks; ASSET-08 tree.
- **Layer/transparency requirements:** Full-canvas RGBA PNG, 1536 × 1024. Transparent beyond the terrain/infrastructure silhouette, between dock supports, and through bridge gaps. Keep the beach rowboat. Exclude water fill and broad shoreline foam so ASSET-00 supplies water and ASSET-09 supplies supplemental foam.
- **Complete image-generation prompt:**

  > Use attached Island.png as the single source of truth. Generate only its clean island base, at the original position and scale on a 1536 × 1024 transparent canvas. Preserve the exact reference camera direction, elevation, perspective, apparent focal length, island silhouette, terrace heights, coastline, materials, sunset direction, warm highlights, cool blue shadows, soft global illumination, and polished stylized low-poly 3D cozy diorama rendering. Retain the island rock mass, cream retaining walls, paved paths and steps, grass, flowers, shrubs, non-designated trees, beach, wooden bridge, fixed docks and harbor fixtures, loose beach rowboat, and independent ground lanterns. Remove the hilltop house with observatory, attached pergola and terrace furnishings; workshop and attached props; glass greenhouse and plants inside it; SR sculpture and circular pedestal; lighthouse and attached annex; and the harbor sailboat. Remove the rounded foreground tree centered approximately at x=850, y=720, including trunk and canopy; preserve and reconstruct the rocky ground beneath it. Remove effects cast by the removed objects. Naturally reconstruct the hidden upper terrace as plausible paved garden ground, workshop footprint as terrace paving, greenhouse footprint as its terrace surface, monument footprint as continuous plaza paving, and lighthouse footprint as coherent coastal terrace/dock-adjacent ground. Continue existing local paths and planting conservatively, without inventing landmarks. Preserve retained lantern illumination. Do not include sky, ocean fill, broad water reflections, detached foreground sea rocks, or shoreline foam. Use genuine alpha around and through geometry, including gaps beneath docks and bridge. No background matte, checkerboard, text, characters, UI, or new buildings. Output one full-canvas RGBA PNG with clean edges and safe padding.
- **Acceptance criteria:** Coastline, paths, terraces and dock geometry match the master; all six interactive subjects and the designated tree are absent; hidden surfaces are coherent; rowboat remains; no ocean matte, cutout holes, or removed-object shadows remain.
- **Output filename:** `asset-01-clean-island-base.png`

## ASSET-02 — Creator's House / About

- **Ticket ID:** ASSET-02
- **Purpose:** Independently interactive About Me landmark.
- **Include:** Entire hilltop cream house, red/brown tiled gables, domed observatory tower, telescope, balcony/railings, doors, lit windows, attached vines and pergola, furnishings immediately belonging to that pergola, building-mounted lamps.
- **Exclude:** Terrain terrace, retaining walls, approach staircase, independent trees, ground lanterns, shared paths, neighboring landmarks, broad cast shadows and ground light pools.
- **Layer/transparency requirements:** Full-canvas RGBA PNG; original hilltop registration. Transparent architectural openings; keep attached foliage detail and complete roof/telescope silhouette.
- **Complete image-generation prompt:**

  > Use attached Island.png as the master reference and isolate only the exact hilltop Creator's House and Observatory into one 1536 × 1024 RGBA PNG. Keep every part at its original screen position and relative size. Preserve the exact master camera direction, elevation, perspective, apparent focal length, object orientation, sunset lighting direction, warm window light, cool shadows, soft global illumination, and polished stylized low-poly miniature-diorama rendering. Faithfully retain the cream multi-story house, original red/brown tiled gabled roofs, warm domed observatory tower, telescope pointing in its original direction, balcony and railings, doors, lit windows, attached climbing plants and pergola, pergola furnishings and building-mounted lamps. Preserve the reference proportions and visible architectural details without redesign. Complete only small obscured parts necessary for a continuous object silhouette in the same architecture. Exclude the stone hill terrace, retaining walls, approach stairs, shared paths, independent trees, ground lanterns, other buildings, sky, water, broad ground shadows, ground light pools, and exterior bloom halos. Retain local surface shading and illuminated window surfaces. Genuine transparent background and openings, clean antialiased edges, original full-canvas padding; no crops, rotation, labels, text, UI, characters, or unrelated props. Generate this landmark only.
- **Acceptance criteria:** Rooflines, tower, telescope orientation and footprint align; pergola remains attached; no terrace/scenery is baked in; no important geometry is cropped.
- **Output filename:** `asset-02-creators-house-about.png`

## ASSET-03 — Workshop / Projects

- **Ticket ID:** ASSET-03
- **Purpose:** Independently interactive Projects / Selected Work landmark.
- **Include:** Left-side timber workshop, dark blue-gray tiled roof, chimney, wood framing, cream infill, glowing windows/door, attached porch, workbench, tools, crates/barrels and small pots directly associated with the workshop.
- **Exclude:** Chimney smoke, island walls, shared paving, surrounding independent trees/flowers, ground lanterns, other landmarks, broad shadows and light pools.
- **Layer/transparency requirements:** Full-canvas RGBA PNG; smoke reserved for ASSET-09; clean gaps around porch and props.
- **Complete image-generation prompt:**

  > Use attached Island.png as the sole master reference. Generate only the left-side Wooden Workshop / Projects asset on the original 1536 × 1024 transparent canvas, exactly matching its reference position, size, orientation and footprint. Preserve the reference camera direction, elevation, perspective, apparent focal length, sunset light direction, warm highlights and amber windows, cool environmental shadows, soft global illumination, and polished stylized low-poly cozy 3D diorama style. Reproduce the original timber framing, cream wall infill, dark blue-gray tiled gabled roof, chimney, glowing door and windows, attached porch, workbench and tools, workshop-associated crates/barrels and small pots. Do not change the roof to red or redesign the building. Preserve visible details and conservatively complete only obscured geometry necessary for a continuous silhouette. Exclude chimney smoke, surrounding terrain, retaining walls, shared paths, independent vegetation and ground lanterns, neighboring landmarks, sky and ocean. Exclude broad cast shadows, ground light pools and exterior bloom while keeping body shading and lit surfaces. Use genuine alpha with clean antialiased edges and transparent gaps between props; retain safe full-canvas padding. No cropping, rotation, labels, text, UI, characters, or extra objects. Output one RGBA PNG of this workshop only.
- **Acceptance criteria:** Dark roof, timber structure, chimney and workbench match; no smoke or background fragments; props move with the building; footprint registers correctly.
- **Output filename:** `asset-03-workshop-projects.png`

## ASSET-04 — Greenhouse / Skills

- **Ticket ID:** ASSET-04
- **Purpose:** Independently interactive Skills / Tech Stack landmark.
- **Include:** Right-side glass greenhouse, dark frame and pitched roof, doors, warm interior lights, plants, planters and interior fixtures visible through the glass.
- **Exclude:** External terrace, stairs, retaining walls, surrounding trees/shrubs, ground lanterns, other buildings, background scenery embedded in glass, broad ground shadows/light pools.
- **Layer/transparency requirements:** Full-canvas RGBA PNG. Glass uses partial alpha where appropriate; frame, interior plants and fixtures retain their actual opacity. No solid blue/green scenery plate within panes.
- **Complete image-generation prompt:**

  > Use attached Island.png as the single master reference. Isolate only its right-side Glass Greenhouse / Skills on a 1536 × 1024 transparent canvas at the exact original screen position, size and orientation. Match the exact master camera direction, elevation, perspective, apparent focal length, scale relationship, sunset lighting direction, warm orange/yellow interior lighting, cool environmental shadows, soft global illumination, and polished stylized low-poly 3D miniature-diorama aesthetic. Preserve the original dark structural frame, pitched glass roof, pane divisions, arched door/window details, doors, contained plants and planters, and visible interior fixtures. Preserve translucent glass with subtle warm tint, highlights and reflections appropriate to the reference; do not make it opaque or bake the reference sky, trees, sea, or neighboring buildings into panes. Use partial alpha for glass where appropriate while keeping real interior plants and structural members opaque. Complete only small hidden structural portions needed for a coherent silhouette, without redesign. Exclude the outside terrace, stairs, retaining walls, external shrubs and trees, independent lanterns, all other landmarks, ground shadows, broad light pools and exterior bloom. Genuine transparency around and through the asset, clean antialiased edges, no matte or checkerboard. Keep full-canvas safe padding without cropping or rotation. No new objects, characters, labels, text or UI. Output one RGBA PNG only.
- **Acceptance criteria:** Frame and roof register; pane structure and plants match; glass composites over both light and dark surfaces without a background rectangle; transparency does not erase interior geometry.
- **Output filename:** `asset-04-greenhouse-skills.png`

## ASSET-05 — SR Monument / Home

- **Ticket ID:** ASSET-05
- **Purpose:** Home / Navigation Hub focal landmark.
- **Include:** Golden/cream sculptural letters S and R, their original arrangement and overlap, circular stone pedestal and directly attached decorative edging.
- **Exclude:** Shared plaza paving, surrounding flower/shrub ring, path lanterns, island terrain, neighboring landmarks, extra lettering, broad cast shadows and ground light pools.
- **Layer/transparency requirements:** Full-canvas RGBA PNG; preserve clear letter counters and silhouette. Surrounding garden ring stays on ASSET-01.
- **Complete image-generation prompt:**

  > Use attached Island.png as the sole master reference. Generate only its central SR Monument / Home asset, including its original circular stone pedestal and directly attached decorative edging, on the original 1536 × 1024 transparent canvas. Match the monument's exact screen position, size, footprint, orientation, camera direction, camera elevation, perspective, apparent focal length, sunset lighting direction, warm golden/cream material highlights, cool shadows, soft global illumination, and polished stylized low-poly 3D miniature-diorama rendering. Preserve the original sculptural letter shapes, proportions, arrangement and overlap. The monument must read exactly "SR": uppercase Latin S followed by uppercase Latin R. Never RS, never extra letters, never altered wording. Keep letter openings transparent where they reveal the scene. Exclude surrounding plaza paving, flower and shrub ring, ground lanterns, terrain, buildings, sky and water, broad cast shadows, ground light pools and exterior bloom. Preserve only the monument's own surface shading and material highlights. Do not redesign or rotate the sculpture. Genuine transparent background with clean antialiased edges and safe full-canvas padding; no cropped geometry, labels, UI, characters or unrelated objects. Output one RGBA PNG of the SR monument only.
- **Acceptance criteria:** Reads exactly **SR** at normal viewing size; shapes, overlap, pedestal and position match; no extra characters; openings and outer edges composite cleanly.
- **Output filename:** `asset-05-sr-monument-home.png`

## ASSET-06 — Lighthouse / Contact

- **Ticket ID:** ASSET-06
- **Purpose:** Independently interactive Contact landmark.
- **Include:** Front-right cream lighthouse, red/orange lantern roof and railings, glowing lantern chamber, windows/door, connected tiled-roof annex and entrance extensions, attached lifebuoy and building-owned small props.
- **Exclude:** Fixed dock/deck and support posts, independent harbor lanterns, shared coastal rocks/vegetation, sailboat, terrain, water/reflections, broad ground shadows and exterior halos.
- **Layer/transparency requirements:** Full-canvas RGBA PNG. Keep translucent lantern glazing where appropriate; docks remain ASSET-01 so the harbor stays fixed during hover.
- **Complete image-generation prompt:**

  > Use attached Island.png as the single source of truth. Generate only the front-right Lighthouse / Contact building complex on a 1536 × 1024 transparent canvas, retaining its exact original screen position, size, footprint and orientation. Match the master camera direction, elevation, perspective, apparent focal length, sunset lighting direction, warm cream walls, red/orange tiled roof materials, amber lantern chamber and window light, cool shadows, soft global illumination, and polished stylized low-poly 3D cozy diorama rendering. Faithfully reproduce the lighthouse tower, red lantern roof, lantern glazing and railings, doors/windows, connected red-tiled annex and entrance extensions, attached lifebuoy, and small props directly belonging to the buildings. Preserve visible details; conservatively complete only obscured parts necessary for a continuous building silhouette. Exclude the fixed wooden dock/deck and its supports, independent dock lanterns, coastal rocks, surrounding trees and plants, sailboat, all other landmarks, terrain, sky, ocean and water reflections. Keep body shading and illuminated surfaces but exclude broad terrain shadows, light pools and exterior halos. Genuine transparent background, partial alpha for appropriate glazing, clean antialiased edges and safe full-canvas padding. No cropping, rotation, redesign, text, labels, UI, characters or new props. Output one RGBA PNG of the lighthouse complex only.
- **Acceptance criteria:** Tower, lantern, annex and lifebuoy match; no dock or sailboat fragments; correct glazing and silhouette; original coastal registration retained.
- **Output filename:** `asset-06-lighthouse-contact.png`

## ASSET-07 — Sailboat / Experience

- **Ticket ID:** ASSET-07
- **Purpose:** Independently interactive Experience / Career Journey landmark; fixed harbor remains on the base.
- **Include:** Front-right moored sailboat hull, gunwales, mast, rigging, original pale triangular sails, and boat fittings.
- **Exclude:** Dock, lighthouse, water, wake/foam, reflections, broad shadows, beach rowboat, people, flags or added lettering.
- **Layer/transparency requirements:** Full-canvas RGBA PNG; transparent spaces between rigging and sails; preserve thin lines without dark fringe. Waterline effects belong to ASSET-09.
- **Complete image-generation prompt:**

  > Use attached Island.png as the sole master visual reference. Isolate only the small front-right harbor sailboat into one 1536 × 1024 RGBA PNG, at the original screen position and exact size and orientation. Match the master camera direction, elevation, perspective, apparent focal length, boat scale relative to the lighthouse and docks, sunset lighting direction, warm wooden hull highlights, cool shadows, soft global illumination, and polished stylized low-poly 3D miniature-diorama rendering. Preserve the original hull shape, dark exterior and warm wood trim/interior, mast, rigging, pale triangular sails, sail angles and boat fittings. Do not rotate, enlarge, redesign or add equipment. Complete only small concealed portions necessary for a continuous silhouette in the same design. Exclude dock, lighthouse, island, beach rowboat, sky, water, foam, wake, water reflections, broad shadows and exterior halos. Preserve the boat's local shading. Use genuine transparency around the hull and through gaps in rigging/sails, clean antialiased edges and enough full-canvas transparent padding to preserve every mast and rigging extremity. No background matte, checkerboard, characters, flags, text, labels, UI, or unrelated props. Generate the sailboat only.
- **Acceptance criteria:** Hull and sails register with master; rigging remains legible; no water rectangle or dock pixels; complete silhouette with transparent gaps.
- **Output filename:** `asset-07-sailboat-experience.png`

## ASSET-08 — Foreground Occlusion

- **Ticket ID:** ASSET-08
- **Purpose:** Restore foreground depth and hide rear-layer seams during modest scene motion.
- **Include:** Only the rounded tree centered approximately `(850, 720)` on the front-center rocky outcrop, including its trunk/canopy, and the detached near-camera sea rocks along the lower edge (approximately `(133, 890)`, `(235, 930)`, `(330, 980)`, `(565, 890)`, and `(1022, 874)`). Use the master to resolve exact shapes, boundaries and membership.
- **Exclude:** Continuous island rock mass beneath the tree, other island trees, docks, beach, water, foam/reflections, buildings, boats, sky, and unrelated distant/midground sea rocks.
- **Layer/transparency requirements:** One full-canvas RGBA PNG holding these disconnected pieces at their original coordinates. This is one grouped foreground layer; independently animating its pieces would require a later split.
- **Complete image-generation prompt:**

  > Use attached Island.png as the single master reference. Generate only a foreground occlusion layer on the original 1536 × 1024 transparent canvas. Include the rounded low-poly tree on the front-center rocky outcrop, centered approximately x=850, y=720, with its original faceted green canopy and visible trunk; and only the detached nearest-camera sea rocks along the lower image edge, approximately centered at (133,890), (235,930), (330,980), (565,890), and (1022,874). These positions are locating guides: follow the reference's exact silhouettes and boundaries. Preserve every included piece at its original position, scale and orientation. Match the exact camera direction, elevation, perspective, apparent focal length, sunset lighting direction, warm highlights, cool shadows, soft global illumination, and polished stylized low-poly miniature-diorama rendering. Preserve original tree and rock designs. Complete only obscured tree portions necessary for a continuous silhouette, without adding vegetation. Exclude the continuous island rocky outcrop under the tree, all other trees, beach, docks, buildings, boats, sky, water, foam and reflections, and distant or midground sea rocks. Keep local surface shading; exclude broad external shadows and halos. Genuine alpha between all disconnected pieces and around their clean antialiased edges, no matte or checkerboard. Retain the full canvas with safe padding, no crops or repositioning. No text, labels, UI, characters, new rocks or unrelated objects. Output one grouped RGBA PNG foreground layer only.
- **Acceptance criteria:** Only designated tree and detached rocks appear; original positions and occlusion relationships match; base has no duplicated tree; ocean plate has no duplicated foreground rocks; no water contamination.
- **Output filename:** `asset-08-foreground-occlusion.png`

## ASSET-09 — Lighting & Atmospheric FX

- **Ticket ID:** ASSET-09
- **Purpose:** Supplemental atmosphere and subtle grounding for the assembled resting scene; useful for gentle opacity animation.
- **Include:** Workshop chimney smoke; restrained halos near interactive landmark lights; subtle local light spill and grounding shadows removed from the base; island/harbor/boat-specific warm water reflections and shoreline foam absent from other plates; faint localized atmosphere where visibly justified by the master.
- **Exclude:** Opaque geometry, light-source bodies/windows already on their owning layers, sky/clouds, distant reflections already on ASSET-00, independent ground-lantern effects already on ASSET-01, blanket color grading, new light beams, heavy fog, flares or invented effects.
- **Layer/transparency requirements:** One full-canvas RGBA PNG with sparse partial-alpha effects and fully transparent unaffected regions. Author for normal source-over: colored halos/reflections and subtle translucent cool shadow patches, not a flattened black screen/additive plate. This combined FX layer supports the reference resting arrangement; it cannot track six independently moving landmarks by itself.
- **Complete image-generation prompt:**

  > Use attached Island.png as the sole master reference. Generate only a sparse Lighting & Atmospheric FX overlay on the original 1536 × 1024 genuinely transparent canvas. Preserve the exact camera framing, perspective, spatial registration, source positions, original sunset lighting direction and warm/cool color balance of the polished stylized low-poly 3D miniature diorama. Include the original soft pale smoke above the workshop chimney; restrained warm halos around illuminated house, workshop, greenhouse and lighthouse surfaces; subtle local warm light spill and cool grounding shadow patches corresponding to those landmarks and the SR pedestal; island/harbor/boat-specific warm water reflections and subtle shoreline foam needed to reconnect the clean plates. Keep every effect aligned to its original source and water/terrain surface in the reference, with the same soft global illumination and restrained bloom. Exclude all opaque buildings, monument, boats, rocks, vegetation, docks, terrain and light-source bodies. Exclude sky and clouds, distant ocean reflections already belonging to the environment, and independent ground-lantern lighting already retained on the base. No duplicate window geometry, blanket haze, overall color wash, new beams, lens flares, strong fog, extra light sources, characters, labels, text or UI. Render effects alone as colored, partially transparent pixels suitable for normal source-over compositing, with faint translucent cool shadow patches and smooth alpha falloff to complete transparency. No opaque black, white or blue background, no checkerboard, no screen-mode matte. Keep the full canvas, no reframing. Output one RGBA PNG supplemental FX overlay only; do not generate any other asset.
- **Acceptance criteria:** Smoke aligns with chimney; effects align with landmark sources and coast; unaffected pixels are transparent; no opaque scene silhouettes; normal compositing adds subtle atmosphere without double lighting or washing out the scene. Validate against the assembled assets; reject misplaced or excessive reflections/shadows. A combined overlay remains a resting-scene supplement, not an independent animation system.
- **Output filename:** `asset-09-lighting-atmospheric-fx.png`

---

## Ticket Execution Protocol

When the user requests a ticket ID, inspect the master again, apply Global Alignment Rules, and execute exactly that ticket with the master supplied as the image reference. Do not substitute previously generated assets as the sole visual authority. Check that output against the ticket acceptance criteria and report alignment or transparency limitations honestly. Additional variants, split effect layers, revisions, and other tickets require their own explicit request. No ticket is authorized for execution by the creation of this document.

## New ASSET-09 candidate — inactive

The user separately authorized replacement FX generation after Phase 1.
`public/assets/island/asset-09-lighting-atmospheric-fx-v2.png` now exists as a
1536 × 1024 transparent candidate. It is now mounted as ASSET-09 at z-index 90, identity registration, and opacity
zero, with static validation disabled. Nine sources are requested and decoded;
eight are visible. Generation still shows registration drift and broad glow, so
exact-fit acceptance has not passed. The original FX file is preserved and all
motion remains disabled. See [the generation and validation record](output/asset-09/README.md).
