import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  SCENE_ASSETS,
  STAGE,
  SCENE_HEADROOM,
} from '../src/components/island/scene-config.ts';

export const outputDirectory = new URL(
  '../src/generated/island/',
  import.meta.url,
);
export const compositePath = new URL('island-mobile.webp', outputDirectory);
export const manifestPath = new URL('manifest.json', outputDirectory);

export function mobileIslandFingerprint(metadata, images) {
  const hash = createHash('sha256').update(JSON.stringify(metadata));
  for (const bytes of images) hash.update(bytes);
  return hash.digest('hex');
}

/** SVG transforms retain fractional registration rather than rounding each layer. */
export async function mobileIslandInput() {
  const layers = await Promise.all(
    SCENE_ASSETS.filter((asset) => asset.id !== 'ASSET-00')
      .toSorted((a, b) => a.zIndex - b.zIndex)
      .map(async (asset) => ({
        asset,
        bytes: await readFile(
          new URL(`../public${asset.url}`, import.meta.url),
        ),
      })),
  );
  const metadata = {
    generator: 2,
    sharp: sharp.versions,
    width: STAGE.width,
    height: STAGE.height + SCENE_HEADROOM,
    layers: layers.map(({ asset }) => asset),
    webp: { quality: 90, alphaQuality: 100, effort: 6 },
  };
  return {
    metadata,
    inputHash: mobileIslandFingerprint(
      metadata,
      layers.map(({ bytes }) => bytes),
    ),
    layers,
  };
}

export async function renderMobileIsland(input) {
  const images = await Promise.all(
    input.layers.map(async ({ asset, bytes }) => {
      const { x, y, scale } = asset.registration;
      // librsvg's embedded-image support varies for WebP; PNG is lossless and portable.
      const png = await sharp(bytes).png().toBuffer();
      return `<image width="${STAGE.width}" height="${STAGE.height}" opacity="${asset.opacity}" transform="translate(${x} ${y + SCENE_HEADROOM}) scale(${scale})" xlink:href="data:image/png;base64,${png.toString('base64')}"/>`;
    }),
  );
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${input.metadata.width}" height="${input.metadata.height}" viewBox="0 0 ${input.metadata.width} ${input.metadata.height}">${images.join('')}</svg>`,
  );
}

export async function generateMobileIsland() {
  const input = await mobileIslandInput();
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const bytes = await readFile(compositePath);
    if (
      manifest.inputHash === input.inputHash &&
      manifest.outputHash === createHash('sha256').update(bytes).digest('hex')
    )
      return;
  } catch {
    // First run or an incomplete generated artifact: rebuild it from source.
  }
  const bytes = await sharp(await renderMobileIsland(input))
    .webp(input.metadata.webp)
    .toBuffer();
  const stats = await sharp(bytes).stats();
  if (
    stats.channels[3]?.max !== 255 ||
    stats.channels[3]?.min !== 0 ||
    stats.entropy === 0
  )
    throw new Error(
      'Mobile island must contain visible artwork and transparent sky.',
    );
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(compositePath, bytes);
  await writeFile(
    manifestPath,
    JSON.stringify(
      {
        ...input.metadata,
        inputHash: input.inputHash,
        outputHash: createHash('sha256').update(bytes).digest('hex'),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `Generated mobile island: ${input.metadata.width}×${input.metadata.height}, ${bytes.length.toLocaleString()} bytes.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  await generateMobileIsland();
