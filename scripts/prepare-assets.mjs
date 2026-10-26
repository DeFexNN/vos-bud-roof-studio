import sharp from 'sharp';
import { mkdir, readdir, copyFile, writeFile, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const source = process.env.ROOF_PHOTOS || 'C:/Users/DeFexGG/vos_bud_dakhy_do_pislya';
const reference = process.env.REFERENCE_SITE || 'C:/lioha/showcase_builder_site';
await mkdir('public/images/projects', { recursive: true });
await mkdir('public/fonts', { recursive: true });
await mkdir('docs', { recursive: true });
const files = (await readdir(source)).filter(f => /\.jpg$/i.test(f)).sort();
const audit = [];
const metadata = {};
for (const file of files) {
  const buffer = await readFile(join(source, file));
  const m = await sharp(buffer).metadata();
  const number = Number(file.slice(0, 2));
  audit.push({ file, width: m.width, height: m.height, bytes: buffer.length, sha256: createHash('sha256').update(buffer).digest('hex'), used: number <= 10 });
  if (number > 10) continue;
  let phase = file.includes('_1_') ? 'before' : file.includes('_2_') ? 'after' : 'collage';
  if (number === 1 && phase !== 'collage') phase = phase === 'before' ? 'after' : 'before';
  const id = `${String(number).padStart(2, '0')}-${phase}`;
  metadata[id] = { width: m.width, height: m.height };
  for (const width of [480, 960, 1600]) {
    await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: width === 1600 ? 88 : 81, effort: 5 }).toFile(`public/images/projects/${id}-${width}.webp`);
  }
}
await writeFile('docs/photo-audit.json', JSON.stringify(audit, null, 2));
await mkdir('src/data', { recursive: true });
await writeFile('src/data/imageMetadata.json', JSON.stringify(metadata, null, 2));
for (const font of ['manrope.woff2', 'manrope-ext.woff2', 'editorial.woff2', 'editorial-ext.woff2', 'manrope-OFL.txt', 'dmserifdisplay-OFL.txt']) {
  await copyFile(join(reference, 'public/fonts', font), join('public/fonts', font));
}
for (const style of ['Regular', 'Bold']) {
  const response = await fetch(`https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-${style}.ttf`);
  if (!response.ok) throw new Error(`PDF font download failed: ${response.status}`);
  await writeFile(`public/fonts/NotoSans-${style}.ttf`, Buffer.from(await response.arrayBuffer()));
}
const license = await fetch('https://raw.githubusercontent.com/notofonts/noto-fonts/main/LICENSE');
if (!license.ok) throw new Error('Noto font license download failed');
await writeFile('public/fonts/noto-OFL.txt', await license.text());
const outputs = await readdir('public/images/projects');
await sharp('public/og-cover.svg').png().toFile('public/og-cover.png');
let bytes = 0;
for (const file of outputs) bytes += (await stat(join('public/images/projects', file))).size;
console.log(`Inspected ${audit.length} originals; prepared ${outputs.length} WebP variants (${(bytes / 1048576).toFixed(1)} MB). Project 01 mapping corrected.`);
