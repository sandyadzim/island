import type { AssetId, Destination, Point } from './scene-config.ts';

export interface LandmarkGeometry {
  readonly assetId: AssetId;
  readonly destination: Destination;
  /** Measured in the untouched 1536 × 1024 source canvas. */
  readonly anchor: Point;
  readonly offset: Point;
  readonly labelSide: 'left' | 'right';
  readonly polygons: readonly (readonly Point[])[];
}
const polygon = (coordinates: readonly (readonly [number, number])[]): readonly Point[] => coordinates.map(([x, y]) => ({ x, y }));

/** Hit regions follow roofs/body silhouettes, excluding the broad painted glow. */
export const SCENE_LANDMARKS: readonly LandmarkGeometry[] = [
  {
    assetId: 'ASSET-05', destination: 'home', anchor: { x: 865, y: 540 }, offset: { x: 34, y: 0 }, labelSide: 'left',
    polygons: [polygon([[755,375],[820,330],[905,338],[979,450],[981,590],[1010,615],[1030,682],[985,720],[850,735],[710,708],[695,652],[730,607],[753,530]])],
  },
  {
    assetId: 'ASSET-02', destination: 'about', anchor: { x: 1200, y: 350 }, offset: { x: 20, y: -10 }, labelSide: 'right',
    polygons: [
      polygon([[384,497],[563,311],[769,301],[777,263],[829,257],[831,324],[924,502],[930,594],[947,598],[929,844],[797,898],[531,847],[272,816],[232,577]]),
      polygon([[827,216],[957,46],[1093,215],[1067,232],[1077,428],[1260,431],[1260,513],[1236,539],[1224,808],[1085,853],[923,824],[919,450],[841,451]]),
      polygon([[1078,373],[1234,298],[1250,339],[1172,386],[1192,437],[1116,440]]),
    ],
  },
  {
    assetId: 'ASSET-03', destination: 'projects', anchor: { x: 365, y: 340 }, offset: { x: -12, y: 0 }, labelSide: 'right',
    polygons: [polygon([[383,444],[492,345],[497,280],[560,280],[555,324],[690,292],[885,438],[871,542],[912,552],[917,615],[833,662],[634,675],[409,630],[382,604]])],
  },
  {
    assetId: 'ASSET-04', destination: 'skills', anchor: { x: 1270, y: 245 }, offset: { x: 18, y: -8 }, labelSide: 'left',
    polygons: [polygon([[815,291],[960,164],[1362,262],[1435,328],[1428,493],[1275,584],[813,454]])],
  },
  {
    assetId: 'ASSET-07', destination: 'experience', anchor: { x: 1330, y: 760 }, offset: { x: 12, y: -12 }, labelSide: 'left',
    polygons: [polygon([[944,598],[1088,342],[1089,313],[1114,315],[1120,388],[1282,728],[1313,787],[1318,815],[1258,900],[1192,905],[1002,839],[946,766],[923,663]])],
  },
  {
    assetId: 'ASSET-06', destination: 'contact', anchor: { x: 1250, y: 450 }, offset: { x: 18, y: -8 }, labelSide: 'left',
    polygons: [polygon([[768,679],[880,550],[1094,613],[1080,479],[1046,439],[1048,385],[1075,350],[1077,316],[1091,259],[1173,195],[1268,294],[1294,321],[1299,447],[1272,477],[1270,635],[1427,663],[1458,700],[1442,753],[1425,753],[1428,854],[1236,908],[1121,922],[970,914],[790,850]])],
  },
];
