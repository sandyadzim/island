import assert from 'node:assert/strict';
import { test } from 'node:test';
import { destinationFromHash, navigationHash } from '../src/utils/portfolio-state.ts';

test('known direct links and encoded destinations restore their sections', () => {
  for (const destination of ['home', 'about', 'projects', 'skills', 'experience', 'contact']) {
    assert.equal(destinationFromHash(`#${destination}`), destination);
  }
  assert.equal(destinationFromHash('#%70rojects'), 'projects');
  assert.equal(destinationFromHash(''), 'home');
  assert.equal(destinationFromHash('#'), 'home');
});
test('unrelated and malformed fragments remain native browser navigation', () => {
  for (const hash of ['#island-guide', '#main', '#unknown', '#Projects', '#%E0%A4%A']) assert.equal(destinationFromHash(hash), null);
});
test('section changes push a fragment while repeat activation preserves history', () => {
  assert.equal(navigationHash('#about', 'projects'), '#projects');
  assert.equal(navigationHash('#projects', 'projects'), null);
  assert.equal(navigationHash('#%70rojects', 'projects'), null);
  assert.equal(navigationHash('', 'home'), null);
  assert.equal(navigationHash('#contact', 'home'), '#home');
});
