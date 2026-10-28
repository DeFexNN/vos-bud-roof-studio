import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, type RoofConfig } from '../configurator/model';
import { buildRoof } from '../calculators/geometry/roof';
import { dot, sub } from '../calculators/geometry/vector';
import { calculateQuantities, membraneTakeoff, timberTakeoff, up } from '../calculators/quantities';
import { calculateEstimate, cents, effectiveVat } from '../calculators/estimate';
import { restoreConfig, validateConfig } from '../calculators/validation';
import { productById, products } from '../data/materials';
import { netPrice, prices, sources } from '../data/prices';
import { messages } from '../i18n/messages';
import { projects } from '../data/projects';

const config = (patch: Partial<RoofConfig> = {}): RoofConfig => ({ ...defaultConfig, ...patch });
const near = (value: number, expected: number, epsilon = 1e-6) => assert.ok(Math.abs(value - expected) < epsilon, `${value} ≠ ${expected}`);

test('gable: roof area uses the actual eaves span and cosine, not floor area', () => {
  const c = config({ overhang: .5, length: 12, width: 8, pitch: 30 }), g = buildRoof(c);
  near(g.grossArea, 13 * 9 / Math.cos(Math.PI / 6));
  near(g.planes[0].slopeLength, 4.5 / Math.cos(Math.PI / 6));
  near(g.footprint, 96); near(g.projectedArea, 117);
  near(g.ridge, 13); near(g.eaves, 26);
});
test('hip: individual trapezoids and triangles form the actual roof', () => {
  const c = config({ type: 'hip', length: 12, width: 8, overhang: 0, pitch: 30 }), g = buildRoof(c);
  assert.equal(g.planes.length, 4);
  near(g.planes[0].area, (12 + 4) / 2 * 4 / Math.cos(Math.PI / 6));
  near(g.planes[2].area, 8 * 4 / 2 / Math.cos(Math.PI / 6));
  near(g.grossArea, 96 / Math.cos(Math.PI / 6));
  near(g.ridge, 4); near(g.eaves, 40); near(g.barges, 0);
});
test('hip: rotating building dimensions preserves area and hip length', () => {
  const a = buildRoof(config({ type: 'hip', length: 14, width: 8 })), b = buildRoof(config({ type: 'hip', length: 8, width: 14 }));
  near(a.grossArea, b.grossArea); near(a.hips, b.hips); near(a.ridge, b.ridge);
});
test('square hip: valid pyramid, no duplicate ridge length', () => {
  const g = buildRoof(config({ type: 'hip', length: 8, width: 8 }));
  assert.equal(g.planes.length, 4); near(g.ridge, 0);
  near(g.grossArea, 8.9 ** 2 / Math.cos(35 * Math.PI / 180));
});
test('custom hip ridge actually changes triangular end-plane slopes', () => {
  const a = buildRoof(config({ type: 'hip', ridgeLength: 4 })), b = buildRoof(config({ type: 'hip', ridgeLength: 8 }));
  assert.ok(b.planes[2].pitch > a.planes[2].pitch); assert.notEqual(a.grossArea, b.grossArea);
});
test('mono-pitch uses a full-span slope and a single plane', () => {
  const c = config({ type: 'mono', pitch: 15 }), g = buildRoof(c);
  assert.equal(g.planes.length, 1); near(g.ridge, 0); near(g.eaves, 12.9);
  near(g.grossArea, 12.9 * 8.9 / Math.cos(Math.PI / 12));
});
test('T multi-pitch: polygons partition a real T plan; valleys have measured lengths', () => {
  const c = config({ type: 'multi', pitch: 35 }), g = buildRoof(c);
  near(g.grossArea, ((c.length + .9) * (c.width + .9) + (c.wingWidth + .9) * c.wingLength) / Math.cos(35 * Math.PI / 180));
  near(g.footprint, 96 + 4 * 3); assert.equal(g.planes.length, 5); assert.ok(g.valleys > 0);
  assert.equal(g.edges.filter(e => e.kind === 'valley').length, 2);
});
test('all plane polygons lie exactly in their measured 3D planes', () => {
  for (const type of ['mono', 'gable', 'hip', 'multi'] as const) for (const p of buildRoof(config({ type })).planes) {
    for (const v of p.vertices) near(dot(sub(v, p.origin), p.normal), 0);
    assert.ok(p.normal[1] > 0); assert.ok(p.area > 0);
  }
});
test('pitch monotonicity: all equal-pitch roofs increase area with pitch', () => {
  for (const type of ['mono', 'gable', 'hip', 'multi'] as const) {
    const areas = [15, 25, 35, 45, 60].map(pitch => buildRoof(config({ type, pitch })).grossArea);
    assert.ok(areas.every((a, i) => !i || a > areas[i - 1]));
  }
});
test('geometry changes with dimensions, not height or product price', () => {
  const a = buildRoof(config()), b = buildRoof(config({ length: 15 })), c = buildRoof(config({ height: 6 }));
  assert.ok(b.grossArea > a.grossArea); near(c.grossArea, a.grossArea);
  near(c.maxHeight - a.maxHeight, 2.8);
});
test('actual window holes are deducted from net roof area', () => {
  const g = buildRoof(config({ windows: 2, chimneys: 1 }));
  near(g.openingArea, 2 * .78 * 1.18 + .49 / Math.cos(35 * Math.PI / 180));
  near(g.netArea, g.grossArea - g.openingArea); assert.equal(g.unplacedOpenings, 0);
});
test('battens: rows are spaced and clipped, standard gable lengths are exact', () => {
  const c = config({ overhang: 0, pitch: 30 }), g = buildRoof(c), q = timberTakeoff(g, .35, 4, .08);
  const rowsPerPlane = Math.ceil(g.planes[0].slopeLength / .35) + 1;
  assert.equal(q.rows, rowsPerPlane * 2); near(q.length, q.rows * 12);
  assert.equal(q.pieces, Math.ceil(q.length * 1.08 / 4)); assert.equal(q.purchaseLength % 4, 0);
});
test('counter-battens: quantity follows actual rafter positions', () => {
  const c = config({ overhang: 0, pitch: 30, rafterSpacing: .8 }), g = buildRoof(c), q = timberTakeoff(g, .8, 4, 0, true);
  assert.equal(q.rows, (12 / .8 + 1) * 2); near(q.length, 32 * 4 / Math.cos(Math.PI / 6));
  assert.ok(timberTakeoff(g, .6, 4, 0, true).length > q.length);
});
test('hip battens are shorter near the ridge; no rectangular plane shortcut', () => {
  const g = buildRoof(config({ type: 'hip' })), q = timberTakeoff(g, .4, 4, 0);
  const rectangularWrong = g.planes.reduce((s, p) => s + (Math.ceil(p.slopeLength / .4) + 1) * p.width, 0);
  assert.ok(q.length < rectangularWrong);
});
test('membrane takes roll dimensions, strip overlap and rounding into account', () => {
  const g = buildRoof(config()), c = config({ membraneWaste: 0 }), q = membraneTakeoff(g, c);
  assert.equal(q.rolls, Math.ceil(q.linearUsed / 50));
  assert.equal(q.purchaseArea, q.rolls * 75); assert.ok(q.overlapArea > 0);
  const higher = membraneTakeoff(g, config({ membraneOverlap: .3, membraneWaste: 0 }));
  assert.ok(higher.linearUsed >= q.linearUsed);
});
test('effective width determines metal panels; physical width determines T18 price', () => {
  const c = config({ productId: 't18', coveringWaste: 0 }), r = calculateEstimate(c);
  const q = r.quantities!.covering, p = productById('t18')!;
  assert.equal(q.units, Math.ceil((c.length + c.overhang * 2) / p.effectiveWidth) * 2);
  near(q.billingQuantity, q.physicalArea); assert.ok(q.physicalArea > q.purchaseArea);
  const seam = calculateEstimate(config({ coveringWaste: 0 }));
  near(seam.quantities!.covering.billingQuantity, seam.quantities!.covering.purchaseArea);
});
test('tile quantities follow effective gauge and round to minipacks', () => {
  const c = config({ productId: 'titania', coveringWaste: .05 }), r = calculateEstimate(c), q = r.quantities!.covering;
  near(q.theoretical, r.geometry!.netArea / (.262 * .4));
  assert.equal(q.units % 4, 0);
  const dense = calculateEstimate(config({ productId: 'titania', battenSpacing: .38, coveringWaste: .05 }));
  assert.ok(dense.quantities!.covering.units > q.units);
});
test('module sheet planning intersects actual hip planes', () => {
  const r = calculateEstimate(config({ type: 'hip', productId: 'venecja', coveringWaste: 0 }));
  assert.ok(r.valid); assert.ok(r.quantities!.covering.purchaseArea >= r.geometry!.netArea);
  assert.ok(Number.isInteger(r.quantities!.covering.units));
});
test('cutting waste, overlap and reserve reconcile to physical purchase area', () => {
  for (const p of products) {
    const r = calculateEstimate(config({ productId: p.id, coveringWaste: .05 }));
    assert.ok(r.valid, p.id);
    const q = r.quantities!.covering;
    near(q.physicalArea, r.geometry!.netArea + q.cuttingWaste + q.reserveArea + q.overlapArea, 1e-5);
  }
});
test('waste reserve is monotonic and is not applied again to overlaps', () => {
  for (const p of products) {
    const a = calculateEstimate(config({ productId: p.id, coveringWaste: 0 })), b = calculateEstimate(config({ productId: p.id, coveringWaste: .1 }));
    assert.ok(b.quantities!.covering.units >= a.quantities!.covering.units);
    near(a.geometry!.grossArea, b.geometry!.grossArea);
    near(a.quantities!.battens.length, b.quantities!.battens.length);
  }
});
test('price totals, rounding and 23% VAT reconcile exactly', () => {
  const r = calculateEstimate(config()); assert.ok(r.valid);
  assert.equal(r.net, cents(r.items.reduce((n, i) => n + i.costNet, 0)));
  assert.equal(r.vat, cents(r.net * .23)); assert.equal(r.gross, cents(r.net + r.vat));
  near(r.materialsNet + r.laborNet + r.categories.demolition, r.net);
  assert.ok(r.low <= r.gross && r.high >= r.gross);
});
test('gross8 and gross23 source prices are normalized to net', () => {
  near(netPrice(prices['labor-metal']), 110 / 1.08);
  near(netPrice(prices.batten), 4.5 / 1.23);
  near(netPrice(prices['classic-design']), 83.11);
});
test('changing a sourced price changes cost, never geometry', () => {
  const a = calculateEstimate(config());
  const book = { ...prices, 'classic-design': { ...prices['classic-design'], unitPricePLN: 90, minimumPricePLN: 90, maximumPricePLN: 90 } };
  const b = calculateEstimate(config(), book);
  near(a.geometry!.grossArea, b.geometry!.grossArea); assert.ok(b.net > a.net);
});
test('bundled labor replaces all task labor lines without duplication', () => {
  const c = config({ laborScope: 'bundled', bundledLaborNet: 160, windows: 2 }), r = calculateEstimate(c);
  const labor = r.items.filter(i => i.category === 'labor');
  assert.equal(labor.length, 1); assert.equal(labor[0].id, 'labor-bundle');
  assert.equal(r.laborNet, cents(r.geometry!.grossArea * 160));
});
test('supply only has zero installation labor', () => {
  const r = calculateEstimate(config({ labor: false }));
  assert.equal(r.laborNet, 0); assert.equal(r.items.filter(i => i.category === 'labor').length, 0);
});
test('reduced VAT requires eligibility and uses floor-area proportion, never roof area', () => {
  near(effectiveVat(config({ vatMode: 'residential', vatEligible: true, residentialArea: 400 })), .08 * .75 + .23 * .25);
  near(effectiveVat(config({ vatMode: 'residential', vatEligible: true, residentialType: 'apartment', residentialArea: 200 })), .1175);
  assert.equal(calculateEstimate(config({ vatMode: 'residential', vatEligible: false })).valid, false);
  assert.equal(calculateEstimate(config({ vatMode: 'residential', vatEligible: true, labor: false })).valid, false);
});
test('shingle assembly has no tile battens and requires decking and bitumen underlay', () => {
  const r = calculateEstimate(config({ productId: 'superglass', pitch: 20 })); assert.ok(r.valid);
  assert.equal(r.quantities!.battens.length, 0); assert.equal(r.quantities!.counter.length, 0);
  assert.ok(r.items.some(i => i.id === 'osb')); assert.ok(r.items.some(i => i.id === 'bitumen-underlay'));
  assert.equal(r.quantities!.membrane.overlap, .55);
});
test('shingles have nails and additional starter/ridge bundles, with ventilation excluded explicitly', () => {
  const r = calculateEstimate(config({ productId: 'superglass' }));
  const nails = r.items.find(i => i.id === 'shingle-nails')!, extra = r.items.find(i => i.id === 'shingle-starter-ridge')!;
  assert.ok(nails.quantity > 0); assert.equal(nails.quantity, Math.ceil(r.quantities!.covering.purchaseArea / 80));
  assert.equal(extra.quantity, Math.ceil(r.geometry!.eaves / 14 + (r.geometry!.ridge + r.geometry!.hips) / 6));
  assert.equal(extra.priceId, 'superglass'); assert.ok(r.partial);
});
test('joint tape theoretical quantity includes opening perimeters in the same roll unit', () => {
  const r = calculateEstimate(config({ windows: 2, chimneys: 1 }));
  const tape = r.items.find(i => i.id === 'sealing-tape')!;
  near(tape.theoretical, (r.quantities!.membrane.seamLength + 2 * 3.92 + 2.8) / 25);
  assert.equal(tape.quantity, Math.ceil(tape.theoretical)); assert.equal(tape.unit, 'roll');
});
test('invalid input is rejected rather than producing false totals', () => {
  for (const patch of [{ length: 0 }, { width: -1 }, { pitch: 89 }, { height: NaN }, { windows: .5 }, { windows: 100 }, { overhang: -1 }, { productId: 'missing' }]) {
    const r = calculateEstimate(config(patch)); assert.equal(r.valid, false); assert.equal(r.gross, 0);
  }
  assert.equal(calculateEstimate(config({ type: 'multi', wingWidth: 12 })).valid, false);
  assert.equal(calculateEstimate(config({ type: 'hip', ridgeLength: 50 })).valid, false);
});
test('incompatible pitches, batten gauges and sheet laps are rejected', () => {
  assert.equal(calculateEstimate(config({ productId: 'titania', pitch: 5 })).valid, false);
  assert.equal(calculateEstimate(config({ productId: 'venecja', battenSpacing: .4 })).valid, false);
  assert.equal(calculateEstimate(config({ pitch: 12, membraneOverlap: .1 })).valid, false);
});
test('missing product price never silently falls back to an arbitrary rate', () => {
  const book = { ...prices }; delete book['classic-design'];
  const r = calculateEstimate(config(), book); assert.equal(r.valid, false); assert.equal(r.gross, 0);
});
test('purchase units are whole, quantities and costs never negative across a configuration grid', () => {
  for (const type of ['mono', 'gable', 'hip', 'multi'] as const) for (const pitch of [25, 35, 45]) for (const p of products) {
    const r = calculateEstimate(config({ type, pitch, productId: p.id })); assert.ok(r.valid, `${type} ${pitch} ${p.id}`);
    for (const item of r.items) { assert.ok(item.quantity >= 0 && item.costNet >= 0); if (['piece', 'pack', 'roll'].includes(item.unit)) assert.ok(Number.isInteger(item.quantity)); }
  }
});
test('malformed persistent/shared data is rejected; valid full data round-trips', () => {
  assert.equal(restoreConfig({ ...defaultConfig, length: 'oops' }), null);
  assert.equal(restoreConfig({ ...defaultConfig, priceOverrides: { batten: -2 } }), null);
  assert.equal(restoreConfig({ ...defaultConfig, color: 'made-up' }), null);
  assert.deepEqual(restoreConfig(JSON.parse(JSON.stringify(defaultConfig))), defaultConfig);
});
test('localization is complete, dictionary keys match and public data has no Cyrillic', () => {
  const keys = (o: Record<string, unknown>, prefix = ''): string[] => Object.entries(o).flatMap(([key, value]) => typeof value === 'object' && value ? keys(value as Record<string, unknown>, `${prefix}${key}.`) : [`${prefix}${key}`]);
  assert.deepEqual(keys(messages.pl).sort(), keys(messages.en).sort());
  assert.equal(/[\u0400-\u04ff]/.test(JSON.stringify({ messages, projects, products, prices, sources })), false);
  assert.equal(projects.length, 10); assert.equal(new Set(projects.map(p => p.instagramId)).size, 10);
});
test('every price has a documented source, valid VAT and physical purchasing unit', () => {
  for (const p of Object.values(prices)) { assert.ok(sources.some(s => s.id === p.sourceId)); assert.ok(p.sourceURL.startsWith('https://')); assert.ok(p.unitPricePLN >= 0); }
});
test('reviewed photo pairs never imply alignment or an unverified before condition', () => {
  assert.equal(projects.filter(project => project.presentation === 'sequence').length, 9);
  assert.equal(projects.find(project => project.number === '10')?.presentation, 'views');
  assert.equal(projects.some(project => project.presentation === 'aligned'), false);
});
