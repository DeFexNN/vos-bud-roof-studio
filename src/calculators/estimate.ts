import type { RoofConfig } from '@/configurator/model';
import { productById } from '@/data/materials';
import { prices, netPrice, type Category, type PriceRecord, type Unit } from '@/data/prices';
import { bi, type Bilingual } from '@/i18n/types';
import { buildRoof, type RoofGeometry } from './geometry/roof';
import { calculateQuantities, up, type Quantities } from './quantities';
import { validateConfig, type Issue } from './validation';

export interface BillItem {
  id: string;
  priceId: string;
  name: Bilingual;
  category: Category;
  unit: Unit;
  quantity: number;
  theoretical: number;
  unitNet: number;
  lowUnitNet: number;
  highUnitNet: number;
  costNet: number;
  formula: Bilingual;
  sourceId: string;
  overridden: boolean;
}
export interface Estimate {
  valid: boolean;
  geometry: RoofGeometry | null;
  quantities: Quantities | null;
  issues: Issue[];
  items: BillItem[];
  categories: Record<Category, number>;
  materialsNet: number;
  laborNet: number;
  net: number;
  vat: number;
  vatRate: number;
  gross: number;
  low: number;
  high: number;
  partial: boolean;
}
export const cents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const emptyCategories = (): Record<Category, number> => ({ covering: 0, underlay: 0, timber: 0, accessories: 0, drainage: 0, labor: 0, demolition: 0, structure: 0, extras: 0 });

export function effectiveVat(c: RoofConfig) {
  if (c.vatMode !== 'residential' || !c.vatEligible || !c.labor) return .23;
  const eligibleShare = Math.min(1, (c.residentialType === 'house' ? 300 : 150) / c.residentialArea);
  return .08 * eligibleShare + .23 * (1 - eligibleShare);
}

