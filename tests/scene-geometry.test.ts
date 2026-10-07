import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerPoint, registrationStyle, sceneScale } from '../src/utils/scene-geometry.ts';

test('a source-space pivot is registered before responsive scaling', () => {
  const point = registerPoint({ x: 795, y: 884 }, { x: 587.65, y: 13.28, scale: 0.33 });
  assert.equal(point.x, 850);
  assert.equal(point.y, 305);
  assert.equal(point.x * sceneScale(768), 425);
  assert.equal(point.y * sceneScale(768), 152.5);
});

test('the shared scale fits narrow widths and caps at reference size', () => {
  assert.equal(sceneScale(375), 375 / 1536);
  assert.equal(sceneScale(1536), 1);
  assert.equal(sceneScale(2000), 1);
  assert.equal(sceneScale(-1), 0);
});

test('user percentages preserve negative offsets and avoid floating-point CSS noise', () => {
  const style = registrationStyle({ x: 552.96, y: -30.72, scale: 0.33 }, { x: 795, y: 884 });
  assert.ok(style.includes('--registration-x:36%'));
  assert.ok(style.includes('--registration-y:-3%'));
  const workshop = registrationStyle({ x: 138.24, y: 163.84, scale: 0.5 }, { x: 642, y: 662 });
  assert.ok(workshop.includes('--registration-x:9%'));
});
