import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  resolveExperienceProfile,
  uiMotionOff,
} from '../src/utils/experience-profile.ts';

test('touch, no-hover, and unavailable device detection select the safe scene', () => {
  const match = (coarse: boolean, noHover: boolean) => (query: string) => ({
    matches: query === '(pointer: coarse)' ? coarse : noHover,
  });
  assert.equal(resolveExperienceProfile(match(true, false)), 'lite');
  assert.equal(resolveExperienceProfile(match(false, true)), 'lite');
  assert.equal(resolveExperienceProfile(match(true, true)), 'lite');
  assert.equal(resolveExperienceProfile(match(false, false)), 'full');
  assert.equal(resolveExperienceProfile(), 'lite');
  assert.equal(
    resolveExperienceProfile(() => {
      throw new Error('Unavailable');
    }),
    'lite',
  );
});

test('mobile camera and sheets ignore old desktop Pause but respect reduced motion', () => {
  assert.equal(uiMotionOff('lite', false, true), false);
  assert.equal(uiMotionOff('lite', true, false), true);
  assert.equal(uiMotionOff('lite', true, true), true);
  assert.equal(uiMotionOff('full', false, true), true);
  assert.equal(uiMotionOff('full', true, false), true);
  assert.equal(uiMotionOff('full', false, false), false);
});
