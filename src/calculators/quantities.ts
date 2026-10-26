import type { RoofConfig } from '@/configurator/model';
import type { RoofProduct } from '@/data/materials';
import { type RoofGeometry, type RoofPlane, planeRuns, worldPoint } from './geometry/roof';
import { clipBand, EPS, polygonArea, type V3 } from './geometry/vector';

export const up = (v: number, unit = 1) => Math.ceil((v - EPS) / unit) * unit;
export interface TimberRun { plane: string; a: V3; b: V3; length: number }
export interface TimberTakeoff { rows: number; length: number; pieces: number; purchaseLength: number; runs: TimberRun[]; spacing: number }
export interface SheetCut { plane: string; length: number; count: number; reserve: boolean }
export interface CoveringTakeoff {
  theoretical: number;
  units: number;
  baseUnits: number;
  purchaseArea: number;
  physicalArea: number;
  overlapArea: number;
  cuttingWaste: number;
  reserveArea: number;
  billingQuantity: number;
  coveragePerUnit: number;
  sheetCuts: SheetCut[];
  hasEndJoints: boolean;
}
export interface MembraneTakeoff {
  netArea: number;
  width: number;
  rollLength: number;
  overlap: number;
  strips: number;
  linearUsed: number;
  rolls: number;
  purchaseArea: number;
  overlapArea: number;
  cuttingWaste: number;
  seamLength: number;
}
export interface Quantities {
  covering: CoveringTakeoff;
  battens: TimberTakeoff;
  counter: TimberTakeoff;
  membrane: MembraneTakeoff;
  downpipeRuns: number;
  downpipeLength: number;
  gutterPieces: number;
  gutterCorners: number;
  gutterEnds: number;
  gutterJoints: number;
  gutterHooks: number;
  structuralVolume: number;
}

/** Fixed product gauge; an additional row supports the top edge where needed. */
export function runPositions(extent: number, spacing: number) {
  if (spacing <= 0) return [];
  const positions: number[] = [];
  for (let n = 0; n * spacing < extent - EPS; n++) positions.push(n * spacing);
  if (!positions.length || extent - positions[positions.length - 1] > EPS) positions.push(extent);
  return positions;
}

export function timberTakeoff(geometry: RoofGeometry, spacing: number, stock: number, waste: number, counter = false): TimberTakeoff {
  const runs: TimberRun[] = [];
  let rows = 0;
  if (spacing > 0) for (const p of geometry.planes) {
    const extent = counter ? p.width : p.slopeLength;
    for (const position of runPositions(extent, spacing)) {
      const segments = planeRuns(p, counter ? 0 : 1, position);
      if (segments.length) rows++;
      for (const [start, end] of segments) {
        runs.push({ plane: p.id, a: counter ? worldPoint(p, position, start) : worldPoint(p, start, position),
          b: counter ? worldPoint(p, position, end) : worldPoint(p, end, position), length: end - start });
      }
    }
  }
  const length = runs.reduce((s, r) => s + r.length, 0);
  const pieces = up(length * (1 + waste) / stock);
  return { rows, runs, length, pieces, purchaseLength: pieces * stock, spacing };
}

function sheetPlanner(geometry: RoofGeometry, product: RoofProduct, waste: number): CoveringTakeoff {
  const cuts: SheetCut[] = [];
  let baseUnits = 0, lengthSum = 0, overlapArea = 0, hasEndJoints = false;
  for (const p of geometry.planes) {
    for (let u = 0; u < p.width - EPS; u += product.effectiveWidth) {
      const band = clipBand(p.polygon, 0, u, u + product.effectiveWidth);
      if (polygonArea(band) < EPS) continue;
      const min = Math.min(...band.map(v => v[1])), max = Math.max(...band.map(v => v[1]));
      const span = max - min;
      const count = Math.max(1, up((span - product.endLap) / (product.maxLength - product.endLap)));
      const length = up(Math.max(product.minLength, (span + (count - 1) * product.endLap) / count), .01);
      cuts.push({ plane: p.id, length, count, reserve: false });
      baseUnits += count; lengthSum += count * length;
      overlapArea += (count - 1) * product.endLap * product.effectiveWidth;
      if (count > 1) hasEndJoints = true;
    }
  }
  const baseEffective = lengthSum * product.effectiveWidth;
  const cuttingWaste = Math.max(0, baseEffective - overlapArea - geometry.netArea);
  const reserveCount = waste > 0 ? up(baseUnits * waste) : 0;
  const longest = Math.max(...cuts.map(c => c.length), 0);
  if (reserveCount) cuts.push({ plane: 'reserve', length: longest, count: reserveCount, reserve: true });
  const reserveArea = reserveCount * longest * product.effectiveWidth;
  const totalLength = lengthSum + reserveCount * longest;
  const physicalArea = totalLength * product.physicalWidth;
  overlapArea += totalLength * (product.physicalWidth - product.effectiveWidth);
  const grouped = new Map<string, SheetCut>();
  for (const cut of cuts) {
    const key = `${cut.plane}-${cut.length}-${cut.reserve}`;
    const existing = grouped.get(key);
    if (existing) existing.count += cut.count; else grouped.set(key, { ...cut });
  }
  return { theoretical: geometry.netArea, baseUnits, units: baseUnits + reserveCount,
    purchaseArea: baseEffective + reserveArea, physicalArea, overlapArea, cuttingWaste, reserveArea,
    billingQuantity: product.system === 'seam' ? baseEffective + reserveArea : physicalArea,
    coveragePerUnit: 0, sheetCuts: [...grouped.values()], hasEndJoints };
}

