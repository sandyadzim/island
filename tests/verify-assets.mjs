import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Delivery assets are the user's WebP conversions; originals are preserved in Git.
const directory = new URL('../public/assets/island/', import.meta.url);
const filenames = [
  'asset-00-environment-background.webp', 'asset-01-clean-island-base.webp',
  'asset-02-creators-house-about.webp', 'asset-03-workshop-projects.webp',
  'asset-04-greenhouse-skills.webp', 'asset-05-sr-monument-home.webp',
  'asset-06-lighthouse-contact-v2.webp', 'asset-07-sailboat-experience.webp',
  'workshop-smoke-puff.webp',
];
assert.deepEqual((await readdir(directory)).filter(name => !name.startsWith('.')).sort(), filenames.toSorted(), 'Unexpected delivered island assets.');
function dimensions(buffer) {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const kind = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    assert.ok(data + size <= buffer.length, 'Truncated WebP chunk.');
    if (kind === 'VP8X') return [buffer.readUIntLE(data + 4, 3) + 1, buffer.readUIntLE(data + 7, 3) + 1];
    if (kind === 'VP8 ') {
      assert.deepEqual([...buffer.subarray(data + 3, data + 6)], [0x9d, 0x01, 0x2a]);
      return [buffer.readUInt16LE(data + 6) & 0x3fff, buffer.readUInt16LE(data + 8) & 0x3fff];
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
  const expected = filename.startsWith('workshop') ? [1448, 1086] : [1536, 1024];
  assert.deepEqual(dimensions(buffer), expected, `${filename} changed source-canvas dimensions.`);
  total += buffer.length;
}
console.log(`Verified nine WebP delivery assets and their source dimensions (${total.toLocaleString()} bytes).`);
