import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { ISLAND_BASE_FALLBACK_URL } from '../src/components/island/scene-config.ts';

// Primary island canvases retain registration dimensions; smoke/cloud art is optimized.
const directory = new URL('../public/assets/island/', import.meta.url);
const filenames = [
  'asset-00-environment-background.webp',
  'asset-01-clean-island-base.webp',
  'asset-02-creators-house-about.webp',
  'asset-03-workshop-projects.webp',
  'asset-04-greenhouse-skills.webp',
  'asset-05-sr-monument-home.webp',
  'asset-06-lighthouse-contact-v2.webp',
  'asset-07-sailboat-experience.webp',
  'workshop-smoke-puff.webp',
];
const fallbackFilename = ISLAND_BASE_FALLBACK_URL.split('/').at(-1);
assert.deepEqual(
  (await readdir(directory)).filter((name) => !name.startsWith('.')).sort(),
  [...filenames, fallbackFilename].toSorted(),
  'Unexpected delivered island assets.',
);
function dimensions(buffer) {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const kind = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    assert.ok(data + size <= buffer.length, 'Truncated WebP chunk.');
    if (kind === 'VP8X')
      return [
        buffer.readUIntLE(data + 4, 3) + 1,
        buffer.readUIntLE(data + 7, 3) + 1,
      ];
    if (kind === 'VP8 ') {
      assert.deepEqual(
        [...buffer.subarray(data + 3, data + 6)],
        [0x9d, 0x01, 0x2a],
      );
      return [
        buffer.readUInt16LE(data + 6) & 0x3fff,
        buffer.readUInt16LE(data + 8) & 0x3fff,
      ];
    }
    if (kind === 'VP8L') {
      assert.equal(buffer[data], 0x2f);
      const bits = buffer.readUInt32LE(data + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    offset = data + size + (size % 2);
  }
  throw new Error('Missing WebP dimensions.');
}
let total = 0;
for (const filename of filenames) {
  const buffer = await readFile(new URL(filename, directory));
  const smokeCloud = filename === 'workshop-smoke-puff.webp';
  const expected = smokeCloud ? [512, 384] : [1536, 1024];
  assert.deepEqual(
    dimensions(buffer),
    expected,
    `${filename} has unexpected dimensions.`,
  );
  if (smokeCloud)
    assert.ok(
      buffer.length < 20_000,
      'Smoke/cloud delivery asset exceeds its 20 KB budget.',
    );
  total += buffer.length;
}
const fallback = await readFile(new URL(fallbackFilename, directory));
assert.deepEqual(
  dimensions(fallback),
  [768, 512],
  'Terrain backup must preserve the source canvas ratio.',
);
assert.ok(fallback.length < 80_000, 'Terrain backup exceeds its 80 KB budget.');
console.log(
  `Verified nine primary WebPs (${total.toLocaleString()} bytes) and the on-demand terrain backup (${fallback.length.toLocaleString()} bytes).`,
);
