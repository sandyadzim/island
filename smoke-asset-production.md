# Workshop smoke sprite

Generated with the built-in imagegen tool on 7 October 2026 after the user asked
for smoke matching the illustration style. The workshop image was the style
reference. The saved project asset is
`public/assets/island/workshop-smoke-puff.png` (1448 × 1086 RGBA with real alpha).
The workshop source is unchanged. The sprite is repeated in existing CSS puffs,
with subtle orientation variation; only puff transform and opacity animate.

## Final generation prompt

Use case: stylized-concept. Asset type: one transparent reusable smoke puff sprite for a small chimney in the reference low-poly island illustration. Input image 1 is STYLE REFERENCE ONLY: use its painterly low-poly 3D facets, warm dusk light and cooler blue shadow. Primary request: render ONE isolated rounded irregular smoke puff, a softly sculpted volume made of subtle polygonal facets, with 3-4 merging asymmetrical lobes. Warm light beige-gray on upper right faces, subdued lavender blue-gray shadow on lower left faces. Gentle tonal differences, low contrast, semi-translucent feathered edges, no outlines. Puffy wispy smoke, not rock or solid clay. Compact horizontal cluster, approximately 4:3 proportions; fill 80 percent of image width. Center the puff. No chimney, building, fire, spark, landscape, lettering or other objects. Actual transparent background; no painted checkerboard, no black backing, no glow halo. This is a single puff to be repeated via CSS, not a plume or multiple separate puffs. Match the reference illustration's handmade low-poly render aesthetic.

## Verification

Ego Lite desktop close-up and 390 × 844 mobile inspection confirmed the chimney
origin and faceted appearance. Pause and reduced motion were verified. Astro
check/build and all 11 existing tests pass. The eight core scene images retain
their readiness count; decorative sprite images do not enter that count.
