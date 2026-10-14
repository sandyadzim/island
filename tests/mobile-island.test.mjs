import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import {
  mobileIslandFingerprint,
  mobileIslandInput,
  compositePath,
  manifestPath,
} from '../scripts/generate-mobile-island.mjs';
import { controlPoint } from '../src/utils/scene-geometry.ts';

test('composite cache changes for source pixels, registration, and draw order', () => {
  const metadata = {
    layers: [
      { id: 'base', x: 0 },
      { id: 'house', x: 552.96 },
    ],
  };
  const images = [Buffer.from('base pixels'), Buffer.from('house pixels')];
  const hash = mobileIslandFingerprint(metadata, images);
  assert.equal(hash, mobileIslandFingerprint(metadata, images));
  assert.notEqual(
    hash,
    mobileIslandFingerprint(metadata, [
      images[0],
      Buffer.from('new house pixels'),
    ]),
  );
  assert.notEqual(
    hash,
    mobileIslandFingerprint(
      {
        layers: [
          { id: 'base', x: 0 },
          { id: 'house', x: 553 },
        ],
      },
      images,
    ),
  );
  assert.notEqual(
    hash,
    mobileIslandFingerprint(
      { layers: metadata.layers.toReversed() },
      images.toReversed(),
    ),
  );
});

test('generated mobile artwork is current, visible, transparent, and aligned with hit regions', async () => {
  const input = await mobileIslandInput();
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const bytes = await readFile(compositePath);
  assert.equal(
    manifest.inputHash,
    input.inputHash,
    'Run npm run assets:mobile after source changes',
  );
  assert.equal(
    manifest.outputHash,
    createHash('sha256').update(bytes).digest('hex'),
  );
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.width, 1536);
  assert.equal(metadata.height, 1056);
  assert.equal(metadata.hasAlpha, true);
  const stats = await sharp(bytes).stats();
  const alpha = stats.channels[3];
  assert.equal(alpha.min, 0, 'Sky around the island must remain transparent');
  assert.equal(alpha.max, 255);
  assert.ok(
    alpha.mean > 30,
    'Embedded artwork must render, not produce an empty SVG',
  );
  assert.ok(stats.entropy > 1);
  assert.deepEqual(
    manifest.layers.map((asset) => asset.id),
    [
      'ASSET-01',
      'ASSET-02',
      'ASSET-03',
      'ASSET-04',
      'ASSET-05',
      'ASSET-06',
      'ASSET-07',
    ],
  );
  for (const asset of manifest.layers) {
    const hit = controlPoint(asset.pivot, asset.registration);
    assert.equal(
      hit.x,
      asset.registration.x + asset.pivot.x * asset.registration.scale,
    );
    assert.equal(
      hit.y,
      asset.registration.y + asset.pivot.y * asset.registration.scale + 32,
    );
  }
});
