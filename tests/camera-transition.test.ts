import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cameraFromTransform,
  exploreCameraPose,
} from '../src/utils/camera-transition.ts';

test('camera starts at the previous proportional pose after centering layout changes', () => {
  const start = cameraFromTransform(
    { left: 500, top: 100, width: 900 },
    { left: 200, top: 50, width: 1000 },
    { x: -500, y: -350 },
  );
  assert.equal(start, 'matrix(0.9, 0, 0, 0.9, -200, -300)');
  // Untransformed final layout starts at (700,400); FLIP restores (500,100).
  assert.equal(700 - 200, 500);
  assert.equal(400 - 300, 100);
});
test('a mobile camera pan retains scale when the complete island already fits the width', () => {
  assert.equal(
    cameraFromTransform(
      { left: 0, top: 84, width: 390 },
      { left: 0, top: 276, width: 390 },
      { x: -195, y: -134 },
    ),
    'matrix(1, 0, 0, 1, -195, -326)',
  );
});
test('hidden or unmeasurable camera targets never divide by zero', () => {
  assert.equal(
    cameraFromTransform(
      { left: 0, top: 0, width: 320 },
      { left: 0, top: 0, width: 0 },
      { x: 0, y: 0 },
    ),
    'matrix(1, 0, 0, 1, 0, 0)',
  );
});

test('the camera clears actual enlarged navigation instead of a fixed bottom reservation', () => {
  for (const [width, header, dock] of [
    [1440, 64, 788],
    [320, 64, 348],
    [844, 64, 278],
    [320, 148, 347],
  ]) {
    const pose = exploreCameraPose(width, header, dock);
    const height = (pose.width * 1056) / 1536;
    assert.ok(pose.centerY - height / 2 >= header);
    assert.ok(pose.centerY + height / 2 <= dock);
    assert.ok(pose.width <= width);
  }
});