export function calculateEstimate(c: RoofConfig, book: Record<string, PriceRecord> = prices): Estimate {
  const issues = validateConfig(c);
  const result: Estimate = { valid: false, geometry: null, quantities: null, issues, items: [], categories: emptyCategories(), materialsNet: 0,
    laborNet: 0, net: 0, vat: 0, vatRate: effectiveVat(c), gross: 0, low: 0, high: 0, partial: false };
  if (issues.some(i => i.severity === 'error')) return result;
  const product = productById(c.productId)!;
  let g: RoofGeometry;
  try { g = buildRoof(c); }
  catch { return { ...result, issues: [...issues, { code: 'dimensions', severity: 'error' }] }; }
  result.geometry = g;
  if (g.unplacedOpenings) issues.push({ code: 'openings', severity: 'error' });
  if (g.planes.some(p => p.pitch < product.minimumPitch - .01 || p.pitch > 75)) issues.push({ code: 'pitch', severity: 'error' });
  if (g.planes.some(p => p.pitch < product.standardPitch - .01) && product.kind !== 'shingle') issues.push({ code: 'assembly', severity: 'warning' });
  if (issues.some(i => i.severity === 'error')) return result;
  const q = calculateQuantities(g, product, c);
  result.quantities = q;
  if (q.covering.hasEndJoints && product.system === 'seam' && g.planes.some(p => p.pitch < 14)) {
    issues.push({ code: 'sheetLap', severity: 'error' }); return result;
  }
  const items: BillItem[] = [];
  const add = (id: string, quantity: number, theoretical: number, formula: Bilingual, uniqueId = id, customName?: Bilingual) => {
    if (quantity <= 0) return;
    const price = book[id];
    if (!price || ![price.unitPricePLN, price.minimumPricePLN, price.maximumPricePLN].every(n => Number.isFinite(n) && n >= 0)) {
      issues.push({ code: 'price', severity: 'error', field: id }); return;
    }
    const override = c.priceOverrides[id];
    const unitNet = override ?? netPrice(price);
    items.push({ id: uniqueId, priceId: id, name: customName || price.name, category: price.category, unit: price.unit,
      quantity, theoretical, unitNet, lowUnitNet: override ?? netPrice(price, price.minimumPricePLN), highUnitNet: override ?? netPrice(price, price.maximumPricePLN),
      costNet: cents(quantity * unitNet), formula, sourceId: price.sourceId, overridden: override !== undefined });
  };
  const n = (x: number) => Number(x.toFixed(3));
  const simple = (pl: string, en: string) => bi(pl, en);
  const edgeUnits = (kind: 'ridge' | 'hip' | 'valley' | 'eave' | 'barge' | 'high', coverage: number) => g.edges.filter(e => e.kind === kind).reduce((s, e) => s + up(e.length / coverage), 0);
  const ridgeUnits = (coverage: number) => edgeUnits('ridge', coverage) + edgeUnits('hip', coverage);
  const ridgeEdges = g.edges.filter(e => e.kind === 'ridge' || e.kind === 'hip');
  const ridgeEnds = new Map<string, number>();
  for (const e of ridgeEdges) for (const p of [e.a, e.b]) { const key = p.map(v => v.toFixed(4)).join(','); ridgeEnds.set(key, (ridgeEnds.get(key) || 0) + 1); }

  add(c.productId, q.covering.billingQuantity, q.covering.theoretical, simple(
    `${n(g.netArea)} m² netto; moduł krycia ${product.effectiveWidth} m. Rozkrój połaci: ${q.covering.baseUnits} szt./opak.; rezerwa ${n(c.coveringWaste * 100)}%. Zakłady są już w wymiarach krycia. Otwory nie skracają zamawianych arkuszy.`,
    `${n(g.netArea)} net m²; effective module ${product.effectiveWidth} m. Plane layout: ${q.covering.baseUnits} pieces/bundles; reserve ${n(c.coveringWaste * 100)}%. Effective dimensions already include overlaps. Openings do not shorten ordered sheets.`));
  add('batten', q.battens.purchaseLength, q.battens.length, simple(
    `${q.battens.rows} rzędów; Σ długości przyciętych rzędów = ${n(q.battens.length)} m. ceil(×${1 + c.timberWaste}/${c.timberLength}) = ${q.battens.pieces} szt. po ${c.timberLength} m. Górny rząd podparcia dodatkowy.`,
    `${q.battens.rows} rows; Σ clipped row lengths = ${n(q.battens.length)} m. ceil(×${1 + c.timberWaste}/${c.timberLength}) = ${q.battens.pieces} pieces of ${c.timberLength} m. Additional top support row.`));
  add('counter', q.counter.purchaseLength, q.counter.length, simple(
    `${q.counter.rows} przebiegów w rozstawie ${c.rafterSpacing} m. Σ = ${n(q.counter.length)} m; ${q.counter.pieces} szt. po ${c.timberLength} m. Łączenia odcinków wymagają rozplanowania na podporach.`,
    `${q.counter.rows} runs at ${c.rafterSpacing} m spacing. Σ = ${n(q.counter.length)} m; ${q.counter.pieces} pieces of ${c.timberLength} m. Splices must be arranged at supports.`));
  const shingle = product.kind === 'shingle';
  add(shingle ? 'bitumen-underlay' : c.membraneId, q.membrane.rolls, q.membrane.linearUsed / q.membrane.rollLength, simple(
    `${q.membrane.strips} pasm, ${n(q.membrane.linearUsed)} mb rolki; szer. ${q.membrane.width} m, zakład ${q.membrane.overlap} m. ceil(${n(q.membrane.linearUsed)} × ${1 + c.membraneWaste} / ${q.membrane.rollLength}). Bez odejmowania otworów — zakłady na kołnierze.`,
    `${q.membrane.strips} strips, ${n(q.membrane.linearUsed)} roll meters; width ${q.membrane.width} m, overlap ${q.membrane.overlap} m. ceil(${n(q.membrane.linearUsed)} × ${1 + c.membraneWaste} / ${q.membrane.rollLength}). Openings retained for collar turn-ups.`));
  if (!shingle) add('sealing-tape', up((q.membrane.seamLength + c.chimneys * 2.8 + c.windows * 3.92) / 25), (q.membrane.seamLength + c.chimneys * 2.8 + c.windows * 3.92) / 25,
    simple('Długość złączy membrany + obwody otworów; rolki 25 m. Taśma nie zastępuje projektu szczelnego podkładu.', 'Membrane seams plus opening perimeters; 25 m rolls. Tape is not a substitute for an engineered waterproof underlay.'));
  if (!shingle) add('counter-seal', up(q.counter.length / 30), q.counter.length / 30,
    simple('Uszczelnienie przebicia membrany pod każdym przebiegiem kontrłat; rolki 30 m.', 'Seal membrane penetrations along each counter-batten run; 30 m rolls.'));
  if (shingle || c.sheathing) add('osb', up(g.grossArea * 1.08 / 3.125), g.grossArea / 3.125,
    simple('Powierzchnia brutto × 1,08 / 3,125 m² na płytę. Zaokrąglenie do pełnej płyty, 8% zapasu na cięcia.', 'Gross area × 1.08 / 3.125 m² per board. Round to whole boards, 8% cutting allowance.'));

  if (product.kind === 'tile') {
    add('tile-clips', up(q.covering.units / 100), q.covering.units / 100, simple('Budżet: 1 spinka/dachówkę; paczka 100 szt. Ostateczny schemat mocowania zależy od obciążeń wiatrem.', 'Budget: one clip per tile; 100-piece packs. Final fixing scheme depends on wind loads.'));
    add(product.system === 'ceramic' ? 'clay-ridge' : 'concrete-ridge', ridgeUnits(.4), (g.ridge + g.hips) / .4,
      simple('Każdy odcinek kalenicy/grzbietu osobno: ceil(długość / 0,4 m).', 'Each ridge/hip segment separately: ceil(length / 0.4 m).'));
    if (product.system === 'ceramic') {
      add('clay-ridge-end', [...ridgeEnds.values()].filter(n => n === 1).length, [...ridgeEnds.values()].filter(n => n === 1).length, simple('Jedna zaślepka na wolne zakończenie kalenicy/grzbietu.', 'One end cap per open ridge/hip termination.'));
      add('clay-ridge-junction', [...ridgeEnds.values()].filter(n => n >= 3).length, [...ridgeEnds.values()].filter(n => n >= 3).length, simple('Węzły trójramienne. Kalenica punktowa wymaga indywidualnego czwórnika.', 'Three-way junctions. A point ridge needs a project-specific four-way cap.'));
    }
    add('ridge-tape', up((g.ridge + g.hips) / 4.9), (g.ridge + g.hips) / 5, simple('Kalenice i grzbiety / 4,9 m efektywnie na rolkę (100 mm zakładu).', 'Ridges and hips / 4.9 m effective per roll (100 mm lap).'));
  } else if (!shingle) {
    add(product.system === 'seam' ? 'seam-screws' : 'screws', up(g.netArea * 8 / 250), g.netArea * 8 / 250,
      simple('Budżet 8 mocowań/m², paczka 250 szt. Docelowy schemat według dokumentacji produktu i stref wiatrowych.', 'Budget: 8 fixings/m², packs of 250. Final scheme follows product documentation and wind zones.'));
    const seam = product.system === 'seam';
    add(seam || product.system === 'trapezoid' ? 'seam-ridge' : 'metal-ridge', ridgeUnits(seam || product.system === 'trapezoid' ? 1.9 : 1.145), (g.ridge + g.hips) / (seam || product.system === 'trapezoid' ? 1.9 : 1.145),
      simple('Każdy odcinek kalenicy i grzbietu zaokrąglony do pełnego gąsiora według długości krycia.', 'Each ridge and hip segment rounded to a whole ridge component using effective length.'));
    if (seam) {
      add('ridge-vent', up((g.ridge + g.hips) * 2 / 3), (g.ridge + g.hips) * 2 / 3,
        simple('Dwie strony kalenicy/grzbietów; wentylowane listwy po 3 m.', 'Both ridge/hip sides; 3 m ventilated support strips.'));
      const sheetLength = q.covering.sheetCuts.filter(s => !s.reserve).reduce((n, s) => n + s.length * s.count, 0);
      add('acoustic-tape', up(sheetLength / 20), sheetLength / 20, simple('Jeden pas taśmy wzdłuż każdego panelu; rolki 20 m.', 'One acoustic strip along each panel; 20 m rolls.'));
    } else add('ridge-tape', up((g.ridge + g.hips) / 4.9), (g.ridge + g.hips) / 5, simple('Wentylacja kalenic i grzbietów; rolki z zakładem 100 mm.', 'Ridge/hip ventilation; rolls with 100 mm overlaps.'));
  } else {
    add('shingle-nails', up(q.covering.purchaseArea / 80), q.covering.purchaseArea / 80,
      simple('Budżet gwoździ: opak. 5 kg / 80 m² krycia. Typ i liczba według instrukcji konkretnej generacji gontu.', 'Nail allowance: 5 kg pack / 80 m² coverage. Confirm type and count in the shingle generation’s manual.'));
    const bundleExtras = up(g.eaves / 14 + (g.ridge + g.hips) / 6);
    add('superglass', bundleExtras, g.eaves / 14 + (g.ridge + g.hips) / 6, simple('Dodatkowe pasy startowe: 14 mb/paczkę; gąsiory cięte z trzech zakładek: ok. 6 mb/paczkę. Przedmiar według 14 pasów w paczce 2.0.', 'Additional starter strips: 14 m/bundle; ridge tabs cut three per shingle: about 6 m/bundle. Takeoff uses 14 shingles per 2.0 bundle.'), 'shingle-starter-ridge', bi('Gont na starter i kalenice', 'Starter and ridge shingles'));
  }
  const seam = product.system === 'seam';
  add(seam ? 'seam-eave' : 'eave-flashing', edgeUnits('eave', 1.9), g.eaves / 1.9, simple('Σ ceil(każdy okap / 1,9 m); długość całkowita 2 m, zakład 100 mm.', 'Σ ceil(each eave / 1.9 m); 2 m physical length, 100 mm lap.'));
  const bargeCoverage = seam ? 1.9 : 1.1;
  add(seam ? 'seam-barge' : 'barge', edgeUnits('barge', bargeCoverage) + edgeUnits('high', bargeCoverage), g.barges / bargeCoverage,
    simple(`Σ ceil(krawędź szczytowa / ${bargeCoverage} m). Budżet obróbki metalowej; detale szczytu do potwierdzenia dla systemu.`, `Σ ceil(verge edge / ${bargeCoverage} m). Metal-flashing allowance; confirm system-specific verge details.`));
  add(seam ? 'seam-valley' : 'valley', edgeUnits('valley', 1.8), g.valleys / 1.8, simple('Każdy kosz osobno: ceil(długość / 1,8 m), zakład 200 mm.', 'Each valley separately: ceil(length / 1.8 m), 200 mm overlap.'));
  if (c.gutters) {
    const drainFormula = simple('Siba Round 125/90; długości wynikają z krawędzi okapu. 1 spust na maks. 10 m odcinka to założenie planistyczne, nie obliczenie hydrauliczne.', 'Siba Round 125/90; lengths follow the eave edges. One outlet per maximum 10 m segment is a planning assumption, not hydraulic sizing.');
    add('gutter', q.gutterPieces, g.eaves / 4, drainFormula);
    add('gutter-hook', q.gutterHooks, g.eaves / .6, simple('Haki co maks. 0,6 m + końce odcinków. Lokalny rozstaw do potwierdzenia.', 'Brackets at maximum 0.6 m plus segment ends. Confirm local spacing.'));
    add('gutter-joint', q.gutterJoints, q.gutterJoints, drainFormula);
    add('gutter-end', q.gutterEnds, q.gutterEnds, drainFormula);
    add('gutter-corner', q.gutterCorners, q.gutterCorners, drainFormula);
    add('downpipe', q.downpipeRuns * up(q.downpipeLength / q.downpipeRuns / 3), q.downpipeLength / 3, drainFormula);
    add('outlet', q.downpipeRuns, q.downpipeRuns, drainFormula);
    add('elbow', q.downpipeRuns * 3, q.downpipeRuns * 3, simple('Dwa kolana + wylewka na spust; osobna rurka odsadzki uwzględniona w zapasie długości.', 'Two bends and one shoe per outlet; offset pipe included in the length allowance.'));
    add('pipe-clamp', q.downpipeRuns * (up(c.height / 2) + 1), q.downpipeRuns * (up(c.height / 2) + 1), simple('Uchwyt z trzpieniem co maks. 2 m + końcowy.', 'Clamp with stud at maximum 2 m intervals plus an end clamp.'));
  }
  add('window', c.windows, c.windows, simple('Faktycznie modelowane otwory 0,78 × 1,18 m.', 'Actual modeled openings: 0.78 × 1.18 m.'));
  add('window-collar', c.windows, c.windows, simple('Jeden kołnierz na okno. Typ TZ/TS jako budżet odniesienia, kompatybilność profilu do potwierdzenia.', 'One collar per window. TZ/TS reference allowance; confirm profile compatibility.'));
  add('chimney-flashing', up(c.chimneys * (2.8 + .4) / 5), c.chimneys * 2.8 / 5,
    simple('Komin 0,7 × 0,7 m, obwód 2,8 m + 0,4 m naddatku; rolki 5 m. Komin istniejący — bez budowy przewodu.', '0.7 × 0.7 m chimney, 2.8 m perimeter + 0.4 m allowance; 5 m rolls. Existing chimney; flue construction excluded.'));
  if (c.insulation) add('wool', up(g.netArea * 1.05 / 4.56), g.netArea / 4.56, simple('Jedna warstwa 150 mm, powierzchnia netto + 5%; pełne paczki 4,56 m². Bez paroizolacji i wykończenia wnętrza.', 'One 150 mm layer, net area + 5%; whole 4.56 m² packs. Vapor barrier and interior lining excluded.'));
  if (c.structuralTimber) add('structural-wood', q.structuralVolume, q.structuralVolume / (1 + c.timberWaste), simple('Σ przebiegów × 0,08 × 0,20 + długości belek × 0,14 × 0,14, z zapasem. Przekroje wyłącznie poglądowe, nie dobór konstrukcyjny.', 'Σ runs × 0.08 × 0.20 + beam lengths × 0.14 × 0.14, plus waste. Sections are illustrative, not a structural design.'));
  if (c.snowGuards) add('snow-stop', up(g.eaves / .5), g.eaves / .5, simple('Jedna linia śniegołapów co 0,5 m okapu; rzeczywista liczba zależy od obciążenia śniegiem i producenta.', 'One line of stops at 0.5 m eave spacing; actual quantity depends on snow loads and manufacturer guidance.'));
  if (c.demolition !== 'none') add(`demolition-${c.demolition}`, g.grossArea, g.grossArea,
    simple('Demontaż od powierzchni brutto. Zakres starego pokrycia wymaga inwentaryzacji; nie dotyczy azbestu.', 'Removal from gross roof area. Survey the existing covering; asbestos excluded.'));
  if (c.demolition === 'felt' && c.disposalVolume) add('disposal', c.disposalVolume, c.disposalVolume, simple('Objętość odpadu podana przez użytkownika; nie przeliczamy jej z m² dachu.', 'Waste volume supplied by the user; not inferred from roof area.'));

  // Mutually exclusive labor modes; a bundled contractor rate replaces ALL task lines.
  if (c.labor && c.laborScope === 'bundled') {
    items.push({ id: 'labor-bundle', priceId: 'labor-bundle', name: bi('Kompletny montaż · własna stawka', 'Complete installation · your rate'), category: 'labor', unit: 'm2', quantity: g.grossArea, theoretical: g.grossArea,
      unitNet: c.bundledLaborNet, lowUnitNet: c.bundledLaborNet, highUnitNet: c.bundledLaborNet, costNet: cents(g.grossArea * c.bundledLaborNet),
      formula: bi('Własna stawka wykonawcy × powierzchnia brutto. Obejmuje wszystkie wybrane czynności montażowe; demontaż osobno.', 'Your contractor rate × gross area. Includes all selected installation tasks; demolition remains separate.'), sourceId: 'user', overridden: true });
  } else if (c.labor) {
    const laborFormula = simple('Wyłącznie ta czynność. Materiał i pozostałe etapy w osobnych pozycjach. Źródłowa stawka krycia nie obejmuje poszycia.', 'This task only. Material and other stages are separate. Source covering rate excludes underlay.');
    add(`labor-${product.system}`, g.netArea, g.netArea, laborFormula);
    add('labor-underlay', g.grossArea, g.grossArea, simple('Montaż podkładu; w tym budżecie obejmuje także mocowanie kontrłat, bez osobnej dopłaty.', 'Underlay installation; this budget also includes counter-batten fixing with no separate charge.'));
    if (!shingle) add('labor-battens', g.grossArea, g.grossArea, laborFormula);
    if (shingle || c.sheathing) add('labor-osb', g.grossArea, g.grossArea, laborFormula);
    add('labor-flashing', g.eaves + g.barges + g.valleys, g.eaves + g.barges + g.valleys, laborFormula);
    add('labor-ridge', g.ridge, g.ridge, laborFormula);
    add('labor-hip', g.hips, g.hips, laborFormula);
    if (c.gutters) add('labor-gutters', g.eaves + q.downpipeLength, g.eaves + q.downpipeLength, laborFormula);
    add('labor-window', c.windows, c.windows, laborFormula);
    add('labor-chimney', c.chimneys, c.chimneys, laborFormula);
    if (c.insulation) add('labor-wool', g.netArea, g.netArea, laborFormula);
    if (c.structuralTimber) add('labor-structure', g.grossArea, g.grossArea, laborFormula);
  }
  if (issues.some(i => i.severity === 'error')) return result;
  const categories = emptyCategories();
  for (const item of items) categories[item.category] = cents(categories[item.category] + item.costNet);
  const net = cents(items.reduce((s, i) => s + i.costNet, 0));
  const vatRate = effectiveVat(c), vat = cents(net * vatRate);
  const lowNet = cents(items.reduce((s, i) => s + cents(i.quantity * i.lowUnitNet), 0));
  const highNet = cents(items.reduce((s, i) => s + cents(i.quantity * i.highUnitNet), 0));
  return { ...result, valid: true, items, categories, quantities: q, geometry: g, net, vat, vatRate,
    gross: cents(net + vat), low: cents(lowNet + cents(lowNet * vatRate)), high: cents(highNet + cents(highNet * vatRate)),
    laborNet: categories.labor, materialsNet: cents(net - categories.labor - categories.demolition),
    partial: issues.some(i => ['assembly', 'complex', 'timber', 'windowProfile', 'shingle'].includes(i.code)) };
}
