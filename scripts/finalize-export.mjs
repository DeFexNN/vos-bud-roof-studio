import { copyFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

// Next's Windows exporter can write segment-cache keys as nested directories,
// while the browser requests dot-separated keys. Supply portable static aliases;
// keep all original files and leave correctly exported Linux builds unchanged.
const root = resolve('out');
let aliases = 0;
async function visit(directory, segmentRoot = null, segments = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_next') continue;
      if (segmentRoot) await visit(file, segmentRoot, [...segments, entry.name]);
      else if (entry.name.startsWith('__next.')) await visit(file, file);
      else await visit(file);
    } else if (segmentRoot && entry.name.endsWith('.txt')) {
      const key = [segmentRoot.slice(dirname(segmentRoot).length + 1), ...segments, entry.name].join('.');
      await copyFile(file, join(dirname(segmentRoot), key));
      aliases++;
    }
  }
}
await visit(root);
console.log(`Static export ready (${aliases} portable navigation aliases).`);
