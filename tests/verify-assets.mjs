import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const originals = (await readdir(new URL('../', import.meta.url))).filter((name) => /^asset-\d\d-.*\.png$/.test(name)).sort();
assert.equal(originals.length, 10, 'Expected the ten original scene assets.');
const copies = (await readdir(new URL('../public/assets/island/', import.meta.url))).sort();
const replacement = 'asset-09-lighting-atmospheric-fx-v2.png';
assert.deepEqual(copies, [...originals, replacement].sort(), 'Public assets must include the originals and authorized FX replacement.');
for (const name of originals) {
  const [original, copy] = await Promise.all([
    readFile(new URL(`../${name}`, import.meta.url)),
    readFile(new URL(`../public/assets/island/${name}`, import.meta.url)),
  ]);
  const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
  assert.equal(hash(copy), hash(original), `${name} differs from the original.`);
}
console.log('All ten public PNG copies match their originals (SHA-256).');
const [candidate, deployed] = await Promise.all([
  readFile(new URL(`../output/asset-09/${replacement}`, import.meta.url)),
  readFile(new URL(`../public/assets/island/${replacement}`, import.meta.url)),
]);
assert.equal(createHash('sha256').update(candidate).digest('hex'), createHash('sha256').update(deployed).digest('hex'), 'FX replacement differs from the saved candidate.');
console.log('FX v2 deployment copy matches the saved candidate (SHA-256).');
