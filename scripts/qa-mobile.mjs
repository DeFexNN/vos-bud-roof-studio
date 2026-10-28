import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = (process.env.QA_URL || 'http://localhost:3000').replace(/\/$/, '');
await mkdir('qa/mobile', { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] }), results = [];
let activePage;
const record = name => { results.push({ name, passed: true }); console.log(`PASS ${name}`); };
const frame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const image = canvas => canvas.evaluate(element => element.toDataURL());
async function touchDrag(page, client, canvas, horizontal) {
  const box = await canvas.boundingBox(); assert.ok(box);
  const x = box.x + box.width * .35, y = box.y + box.height * .65;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 8; step++) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (horizontal ? step * 12 : 0), y: y - (horizontal ? 0 : step * 19) }] });
    await frame(page);
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function clearOfBar(page, locator) {
  await expect.poll(() => locator.evaluate(element => {
    const box = element.getBoundingClientRect(), bar = document.querySelector('.mobile-estimate-bar');
    const limit = bar && getComputedStyle(bar).visibility !== 'hidden' ? bar.getBoundingClientRect().top : innerHeight;
    const top = element.closest('.scene-fullscreen') ? 0 : document.querySelector('.site-header').getBoundingClientRect().bottom;
    return box.top >= top && box.bottom <= limit - 8;
  })).toBe(true);
}
try {
  for (const width of [320, 390]) for (const motion of ['reduce', 'no-preference']) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: motion, deviceScaleFactor: 1 });
    const page = await context.newPage(), client = await context.newCDPSession(page), errors = [];
    activePage = page;
    page.on('pageerror', error => errors.push(String(error)));
    for (const locale of ['pl', 'en']) {
      const label = `${locale} ${width}px ${motion}`;
      await page.goto(`${base}/${locale}/studio/`, { waitUntil: 'networkidle' });
      const canvas = page.locator('canvas[data-scene="studio"]'), bar = page.locator('.mobile-estimate-bar');
      await expect(canvas).toHaveAttribute('data-draw-calls', /[1-9]/);
      await page.evaluate(() => document.fonts.ready);
      const jump = page.getByTestId('configure-jump');
      await expect(jump).toBeInViewport();
      await jump.click();
      await expect(page.locator('#studio-tab-geometry')).toBeFocused();
      await expect.poll(() => page.locator('#studio-settings').evaluate(element => Math.abs(element.getBoundingClientRect().top - 90) < 3)).toBe(true);
      await clearOfBar(page, page.locator('#studio-tab-geometry'));
      await expect(bar).toBeVisible();
      assert.equal(await page.locator('.shape-selector').evaluate(element => element.scrollWidth <= element.clientWidth), true);
      assert.ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= width + 1);
      await page.screenshot({ path: `qa/mobile/${locale}-${width}-${motion}-settings.png` });
      record(`${label}: visible Configure roof, real settings focus, two-column shapes and no overflow`);

      await page.getByTestId('return-model').click();
      await expect(page.locator('#studio-model')).toBeFocused();
      await expect.poll(() => page.locator('#studio-model').evaluate(element => Math.abs(element.getBoundingClientRect().top - 90) < 3)).toBe(true);
      await expect(bar).toBeHidden();
      for (const button of await page.locator('.studio-viewer .scene-toolbar button').all()) {
        await expect(button).toBeInViewport();
        assert.equal(await button.evaluate(element => { const r = element.getBoundingClientRect(); return element.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }), true);
      }
      const original = await image(canvas), y = await page.evaluate(() => scrollY);
      assert.equal(await canvas.evaluate(element => getComputedStyle(element).touchAction), 'pan-y pinch-zoom');
      await touchDrag(page, client, canvas, true);
      await expect.poll(async () => (await image(canvas)) !== original).toBe(true);
      assert.ok(Math.abs((await page.evaluate(() => scrollY)) - y) < 5);
      const rotated = await image(canvas);
      await page.locator('.studio-viewer .scene-toolbar button').nth(6).click();
      await expect.poll(async () => (await image(canvas)) !== rotated).toBe(true);
      await page.locator('.studio-viewer .scene-toolbar button').last().click();
      await expect(page.locator('.scene-fullscreen')).toHaveAttribute('aria-modal', 'true');
      await clearOfBar(page, page.locator('.fullscreen-close'));
      for (const button of await page.locator('.scene-fullscreen .scene-toolbar button').all()) await expect(button).toBeInViewport();
      await page.keyboard.press('Escape');
      await expect(page.locator('.scene-fullscreen')).toHaveCount(0);
      await page.screenshot({ path: `qa/mobile/${locale}-${width}-${motion}-model.png` });
      await touchDrag(page, client, canvas, false);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y + 60);
      record(`${label}: return focus, unobscured toolbar, horizontal touch rotation, reset, fullscreen and native vertical touch scroll`);

      await page.locator('#studio-model .studio-mobile-navigation button').click();
      const input = page.locator('#roof-length');
      await input.evaluate(element => { const rect = element.getBoundingClientRect(); window.scrollBy({ top: rect.bottom - innerHeight + 20, behavior: 'instant' }); element.focus({ preventScroll: true }); });
      await expect(bar).toBeHidden();
      await clearOfBar(page, input);
      await input.fill('13');
      await page.setViewportSize({ width, height: 560 });
      await clearOfBar(page, input); await expect(bar).toBeHidden();
      await page.setViewportSize({ width, height: 844 });
      await page.keyboard.press('Tab');
      await page.locator('#studio-tab-appearance').click();
      await expect(page.locator('#roof-product')).toBeVisible();
      record(`${label}: focused input stays visible, keyboard does not compete with estimate bar, material step works`);

      const padding = await page.addStyleTag({ content: '.mobile-estimate-bar { padding-bottom: 48px !important; }' });
      await expect.poll(() => bar.evaluate(element => Math.abs(element.getBoundingClientRect().height - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--estimate-bar'))) < 1)).toBe(true);
      assert.ok(await bar.evaluate(element => element.getBoundingClientRect().height > 105));
      await page.locator('.footer-bottom > a').evaluate(element => { element.scrollIntoView({ block: 'end', behavior: 'instant' }); element.focus({ preventScroll: true }); });
      await expect(bar).toBeVisible();
      await clearOfBar(page, page.locator('.footer-bottom > a'));
      await page.screenshot({ path: `qa/mobile/${locale}-${width}-${motion}-footer.png` });
      const link = bar.locator('a');
      await expect(link).toHaveText(locale === 'pl' ? 'Zobacz kosztorys' : 'View estimate');
      await link.click(); await expect(page.locator('#bill')).toBeFocused();
      await expect.poll(() => page.locator('#bill').evaluate(element => Math.abs(element.getBoundingClientRect().top - 90) < 3)).toBe(true);
      await padding.evaluate(element => element.remove());
      record(`${label}: measured safe-area height, final footer clearance and destination-labelled estimate link with focus`);

      await page.goto(`${base}/${locale}/${locale === 'pl' ? 'kosztorys' : 'estimate'}/`, { waitUntil: 'networkidle' });
      await page.getByTestId('configure-jump').click();
      await expect(page.locator('#studio-tab-geometry')).toBeFocused();
      await clearOfBar(page, page.locator('#studio-tab-geometry'));
      await page.locator('.site-header .brand').click();
      await expect(page.locator('html')).not.toHaveAttribute('data-estimate-bar');
      assert.equal(await page.locator('body').evaluate(element => getComputedStyle(element).paddingBottom), '0px');
      record(`${label}: calculator journey works; SPA navigation removes studio-only bottom space`);

      const hero = page.locator('.roof-hero canvas');
      await expect(hero).toHaveAttribute('data-draw-calls', /[1-9]/);
      await hero.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
      const heroScroll = await page.evaluate(() => scrollY);
      await touchDrag(page, client, hero, false);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(heroScroll + 60);
      record(`${label}: homepage model also allows native vertical touch scrolling`);
    }
    assert.deepEqual(errors, []); await context.close();
  }
} catch (error) {
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({ path: 'qa/mobile/failure.png' });
    console.log(await activePage.evaluate(() => ({ url: location.href, scrollY, focused: document.activeElement?.outerHTML, settings: document.getElementById('studio-settings')?.getBoundingClientRect().toJSON(), bar: document.querySelector('.mobile-estimate-bar')?.getBoundingClientRect().toJSON(), root: document.documentElement.getAttribute('style') })));
  }
  throw error;
} finally {
  await writeFile('qa/mobile/results.json', JSON.stringify({ date: new Date().toISOString(), results }, null, 2));
  await browser.close();
}
console.log(`\n${results.length} focused mobile checks passed.`);
