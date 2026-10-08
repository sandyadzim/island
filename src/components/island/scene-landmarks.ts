import type { AssetId, Destination, Point } from './scene-config.ts';

export interface LandmarkGeometry {
  readonly assetId: AssetId;
  readonly destination: Destination;
  /** Marker center as percentages of the complete scene, independent of asset registration. */
  readonly marker: Point;
  readonly labelSide: 'left' | 'right';
  readonly polygons: readonly (readonly Point[])[];
}
const polygon = (coordinates: readonly (readonly [number, number])[]): readonly Point[] => coordinates.map(([x, y]) => ({ x, y }));

/** Hit regions follow roofs/body silhouettes, excluding the broad painted glow. */
export const SCENE_LANDMARKS: readonly LandmarkGeometry[] = [
  {
    assetId: 'ASSET-05', destination: 'about', marker: { x: 53, y: 38 }, labelSide: 'left',
    polygons: [polygon([[755,375],[820,330],[905,338],[979,450],[981,590],[1010,615],[1030,682],[985,720],[850,735],[710,708],[695,652],[730,607],[753,530]])],
  },
  {
    assetId: 'ASSET-02', destination: 'projects', marker: { x: 44, y: 9 }, labelSide: 'right',
    polygons: [
      polygon([[384,497],[563,311],[769,301],[777,263],[829,257],[831,324],[924,502],[930,594],[947,598],[929,844],[797,898],[531,847],[272,816],[232,577]]),
      polygon([[827,216],[957,46],[1093,215],[1067,232],[1077,428],[1260,431],[1260,513],[1236,539],[1224,808],[1085,853],[923,824],[919,450],[841,451]]),
      polygon([[1078,373],[1234,298],[1250,339],[1172,386],[1192,437],[1116,440]]),
    ],
  },
  {
    assetId: 'ASSET-03', destination: 'experience', marker: { x: 22, y: 32 }, labelSide: 'right',
    polygons: [polygon([[383,444],[492,345],[497,280],[560,280],[555,324],[690,292],[885,438],[871,542],[912,552],[917,615],[833,662],[634,675],[409,630],[382,604]])],
  },
  {
    assetId: 'ASSET-04', destination: 'skills', marker: { x: 79, y: 22 }, labelSide: 'left',
    polygons: [polygon([[815,291],[960,164],[1362,262],[1435,328],[1428,493],[1275,584],[813,454]])],
  },
  {
    assetId: 'ASSET-06', destination: 'contact', marker: { x: 79, y: 50 }, labelSide: 'left',
    polygons: [polygon([[768,679],[880,550],[1094,613],[1080,479],[1046,439],[1048,385],[1075,350],[1077,316],[1091,259],[1173,195],[1268,294],[1294,321],[1299,447],[1272,477],[1270,635],[1427,663],[1458,700],[1442,753],[1425,753],[1428,854],[1236,908],[1121,922],[970,914],[790,850]])],
  },
];
