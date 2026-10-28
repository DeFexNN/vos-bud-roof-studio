import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.QA_URL || 'http://localhost:3000';
await mkdir('qa', { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
const page = await context.newPage();
const results = [], errors = [], failedRequests = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) failedRequests.push(`${response.status()} ${response.url()}`); });
const record = (name, data = {}) => { results.push({ name, passed: true, ...data }); console.log(`PASS ${name}`); };
const waitFrame = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const goto = async path => { await page.goto(base + path, { waitUntil: 'networkidle' }); await waitFrame(); };
const canvas = () => page.locator('canvas[data-scene="studio"]');
const hash = async () => { await waitFrame(); return createHash('sha256').update(await canvas().screenshot()).digest('hex'); };
const drawn = async () => { await page.waitForSelector('canvas[data-area]', { timeout: 20000 }); await waitFrame(); };
const noOverflow = async () => {
  const dimension = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(dimension.document <= dimension.viewport + 1, `horizontal overflow ${JSON.stringify(dimension)} at ${page.url()}`);
};

try {
  await goto('/'); assert.ok(page.url().endsWith('/pl/')); record('Polish is default entry language');
  await drawn(); await page.screenshot({ path: 'qa/home-desktop.png' });
  assert.match(await page.title(), /V.O.S_BUD/);
  assert.ok(await page.locator('h1').count() === 1); await noOverflow();
  await page.getByRole('button', { name: 'Ceglasty RAL 8004', exact: true }).click();
  await waitFrame(); record('Hero roof colour interaction');
  await context.clearCookies(); await page.evaluate(() => localStorage.clear());
  await goto('/en/studio/'); await drawn();
  const baseArea = Number(await canvas().getAttribute('data-area'));
  let previousHash = await hash();
  const verifyChange = async (name, action, areaChanges = false) => {
    const previousArea = Number(await canvas().getAttribute('data-area'));
    await action(); await waitFrame();
    const next = await hash(); assert.notEqual(next, previousHash, `${name} must change actual WebGL pixels`); previousHash = next;
    const renderedArea = Number(await canvas().getAttribute('data-area')), uiArea = Number(await page.locator('[data-testid="roof-area"]').getAttribute('data-area'));
    assert.ok(Math.abs(renderedArea - uiArea) < .00001, 'geometry and estimator must share exact area');
    if (areaChanges) assert.notEqual(renderedArea, previousArea);
    record(name, { renderedArea, changedPixels: true });
  };
  await verifyChange('Roof pitch changes geometry and measured area', () => page.locator('#roof-pitch').fill('42'), true);
  await verifyChange('Building length changes geometry and estimate', () => page.locator('#roof-length').fill('15'), true);
  await verifyChange('Building width changes geometry and estimate', () => page.locator('#roof-width').fill('9'), true);
  await verifyChange('Overhang changes geometry and estimate', () => page.locator('#roof-overhang').fill('0.65'), true);
  for (const [name, planes] of [['Mono-pitch', 1], ['Hip', 4], ['Multi-pitch · T', 5], ['Gable', 2]]) {
    await verifyChange(`Parametric ${name} roof`, () => page.getByRole('button', { name, exact: true }).click());
    assert.equal(Number(await canvas().getAttribute('data-planes')), planes);
  }
  await page.locator('.control-panel summary').filter({ hasText: 'Advanced dimensions' }).click();
  await verifyChange('Building wall height changes model', () => page.locator('#roof-height').fill('4.5'));
  await page.getByRole('tab', { name: 'Covering & colour', exact: true }).click();
  for (const id of ['venecja', 't18', 'titania', 'celtycka', 'superglass', 'classic-design']) await verifyChange(`Material system ${id}`, () => page.locator('#roof-product').selectOption(id));
  await verifyChange('Roof colour changes actual material', () => page.getByRole('button', { name: 'Tile red RAL 8004', exact: true }).click());
  await verifyChange('Material finish changes actual lighting response', () => page.locator('#roof-finish').selectOption('satin'));
  await page.locator('.control-panel').getByText('Openings & accessories', { exact: true }).click();
  await verifyChange('Skylights create roof penetrations and update estimate', () => page.locator('#roof-windows').fill('2'));
  await verifyChange('Chimney creates a measurable roof penetration', () => page.locator('#roof-chimneys').fill('1'));
  await page.locator('.viewer-topline').getByRole('button', { name: 'Separate roof layers', exact: true }).click();
  await page.getByRole('tab', { name: 'Covering & colour', exact: true }).click();
  await page.locator('.control-panel details.accordion > summary').filter({ hasText: 'Technical settings' }).click();
  previousHash = await hash();
  await verifyChange('Rafter spacing changes supporting geometry', () => page.locator('#roof-rafterSpacing').fill('0.6'));
  await page.locator('.viewer-topline').getByRole('button', { name: 'Assemble roof', exact: true }).click();
  previousHash = await hash();
  for (const label of ['Top view', 'Front view', 'Isometric view', 'Rotate view', 'Zoom in', 'Zoom out', 'Reset camera']) {
    await verifyChange(label, () => page.getByRole('button', { name: label, exact: true }).click());
  }
  await verifyChange('Actual dimension overlay', () => page.getByRole('button', { name: 'Show measurements', exact: true }).click());
  await page.getByRole('tab', { name: 'Layers', exact: true }).click();
  await verifyChange('Exploded roof layers', () => page.locator('.layer-panel').getByRole('button', { name: 'Separate roof layers', exact: true }).click());
  assert.equal(await canvas().getAttribute('data-exploded'), '1.00');
  await page.getByRole('tab', { name: '04 Roof underlay', exact: false }).click().catch(() => page.locator('#tab-layer-membrane').click());
  assert.ok(await page.locator('#layer-detail').textContent());
  await page.locator('#tab-layer-membrane').focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#tab-layer-structure').getAttribute('aria-selected'), 'true'); record('Keyboard roof-layer navigation');
  await page.screenshot({ path: 'qa/studio-exploded-desktop.png' });
  await page.locator('.layer-panel').getByRole('button', { name: 'Assemble roof', exact: true }).click();
  await verifyChange('Model full-screen view', () => page.getByRole('button', { name: 'Full screen', exact: true }).click());
  assert.ok(await page.locator('.scene-fullscreen').isVisible());
  await page.locator('.fullscreen-close').click(); record('Exit model full screen');
  const beforePrice = Number(await page.locator('[data-testid="estimate-total"]').last().getAttribute('data-value'));
  await page.locator('.bill-table th button').first().click();
  const price = page.locator('.bill-explanation input').first(); const old = Number(await price.inputValue());
  await price.fill(String(old + 10));
  assert.ok(Number(await page.locator('[data-testid="estimate-total"]').last().getAttribute('data-value')) > beforePrice);
  record('Itemized unit-price override updates totals, geometry unchanged');
  await page.getByRole('button', { name: 'Restore source price', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.estimate-sidebar [data-testid="export-pdf"]').click();
  const pdf = await downloadPromise; await pdf.saveAs('qa/estimate-en.pdf');
  assert.ok((await readFile('qa/estimate-en.pdf')).subarray(0, 5).toString() === '%PDF-'); record('Real English PDF download');
  const configPromise = page.waitForEvent('download'); await page.locator('.estimate-sidebar').getByRole('button', { name: 'Download configuration', exact: true }).click();
  const configDownload = await configPromise; await configDownload.saveAs('qa/configuration.json');
  const savedConfig = JSON.parse(await readFile('qa/configuration.json', 'utf8')); assert.equal(savedConfig.windows, 2); record('Real JSON configuration download');
  await page.locator('.estimate-sidebar').getByRole('button', { name: 'Restore defaults', exact: true }).click();
  await page.locator('.estimate-sidebar input[type=file]').setInputFiles('qa/configuration.json');
  assert.ok((await page.locator('[data-testid="roof-area"]').getAttribute('data-area')) !== String(baseArea)); record('Import saved roof configuration');
  const polishSwitch = page.locator('.site-header .language-switch').getByRole('link', { name: 'PL', exact: true });
  await polishSwitch.click(); await page.waitForURL('**/pl/studio/'); await drawn();
  assert.equal(await page.locator('html').getAttribute('lang'), 'pl');
  const plPdfPromise = page.waitForEvent('download'); await page.locator('.estimate-sidebar [data-testid="export-pdf"]').click();
  const plPdf = await plPdfPromise; await plPdf.saveAs('qa/estimate-pl.pdf'); record('Polish PDF download with persisted configuration');
  await page.locator('.estimate-sidebar').getByRole('button', { name: 'Przywróć ustawienia', exact: true }).click();

  await goto('/pl/realizacje/');
  assert.equal(await page.locator('.comparison-input').count(), 0, 'No supplied pair is aligned closely enough for an overlay');
  assert.equal(await page.locator('.portfolio-grid article').count(), 10);
  for (let i = 0; i < 10; i++) {
    await page.locator('.project-evidence > summary').nth(i).click();
    const sequence = page.locator('.photo-sequence').nth(i); await sequence.scrollIntoViewIfNeeded();
    const projectNumber = Number(await sequence.getAttribute('data-project'));
    const images = sequence.locator('img'); assert.equal(await images.count(), 2);
    await images.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const sources = await images.evaluateAll(images => images.map(image => ({ src: image.currentSrc, fit: getComputedStyle(image).objectFit, loaded: image.naturalWidth > 0 })));
    assert.notEqual(sources[0].src, sources[1].src);
    assert.ok(sources.every(image => image.loaded && image.fit === 'contain'));
    const captions = await sequence.locator('figcaption').allTextContents();
    assert.ok(captions[0].includes(projectNumber === 10 ? 'Widok od frontu' : 'Przed'));
    assert.ok(captions[1].includes(projectNumber === 10 ? 'Widok z boku' : 'Po'));
    record(`Project ${projectNumber}: separate genuine views, explicit labels and uncropped photographs`);
  }
  await page.locator('.portfolio-filter > button', { hasText: 'Odbudowa' }).click();
  assert.equal(await page.locator('.portfolio-grid article').count(), 2);
  await page.locator('.portfolio-filter button').first().click();
  assert.equal(await page.locator('.portfolio-grid article').count(), 10); record('Portfolio category filters preserve all ten case studies');
  await page.locator('.project-preview').first().focus(); await page.keyboard.press('Enter'); await page.locator('dialog.project-lightbox').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Następna realizacja', exact: true }).click();
  await page.locator('.lightbox-bottom h2').filter({ hasText: 'Brązowy dach' }).waitFor();
  await page.keyboard.press('Escape'); await page.locator('.project-lightbox').waitFor({ state: 'detached' }); record('Full-screen case-study navigation and Escape');

  await goto('/en/materials/'); await drawn();
  await page.locator('#compare-0').selectOption('venecja'); await page.locator('#compare-1').selectOption('celtycka');
  assert.equal(await page.locator('.material-compare-grid article').count(), 2); record('Side-by-side material comparison with 3D models and current roof totals');
  await goto('/en/contact/'); let posted = false;
  page.on('request', req => { if (req.method() === 'POST') posted = true; });
  await page.getByRole('button', { name: 'Download your inquiry', exact: true }).click();
  assert.ok(await page.locator('.field-error').count() >= 3); record('Contact form validation');
  await page.locator('#contact-name').fill('Anna Kowalska'); await page.locator('#contact-email').fill('anna@example.com'); await page.locator('#contact-notes').fill('Roof replacement for an existing house, approximately 140 square meters.');
  await page.locator('.consent input').check();
  const inquiryPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download your inquiry', exact: true }).click();
  const inquiry = await inquiryPromise; await inquiry.saveAs('qa/inquiry.txt');
  const inquiryText = await readFile('qa/inquiry.txt', 'utf8'); assert.match(inquiryText, /Anna Kowalska/); assert.match(inquiryText, /Classic Design/); assert.equal(posted, false); record('Real local inquiry document, no simulated network submission');

  const routeNames = ['nowy-rozdzial', 'antracytowa-linia', 'cieplo-brazu', 'przywrocona-forma', 'mala-bryla-duza-zmiana', 'swiatlo-pod-dachem', 'miejski-rytm', 'czekoladowy-horyzont', 'szacunek-do-detalu', 'wieksza-perspektywa'];
  for (const locale of ['pl', 'en']) {
    const roots = locale === 'pl' ? ['', 'podejscie', 'realizacje', 'materialy', 'studio', 'kosztorys', 'kontakt', 'prywatnosc'] : ['', 'approach', 'projects', 'materials', 'studio', 'estimate', 'contact', 'privacy'];
    const projectRoot = locale === 'pl' ? 'realizacje' : 'projects';
    for (const slug of [...roots, ...routeNames.map(id => `${projectRoot}/${id}`)]) {
      const path = `/${locale}/${slug ? slug + '/' : ''}`; await goto(path);
      assert.equal(await page.locator('h1').count(), 1); assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.equal(/[\u0400-\u04ff]/.test(await page.locator('body').innerText()), false);
      await noOverflow();
      const images = await page.locator('img').evaluateAll(images => images.filter(i => i.complete && i.naturalWidth === 0).map(i => i.src)); assert.deepEqual(images, []);
      assert.ok(await page.locator('link[rel=canonical]').count()); assert.equal(await page.locator('link[hreflang="pl-PL"]').count(), 1);
      record(`Localized static page ${path}`);
    }
  }
  const auditPages = ['/pl/', '/pl/studio/', '/pl/realizacje/', '/pl/kontakt/', '/en/materials/'];
  for (const path of auditPages) {
    await goto(path); const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const violations = axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
    await writeFile(`qa/axe-${path.replace(/\//g, '_')}.json`, JSON.stringify(violations, null, 2));
    assert.deepEqual(violations, [], `axe violations at ${path}`); record(`WCAG A/AA automated rules ${path}`);
  }
  for (const width of [320, 390, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    for (const path of ['/pl/', '/pl/studio/', '/pl/realizacje/', '/pl/kontakt/', '/en/materials/']) {
      await goto(path); await noOverflow(); record(`Responsive layout ${width}px ${path}`);
      if (width === 390 || width === 1920) await page.screenshot({ path: `qa/${path.replace(/\//g, '_')}-${width}.png` });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 }); await goto('/pl/');
  await page.getByRole('button', { name: 'Otwórz menu' }).click(); await page.locator('dialog.mobile-menu').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape'); await page.locator('dialog.mobile-menu').waitFor({ state: 'detached' }); record('Mobile accessible menu and Escape');
  assert.deepEqual(errors, [], 'no browser exceptions'); assert.deepEqual(failedRequests, [], 'no broken local assets');

  const fallbackContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await fallbackContext.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (type === 'webgl2' || type === 'webgl') return null; return original.call(this, type, ...args); }; });
  const fallbackPage = await fallbackContext.newPage(); await fallbackPage.goto(base + '/en/studio/', { waitUntil: 'networkidle' });
  assert.ok(await fallbackPage.locator('.scene-fallback').isVisible());
  await fallbackPage.locator('#roof-pitch').fill('45'); const newArea = Number(await fallbackPage.locator('[data-testid="roof-area"]').getAttribute('data-area')); assert.ok(newArea > baseArea);
  await fallbackPage.screenshot({ path: 'qa/fallback-mobile.png' }); record('Forced WebGL failure: real 2D geometry and calculator remain usable');
  await fallbackContext.close();
  await writeFile('qa/results.json', JSON.stringify({ date: new Date().toISOString(), results, errors, failedRequests }, null, 2));
  console.log(`\n${results.length} browser checks passed.`);
} catch (error) {
  await page.screenshot({ path: 'qa/failure.png', fullPage: true }).catch(() => {});
  await writeFile('qa/results.json', JSON.stringify({ results, errors, failedRequests, failure: String(error), url: page.url() }, null, 2));
  throw error;
} finally { await browser.close(); }
