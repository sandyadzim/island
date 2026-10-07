import assert from 'node:assert/strict';
import { test } from 'node:test';
import { waitForImage } from '../src/utils/image-readiness.ts';

class TestImage extends EventTarget {
  complete = false;
  naturalWidth = 0;
  decodeCalls = 0;
  decodeResult = Promise.resolve();
  decode = () => { this.decodeCalls++; return this.decodeResult; };
  load() { this.complete = true; this.naturalWidth = 1536; this.dispatchEvent(new Event('load')); }
}

test('cached images still decode exactly once', async () => {
  const image = new TestImage();
  image.load();
  await waitForImage(image, new AbortController().signal);
  assert.equal(image.decodeCalls, 1);
});

test('readiness waits for both delayed load and decode', async () => {
  const image = new TestImage();
  let resolveDecode!: () => void;
  image.decodeResult = new Promise((resolve) => { resolveDecode = resolve; });
  let ready = false;
  const pending = waitForImage(image, new AbortController().signal).then(() => { ready = true; });
  await Promise.resolve();
  assert.equal(ready, false);
  assert.equal(image.decodeCalls, 0);
  image.load();
  await Promise.resolve();
  assert.equal(ready, false);
  resolveDecode();
  await pending;
  assert.equal(ready, true);
});

test('a cached failed image is rejected', async () => {
  const image = new TestImage();
  image.complete = true;
  await assert.rejects(waitForImage(image, new AbortController().signal), /no decoded pixels/);
  assert.equal(image.decodeCalls, 0);
});

test('a network failure is rejected', async () => {
  const image = new TestImage();
  const pending = waitForImage(image, new AbortController().signal);
  image.dispatchEvent(new Event('error'));
  await assert.rejects(pending, /could not be loaded/);
});

test('decode rejection is a failure even after a successful load', async () => {
  const image = new TestImage();
  image.load();
  image.decode = async () => { throw new Error('decode failed'); };
  await assert.rejects(waitForImage(image, new AbortController().signal), /decode failed/);
});

test('disposal cancels a pending image load', async () => {
  const image = new TestImage();
  const abort = new AbortController();
  const pending = waitForImage(image, abort.signal);
  abort.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  image.load();
  assert.equal(image.decodeCalls, 0);
});

test('disposal also cancels an unresolved decode', async () => {
  const image = new TestImage();
  image.load();
  image.decodeResult = new Promise(() => {});
  const abort = new AbortController();
  const pending = waitForImage(image, abort.signal);
  await Promise.resolve();
  abort.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('older browsers can use load completion when decode is unavailable', async () => {
  const image = new EventTarget() as EventTarget & { complete: boolean; naturalWidth: number };
  image.complete = true;
  image.naturalWidth = 1536;
  await waitForImage(image, new AbortController().signal);
});
