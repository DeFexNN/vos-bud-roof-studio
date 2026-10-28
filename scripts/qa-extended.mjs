import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.QA_URL || 'http://localhost:3000';
await mkdir('qa', { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage(), results = [];
const record = name => { results.push({ name, passed: true }); console.log(`PASS ${name}`); };
const goto = path => page.goto(base + path, { waitUntil: 'networkidle' });
let performanceSample;
try {
  await goto('/en/studio/');
  await page.locator('canvas[data-area]').waitFor();
  await page.locator('#roof-length').fill('0');
  await expect(page.locator('.empty-estimate')).toBeVisible();
  for (const button of await page.locator('[data-testid=export-pdf]').all()) await expect(button).toBeDisabled();
  await page.locator('#roof-length').fill('12');
  await expect(page.locator('.empty-estimate')).toHaveCount(0);
  record('Invalid geometry withholds totals and exports; correction recovers');

  await page.locator('#studio-tab-geometry').focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#studio-tab-appearance')).toBeFocused();
  await expect(page.locator('#studio-tab-appearance')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End'); await expect(page.locator('#studio-tab-layers')).toBeFocused();
  await page.keyboard.press('Home'); await expect(page.locator('#studio-tab-geometry')).toBeFocused();
  record('Studio tabs support arrows, Home and End with roving focus');

  await page.locator('.control-panel summary').filter({ hasText: 'Include installation / VAT' }).click();
  await page.locator('#roof-laborScope').selectOption('bundled');
  await page.locator('#roof-bundledLaborNet').fill('170');
  await expect(page.locator('.bill-table tbody th small').filter({ hasText: /^Installation$/ })).toHaveCount(1);
  await expect(page.locator('.bill-table')).toContainText('Complete installation');
  await expect(page.locator('.bill-table')).not.toContainText('Batten installation');
  record('Browser bundle mode replaces all task installation lines');

  await page.locator('#roof-vatMode').selectOption('residential');
  await expect(page.locator('.empty-estimate')).toBeVisible();
  await page.getByRole('checkbox', { name: 'I confirm eligibility of the comprehensive service for residential VAT.', exact: true }).check();
  await page.getByLabel('Usable building floor area', { exact: true }).fill('400');
  await expect(page.locator('.cost-summary-lines').getByText('VAT 11.75%', { exact: true })).toBeVisible();
  record('Residential VAT blocks unconfirmed eligibility, then applies 300/400 proportion');
  await page.locator('#roof-vatMode').selectOption('standard');
  await page.getByRole('checkbox', { name: 'Include installation', exact: true }).uncheck();
  await expect(page.locator('.bill-table tbody th small').filter({ hasText: /^Installation$/ })).toHaveCount(0);
  record('Supply-only mode removes installation costs in the public bill');

  await page.locator('.estimate-sidebar').getByRole('button', { name: 'Restore defaults', exact: true }).click();
  await page.locator('#roof-length').fill('14.6');
  await page.locator('#studio-tab-appearance').click();
  await page.locator('#roof-product').selectOption('titania');
  await page.getByRole('button', { name: 'Tile red RAL 8004', exact: true }).click();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#roof-length')).toHaveValue('14.6');
  await page.locator('#studio-tab-appearance').click();
  await expect(page.locator('#roof-product')).toHaveValue('titania');
  record('Full page reload restores product, dimensions and roof configuration');
  await page.locator('.estimate-sidebar').getByRole('button', { name: 'Share your design', exact: true }).click();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(new URL(shared).searchParams.get('roof'));
  const clean = await browser.newContext({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' });
  const other = await clean.newPage();
  await other.goto(shared, { waitUntil: 'networkidle' });
  await expect(other.locator('#roof-length')).toHaveValue('14.6');
  await other.locator('#studio-tab-appearance').click();
  await expect(other.locator('#roof-product')).toHaveValue('titania');
  await expect(other.getByRole('button', { name: 'Tile red RAL 8004', exact: true })).toHaveAttribute('aria-pressed', 'true');
  record('Copied share link recreates the actual roof in a clean browser context');
  await other.goto(base + '/', { waitUntil: 'networkidle' }); await other.waitForURL('**/en/');
  record('Entry route remembers a deliberate English language preference');
  await clean.close();

  await goto('/en/materials/#venecja');
  await expect(page.locator('.material-selector button.active')).toContainText('Metal roof tiles');
  await page.locator('.material-selector button').filter({ hasText: 'Concrete roof tiles' }).click();
  await expect(page.locator('.material-selector button.active')).toContainText('Concrete roof tiles');
  assert.ok(page.url().endsWith('#celtycka'));
  record('Material teaser deep links and subsequent selections stay synchronized');

  await goto('/en/estimate/');
  const scenarioTotals = [];
  for (let i = 0; i < 3; i++) {
    await page.locator('.scenario-grid article').nth(i).getByRole('button').click();
    await expect(page.locator('.scenario-grid article').nth(i)).toHaveClass('active');
    scenarioTotals.push(await page.locator('[data-testid=estimate-total]').last().getAttribute('data-value'));
  }
  assert.equal(new Set(scenarioTotals).size, 3); record('Three scenarios apply different real assemblies and totals');

  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const mobile = await touch.newPage();
  await mobile.goto(base + '/pl/realizacje/', { waitUntil: 'networkidle' });
  await mobile.locator('.project-evidence > summary').first().tap();
  const sequence = mobile.locator('.photo-sequence').first(); await sequence.scrollIntoViewIfNeeded();
  await expect(sequence.locator('figure')).toHaveCount(2);
  await expect(sequence.locator('figure').first()).toContainText('Przed');
  await expect(sequence.locator('figure').last()).toContainText('Po');
  await expect(mobile.locator('.comparison-input')).toHaveCount(0);
  record('Mobile mismatched photographs are separately labelled, not overlaid');
  await mobile.locator('.comparison-expand').first().tap();
  await expect(mobile.locator('dialog.project-lightbox')).toBeVisible();
  await mobile.screenshot({ path: 'qa/lightbox-mobile.png' });
  await mobile.keyboard.press('Escape');
  await mobile.getByRole('button', { name: 'Otwórz menu' }).tap();
  await expect(mobile.locator('dialog.mobile-menu')).toBeVisible();
  await mobile.locator('dialog.mobile-menu a[href$="/pl/studio/"]').tap();
  await mobile.waitForURL('**/pl/studio/');
  await expect(mobile.locator('dialog.mobile-menu')).toHaveCount(0);
  record('Touch fullscreen and mobile navigation open, navigate and close');
  await mobile.getByTestId('configure-jump').tap();
  await expect(mobile.locator('#studio-tab-geometry')).toBeFocused();
  await expect(mobile.locator('#roof-height')).not.toBeVisible();
  await mobile.locator('#roof-length').fill('13');
  await mobile.getByRole('button', { name: 'Dalej: wybierz pokrycie', exact: true }).tap();
  await expect(mobile.locator('#studio-tab-appearance')).toBeFocused();
  await mobile.locator('#roof-product').focus();
  await mobile.locator('#roof-product').selectOption('venecja');
  await expect(mobile.locator('.mobile-estimate-bar')).toBeHidden();
  await mobile.locator('#studio-tab-appearance').tap();
  await expect(mobile.locator('.mobile-estimate-bar')).toBeVisible();
  await mobile.locator('.mobile-estimate-bar a').tap();
  await expect(mobile.locator('.estimate-section')).toBeInViewport();
  record('Mobile guided shape-to-material-to-estimate journey with persistent cost bar');

  const cold = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const coldPage = await cold.newPage();
  await coldPage.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await coldPage.goto(base + '/pl/', { waitUntil: 'networkidle' });
  await coldPage.locator('canvas[data-area]').waitFor();
  performanceSample = await coldPage.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0], resources = performance.getEntriesByType('resource');
    return { environment: 'Cold browser context; local static preview; headless Chromium software WebGL; no throttling; not a Lighthouse score', width: innerWidth,
      domContentLoadedMs: navigation.domContentLoadedEventEnd, loadMs: navigation.loadEventEnd,
      fcpMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime, lcpMs: window.__lcp,
      resourceCount: resources.length, transferredBytes: resources.reduce((n, r) => n + r.transferSize, 0),
      jsBytes: resources.filter(r => r.name.split('?')[0].endsWith('.js')).reduce((n, r) => n + r.encodedBodySize, 0) };
  });
  await coldPage.screenshot({ path: 'qa/touch-home-mobile.png' });
  record('Mobile homepage load and resource timing sample recorded');
  await cold.close();
  await touch.close();
} catch (error) {
  await page.screenshot({ path: 'qa/extended-failure.png', fullPage: true }).catch(() => {});
  throw error;
} finally {
  await writeFile('qa/extended-results.json', JSON.stringify({ date: new Date().toISOString(), results, performanceSample }, null, 2));
  await browser.close();
}
