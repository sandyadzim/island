import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  registerPoint,
  registrationStyle,
  sceneScale,
  controlPoint,
  controlPolygon,
} from '../src/utils/scene-geometry.ts';
import { SCENE_LANDMARKS } from '../src/components/island/scene-landmarks.ts';
import {
  SCENE_ASSETS,
  STAGE,
  SCENE_HEADROOM,
} from '../src/components/island/scene-config.ts';

test('a source-space pivot is registered before responsive scaling', () => {
  const point = registerPoint(
    { x: 795, y: 884 },
    { x: 587.65, y: 13.28, scale: 0.33 },
  );
  assert.equal(point.x, 850);
  assert.equal(point.y, 305);
  assert.equal(point.x * sceneScale(768), 425);
  assert.equal(point.y * sceneScale(768), 152.5);
});

test('controls include sky headroom without changing source registration', () => {
  assert.deepEqual(
    controlPoint({ x: 1200, y: 350 }, { x: 552.96, y: -30.72, scale: 0.33 }),
    { x: 948.96, y: 116.78 },
  );
  assert.equal(
    controlPolygon(
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
      { x: 10, y: -12, scale: 0.5 },
    ),
    '10,20 60,70',
  );
});

test('every destination has one calibrated landmark and bounded nondegenerate hit regions', () => {
  assert.equal(
    new Set(SCENE_LANDMARKS.map((landmark) => landmark.destination)).size,
    5,
  );
  for (const landmark of SCENE_LANDMARKS) {
    const asset = SCENE_ASSETS.find((asset) => asset.id === landmark.assetId)!;
    assert.equal(asset.destination, landmark.destination);
    for (const polygon of landmark.polygons) {
      assert.ok(polygon.length >= 3);
      const points = polygon.map((point) =>
        controlPoint(point, asset.registration),
      );
      points.forEach((point) => {
        assert.ok(point.x >= 0 && point.x <= STAGE.width);
        assert.ok(point.y >= 0 && point.y <= STAGE.height + SCENE_HEADROOM);
      });
      const area =
        points.reduce((sum, p, i) => {
          const next = points[(i + 1) % points.length];
          return sum + p.x * next.y - next.x * p.y;
        }, 0) / 2;
      assert.ok(
        Math.abs(area) > 100,
        'Hit regions must enclose an actual illustration.',
      );
    }
  }
});

test('the shared scale fits narrow widths and caps at reference size', () => {
  assert.equal(sceneScale(375), 375 / 1536);
  assert.equal(sceneScale(1536), 1);
  assert.equal(sceneScale(2000), 1);
  assert.equal(sceneScale(-1), 0);
});

test('user percentages preserve negative offsets and avoid floating-point CSS noise', () => {
  const style = registrationStyle(
    { x: 552.96, y: -30.72, scale: 0.33 },
    { x: 795, y: 884 },
  );
  assert.ok(style.includes('--registration-x:36%'));
  assert.ok(style.includes('--registration-y:-3%'));
  const workshop = registrationStyle(
    { x: 138.24, y: 163.84, scale: 0.5 },
    { x: 642, y: 662 },
  );
  assert.ok(workshop.includes('--registration-x:9%'));
});

// Asset filenames retain their original names; interaction semantics follow the current map.
test('exploration destinations match their illustrations and the sailboat stays ornamental', () => {
  const expected = [
    ['ASSET-05', 'about', 53, 38],
    ['ASSET-02', 'projects', 44, 9],
    ['ASSET-03', 'experience', 22, 32],
    ['ASSET-04', 'skills', 79, 22],
    ['ASSET-06', 'contact', 79, 50],
  ];
  assert.deepEqual(
    SCENE_LANDMARKS.map(({ assetId, destination, marker }) => [
      assetId,
      destination,
      marker.x,
      marker.y,
    ]),
    expected,
  );
  assert.equal(
    SCENE_ASSETS.find((asset) => asset.id === 'ASSET-07')?.destination,
    undefined,
  );
});
