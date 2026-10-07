export const STAGE = { width: 1536, height: 1024 } as const;
/** Extra logical sky above the original stage keeps the raised house unclipped. */
export const SCENE_HEADROOM = 32;

export type AssetId = `ASSET-0${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9}`;
export type Destination =
  "home" | "about" | "projects" | "skills" | "experience" | "contact";
export interface Point {
  readonly x: number;
  readonly y: number;
}
export interface Registration {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}
export interface SceneAsset {
  readonly id: AssetId;
  readonly filename: string;
  readonly url: string;
  readonly zIndex: number;
  readonly registration: Registration;
  /** Original full-canvas coordinates, never registered stage coordinates. */
  readonly pivot: Point;
  readonly destination?: Destination;
  readonly opacity: number;
  readonly validation: {
    readonly staticComposition: "assessed-with-limitations" | "disabled";
    readonly parallax: false;
    readonly interaction: false;
    readonly ambient: false;
  };
}

function asset(
  id: AssetId,
  filename: string,
  zIndex: number,
  registration: Registration,
  pivot: Point,
  destination?: Destination,
): SceneAsset {
  return {
    id,
    filename,
    url: `/assets/island/${filename}`,
    zIndex,
    registration,
    pivot,
    ...(destination ? { destination } : {}),
    opacity: 1,
    validation: {
      staticComposition: "assessed-with-limitations",
      parallax: false,
      interaction: false,
      ambient: false,
    },
  };
}

/** Registration is a static measurement, not permission to enable motion. */
export const SCENE_ASSETS: readonly SceneAsset[] = [
  asset(
    "ASSET-00",
    "asset-00-environment-background.png",
    0,
    { x: -24, y: -SCENE_HEADROOM, scale: 1.03125 },
    { x: 768, y: 512 },
  ),
  asset(
    "ASSET-01",
    "asset-01-clean-island-base.png",
    10,
    { x: 0, y: 0, scale: 1 },
    { x: 768, y: 512 },
  ),
  asset(
    "ASSET-02",
    "asset-02-creators-house-about.png",
    20,
    { x: 552.96, y: -30.72, scale: 0.33 },
    { x: 795, y: 884 },
    "about",
  ),
  asset(
    "ASSET-03",
    "asset-03-workshop-projects.png",
    30,
    { x: 138.24, y: 163.84, scale: 0.5 },
    { x: 642, y: 662 },
    "projects",
  ),
  asset(
    "ASSET-04",
    "asset-04-greenhouse-skills.png",
    40,
    { x: 752.64, y: 148.48, scale: 0.42 },
    { x: 1135, y: 570 },
    "skills",
  ),
  asset(
    "ASSET-05",
    "asset-05-sr-monument-home.png",
    50,
    { x: 522.24, y: 296.96, scale: 0.34 },
    { x: 865, y: 722 },
    "home",
  ),
  asset(
    "ASSET-06",
    "asset-06-lighthouse-contact-v2.png",
    60,
    { x: 861.8, y: 410, scale: 0.36 },
    { x: 1120, y: 900 },
    "contact",
  ),
  asset(
    "ASSET-07",
    "asset-07-sailboat-experience.png",
    70,
    { x: 983.04, y: 645.12, scale: 0.28 },
    { x: 1120, y: 806 },
    "experience",
  ),
  {
    ...asset(
      "ASSET-09",
      "asset-09-lighting-atmospheric-fx-v2.png",
      90,
      { x: 0, y: 0, scale: 1 },
      { x: 768, y: 512 },
    ),
    // Await the replacement source, but keep unvalidated effects invisible.
    opacity: 0,
    validation: {
      staticComposition: "disabled",
      parallax: false,
      interaction: false,
      ambient: false,
    },
  },
];

export const SCENE_MOTION = { camera: false, fxBaseline: 0 } as const;
