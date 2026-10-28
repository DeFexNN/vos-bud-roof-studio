import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const base = (process.env.QA_URL || 'http://localhost:3000').replace(/\/$/, '');
await mkdir('qa/presentation', { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const results = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: { width: mobile ? 390 : 1440, height: mobile ? 844 : 1000 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const locale of ['pl', 'en']) {
      for (const route of ['home', 'projects', 'studio']) {
        const slug = route === 'home' ? '' : route === 'projects' && locale === 'pl' ? 'realizacje/' : `${route}/`;
        await page.goto(`${base}/${locale}/${slug}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        if (route !== 'projects') await page.waitForFunction(() => Number(document.querySelector('canvas[data-area]')?.dataset.drawCalls) > 0);
        else await page.locator('.project-preview img').first().evaluate(image => image.decode());
        const dimensions = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
        assert.ok(dimensions.width <= dimensions.viewport + 1, JSON.stringify(dimensions));
        const titleStyle = await page.locator('h1').evaluate(element => ({ style: getComputedStyle(element).fontStyle, family: getComputedStyle(element).fontFamily }));
        assert.equal(titleStyle.style, 'normal'); assert.match(titleStyle.family, /manrope/i);
        const target = `qa/presentation/${locale}-${route}-${mobile ? 'mobile' : 'desktop'}.png`;
        await page.screenshot({ path: target });
        if (route === 'home') {
          assert.equal(await page.locator('.roof-hero img').count(), 0, 'Hero uses the real configurable model, not a work photograph');
          assert.ok(await page.locator('.roof-hero a[href$="/studio/"]').isVisible());
          assert.ok(await page.locator(`.roof-hero a[href$="/${locale === 'pl' ? 'realizacje' : 'projects'}/"]`).isVisible());
          const photos = await page.locator('#main img').evaluateAll(images => images.map(image => image.getAttribute('src')));
          assert.equal(new Set(photos).size, photos.length, 'No repeated homepage photograph');
          const canvas = page.locator('.roof-hero canvas');
          const before = createHash('sha256').update(await canvas.screenshot()).digest('hex');
          await page.locator('.roof-hero .hero-scene-tools button').first().click();
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          assert.notEqual(createHash('sha256').update(await canvas.screenshot()).digest('hex'), before, 'Hero keyboard-accessible rotation changes actual pixels');
          await page.locator('.roof-hero .hero-scene-tools button').last().click();
          await page.locator('.selected-projects').scrollIntoViewIfNeeded();
          await page.locator('.selected-project-photo img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
          await page.locator('.selected-projects').screenshot({ path: target.replace('.png', '-photography.png') });
        }
        if (route === 'studio' && mobile) {
          await page.getByTestId('configure-jump').click();
          assert.equal(await page.locator('#studio-tab-geometry').evaluate(element => element === document.activeElement), true);
          await page.waitForFunction(() => document.querySelector('.mobile-estimate-bar')?.getAttribute('data-suspended') === 'false');
          await page.screenshot({ path: target.replace('.png', '-controls.png') });
        }
        if (route === 'projects' && locale === 'en') {
          for (const card of await page.locator('[data-project-card]').all()) {
            const number = await card.getAttribute('data-project-card'), preview = card.locator('.project-preview');
            await preview.scrollIntoViewIfNeeded(); await preview.locator('img').evaluate(image => image.decode());
            await preview.screenshot({ path: `qa/presentation/photo-${number}-${mobile ? 'mobile' : 'desktop'}.png` });
          }
        }
        results.push({ locale, route, mobile, target, passed: true });
        console.log(`PASS presentation ${locale} ${route} ${mobile ? '390px' : '1440px'}`);
      }
    }
    await context.close();
  }
} finally {
  await writeFile('qa/presentation/results.json', JSON.stringify({ date: new Date().toISOString(), results }, null, 2));
  await browser.close();
}
