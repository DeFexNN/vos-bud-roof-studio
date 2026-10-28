import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const files = [
  'README.md', 'CONTRIBUTING.md', 'SECURITY.md', '.github/pull_request_template.md',
  'docs/README.md', 'docs/CALCULATIONS.md', 'docs/PRICING.md', 'docs/DEPLOYMENT.md', 'docs/QA.md', 'docs/PHOTOGRAPHY.md', 'docs/REDESIGN.md',
];
const texts = new Map(), failures = [];
let checkedLinks = 0;
async function text(file) {
  if (!texts.has(file)) texts.set(file, await readFile(file, 'utf8'));
  return texts.get(file);
}
function anchors(markdown) {
  const content = markdown.replace(/```[\s\S]*?```/g, '');
  const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => match[1]);
  const result = new Set(), repeated = new Map();
  for (const heading of headings) {
    const base = heading.replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
    const count = repeated.get(base) || 0;
    repeated.set(base, count + 1); result.add(count ? `${base}-${count}` : base);
  }
  for (const match of content.matchAll(/(?:id|name)="([^"]+)"/g)) result.add(match[1]);
  return result;
}

for (const name of files) {
  const file = resolve(name), markdown = await text(file);
  if (/[A-Z]:[\\/](?:Users|lioha)[\\/]/i.test(markdown)) failures.push(`${name}: private machine path in public documentation`);
  const targets = [
    ...[...markdown.matchAll(/!?\[[^\]\n]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].map(match => match[1]),
    ...[...markdown.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1]),
  ];
  for (const target of targets) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target)) continue;
    const [path, hash] = target.split('#'), destination = path ? resolve(dirname(file), decodeURIComponent(path)) : file;
    try {
      await stat(destination); checkedLinks++;
      if (hash && ['.md', '.markdown'].includes(extname(destination).toLowerCase())) {
        if (!anchors(await text(destination)).has(decodeURIComponent(hash))) failures.push(`${name}: missing heading ${target}`);
      }
    } catch { failures.push(`${name}: missing local link or image ${target}`); }
  }
}

const browser = JSON.parse(await readFile('docs/verification/browser.json', 'utf8'));
const interactions = JSON.parse(await readFile('docs/verification/interactions.json', 'utf8'));
const accessibility = JSON.parse(await readFile('docs/verification/accessibility.json', 'utf8'));
const pdf = JSON.parse(await readFile('docs/verification/pdf.json', 'utf8'));
assert.ok(browser.results.every(result => result.passed), 'browser snapshot contains a failure');
assert.deepEqual(browser.errors, []); assert.deepEqual(browser.failedRequests, []);
assert.ok(interactions.results.every(result => result.passed), 'interaction snapshot contains a failure');
assert.ok(accessibility.reports.every(report => report.violations.length === 0), 'accessibility snapshot contains a violation');
assert.ok(pdf.results.every(result => result.passed), 'PDF snapshot contains a failure');

if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Documentation passed: ${files.length} guides, ${checkedLinks} local links/images, valid section anchors and four passing evidence snapshots.`);
