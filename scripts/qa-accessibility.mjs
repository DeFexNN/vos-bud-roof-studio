import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.QA_URL || 'http://localhost:3000';
await mkdir('qa', { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const reports = [];
async function audit(name) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const violations = result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
  reports.push({ name, violations });
  console.log(`${violations.length ? 'FAIL' : 'PASS'} accessibility ${name}`);
  if (violations.length) console.log(JSON.stringify(violations, null, 2));
}
try {
  for (const locale of ['pl', 'en']) {
    const paths = locale === 'pl' ? ['', 'podejscie', 'realizacje', 'materialy', 'studio', 'kosztorys', 'kontakt', 'prywatnosc', 'realizacje/nowy-rozdzial'] : ['', 'approach', 'projects', 'materials', 'studio', 'estimate', 'contact', 'privacy', 'projects/nowy-rozdzial'];
    for (const path of paths) {
      const url = `/${locale}/${path ? path + '/' : ''}`;
      await page.goto(base + url, { waitUntil: 'networkidle' });
      await audit(url);
    }
  }
  for (const locale of ['pl', 'en']) {
    await page.goto(base + `/${locale}/`, { waitUntil: 'networkidle' });
    await page.locator('.header-cta').hover();
    await audit(`${locale}: solid copper Contact hover`);
    await page.goto(base + `/${locale}/studio/`, { waitUntil: 'networkidle' });
    await page.getByTestId('configure-jump').hover();
    await audit(`${locale}: solid copper Configure roof hover`);
  }
  for (const locale of ['pl', 'en']) {
    await page.goto(base + `/${locale}/studio/`, { waitUntil: 'networkidle' });
    await page.locator('.control-panel details.accordion').first().evaluate(element => { element.open = true; });
    await audit(`${locale}: advanced dimensions`);
    await page.locator('#studio-tab-appearance').click();
    await page.locator('.control-panel details').evaluateAll(elements => elements.forEach(element => { element.open = true; }));
    await audit(`${locale}: materials, technical settings, openings and VAT expanded`);
    await page.locator('#studio-tab-layers').click();
    await audit(`${locale}: construction layers`);
  }
  await page.goto(base + '/en/projects/nowy-rozdzial/', { waitUntil: 'networkidle' });
  await page.locator('.comparison-expand').click();
  await page.locator('dialog.project-lightbox').waitFor({ state: 'visible' });
  await audit('fullscreen project dialog');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/pl/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Otwórz menu' }).click();
  await page.locator('dialog.mobile-menu').waitFor({ state: 'visible' });
  await audit('mobile navigation dialog');
  await page.keyboard.press('Escape');
  await page.goto(base + '/en/studio/', { waitUntil: 'networkidle' });
  await audit('mobile studio and persistent estimate');
  await page.goto(base + '/en/contact/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Download your inquiry', exact: true }).click();
  await audit('mobile inquiry validation errors');
} finally {
  await writeFile('qa/accessibility.json', JSON.stringify({ date: new Date().toISOString(), reports }, null, 2));
  await browser.close();
}
if (reports.some(r => r.violations.length)) process.exitCode = 1;
