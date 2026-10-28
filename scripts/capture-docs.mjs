import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const base = (process.env.DOCS_URL || 'https://defexnn.github.io/vos-bud-roof-studio').replace(/\/$/, '');
const destination = 'docs/assets';
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
const page = await context.newPage();
const frames = p => p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function visit(p, route) {
  await p.goto(base + route, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await frames(p);
}
async function scene(p, selector = 'canvas[data-area]') {
  await p.locator(selector).first().waitFor({ state: 'visible', timeout: 30000 });
  await p.waitForFunction(selector => Number(document.querySelector(selector)?.dataset.drawCalls) > 0, selector);
  await frames(p);
}
async function save(name, buffer) {
  const image = await sharp(buffer).webp({ quality: 84, effort: 6 }).toBuffer();
  await writeFile(`${destination}/${name}.webp`, image);
  console.log(`${name}.webp · ${(image.length / 1024).toFixed(0)} KB`);
}

try {
  await visit(page, '/en/'); await scene(page, '.roof-hero canvas[data-area]');
  await save('cover', await page.screenshot());

  await page.locator('.anatomy-model').scrollIntoViewIfNeeded();
  await scene(page, '.anatomy-model canvas[data-area]');
  await page.locator('.anatomy-feature').evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 86));
  await frames(page);
  await save('layers', await page.screenshot());

  await visit(page, '/en/studio/'); await scene(page);
  await save('studio', await page.screenshot());

  await visit(page, '/en/projects/');
  await page.locator('.portfolio-grid article').nth(1).locator('.project-preview img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await page.evaluate(() => window.scrollTo(0, 0)); await frames(page);
  await save('projects', await page.screenshot());

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const phone = await mobile.newPage();
  await visit(phone, '/en/'); await scene(phone);
  const home = await phone.screenshot();
  await visit(phone, '/en/studio/'); await scene(phone);
  await phone.getByTestId('configure-jump').click(); await frames(phone);
  const studio = await phone.screenshot();
  const mask = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844"><rect width="390" height="844" rx="10" fill="white"/></svg>');
  const rounded = async buffer => sharp(buffer).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const labels = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="864" height="944"><g fill="#c3ccb6" font-family="Arial,sans-serif" font-size="12" letter-spacing="2"><text x="28" y="37">01 / THE FIRST IMPRESSION</text><text x="446" y="37">02 / YOUR ROOF, IN YOUR HANDS</text><text x="28" y="930">V.O.S_BUD — RESPONSIVE BY DESIGN</text></g></svg>');
  const spread = await sharp({ create: { width: 864, height: 944, channels: 4, background: '#26221f' } }).composite([
    { input: labels }, { input: await rounded(home), left: 28, top: 64 }, { input: await rounded(studio), left: 446, top: 64 },
  ]).png().toBuffer();
  await save('mobile', spread);
  await mobile.close();
} finally { await browser.close(); }