function moduleCount(p: RoofPlane, width: number, length: number) {
  let count = 0;
  for (let v = 0; v < p.slopeLength - EPS; v += length) {
    const row = clipBand(p.polygon, 1, v, v + length);
    if (!row.length) continue;
    for (let u = 0; u < p.width - EPS; u += width) {
      const cell = clipBand(row, 0, u, u + width);
      if (polygonArea(cell) > EPS) count++;
    }
  }
  return count;
}

export function coveringTakeoff(g: RoofGeometry, p: RoofProduct, c: RoofConfig): CoveringTakeoff {
  if (p.kind === 'sheet') return sheetPlanner(g, p, c.coveringWaste);
  const gauge = c.battenSpacing ?? p.battenSpacing;
  const coverage = p.kind === 'shingle' ? p.packageCoverage! : p.effectiveWidth * (p.kind === 'tile' ? gauge : p.effectiveLength);
  const theoretical = g.netArea / coverage;
  const baseUnits = p.kind === 'module' ? g.planes.reduce((s, plane) => s + moduleCount(plane, p.effectiveWidth, p.effectiveLength), 0)
    : up(theoretical, p.packageSize);
  const units = up(baseUnits * (1 + c.coveringWaste), p.packageSize);
  const purchaseArea = units * coverage;
  const physicalArea = p.kind === 'shingle' ? units * 14 * p.physicalWidth * p.physicalLength : units * p.physicalWidth * p.physicalLength;
  return { theoretical, baseUnits, units, purchaseArea, physicalArea,
    overlapArea: Math.max(0, physicalArea - purchaseArea), cuttingWaste: Math.max(0, baseUnits * coverage - g.netArea),
    reserveArea: (units - baseUnits) * coverage, billingQuantity: units, coveragePerUnit: coverage, sheetCuts: [], hasEndJoints: false };
}

/** Strip takeoff: actual clipped polygons, full-width roll cuts, overlap once. */
export function membraneTakeoff(g: RoofGeometry, c: RoofConfig, shingle = false): MembraneTakeoff {
  const width = shingle ? 1 : 1.5, rollLength = shingle ? 30 : 50;
  const overlap = shingle ? (Math.min(...g.planes.map(p => p.pitch)) < 21 ? .55 : .1) : c.membraneOverlap;
  let linearUsed = 0, coveredWithLaps = 0, strips = 0, seamLength = 0;
  for (const p of g.planes) {
    const count = Math.max(1, up((p.slopeLength - overlap) / (width - overlap)));
    for (let i = 0; i < count; i++) {
      const v = i * (width - overlap);
      const band = clipBand(p.polygon, 1, v, v + width);
      if (!band.length || polygonArea(band) < EPS) continue;
      const len = Math.max(...band.map(p => p[0])) - Math.min(...band.map(p => p[0]));
      // Roof bounds fit the roll length; 0.2 m end-lap if a future model exceeds it.
      const joints = Math.max(0, up(len / rollLength) - 1);
      linearUsed += len + joints * .2;
      coveredWithLaps += polygonArea(band) + joints * .2 * width;
      if (i > 0) seamLength += len;
      seamLength += joints * width;
      strips++;
    }
  }
  const overlapArea = Math.max(0, coveredWithLaps - g.grossArea);
  const cuttingWaste = Math.max(0, linearUsed * width - coveredWithLaps);
  const rolls = up(linearUsed * (1 + c.membraneWaste) / rollLength);
  return { netArea: g.grossArea, width, rollLength, overlap, strips, linearUsed, rolls,
    purchaseArea: rolls * width * rollLength, overlapArea, cuttingWaste, seamLength };
}

export function calculateQuantities(g: RoofGeometry, p: RoofProduct, c: RoofConfig): Quantities {
  const shingle = p.kind === 'shingle';
  const battens = timberTakeoff(g, shingle ? 0 : c.battenSpacing ?? p.battenSpacing, c.timberLength, c.timberWaste);
  const counter = timberTakeoff(g, shingle ? 0 : c.rafterSpacing, c.timberLength, c.timberWaste, true);
  const structureRuns = shingle ? timberTakeoff(g, c.rafterSpacing, c.timberLength, c.timberWaste, true) : counter;
  const eaves = g.edges.filter(e => e.kind === 'eave');
  const endpoints = new Map<string, number>();
  for (const e of eaves) for (const p of [e.a, e.b]) {
    const key = p.map(n => n.toFixed(5)).join(','); endpoints.set(key, (endpoints.get(key) || 0) + 1);
  }
  const gutterCorners = [...endpoints.values()].filter(n => n > 1).length;
  const gutterEnds = [...endpoints.values()].filter(n => n === 1).length;
  const gutterPieces = eaves.reduce((s, e) => s + up(e.length / 4), 0);
  const downpipeRuns = eaves.reduce((s, e) => s + Math.max(1, up(e.length / 10)), 0);
  const eaveHeight = eaves.length ? eaves[0].a[1] : c.height;
  const downpipeLength = downpipeRuns * (Math.max(1, eaveHeight) + .3);
  const structuralVolume = up((structureRuns.length * .08 * .2 + (g.ridge + g.hips + g.valleys + 2 * (c.length + c.width)) * .14 * .14) * (1 + c.timberWaste), .01);
  return { covering: coveringTakeoff(g, p, c), battens, counter, membrane: membraneTakeoff(g, c, shingle),
    downpipeRuns, downpipeLength, gutterPieces, gutterCorners, gutterEnds,
    gutterJoints: Math.max(0, gutterPieces - eaves.length) + 2 * gutterCorners,
    gutterHooks: eaves.reduce((s, e) => s + up(e.length / .6) + 1, 0), structuralVolume };
}
