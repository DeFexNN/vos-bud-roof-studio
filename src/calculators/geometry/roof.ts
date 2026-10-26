import type { RoofConfig } from '@/configurator/model';
import { add, cross, distance, dot, EPS, insidePolygon, mul, normalize, polygonArea, scanLine, sub, subtractInterval, type V2, type V3 } from './vector';

export interface Opening {
  id: string;
  kind: 'window' | 'chimney';
  u: number;
  v: number;
  width: number;
  height: number;
}
export interface RoofPlane {
  id: string;
  vertices: V3[];
  polygon: V2[];
  origin: V3;
  u: V3;
  v: V3;
  normal: V3;
  width: number;
  slopeLength: number;
  pitch: number;
  area: number;
  openings: Opening[];
}
export interface RoofEdge { kind: 'ridge' | 'hip' | 'valley' | 'eave' | 'barge' | 'high'; a: V3; b: V3; length: number }
export interface RoofGeometry {
  planes: RoofPlane[];
  edges: RoofEdge[];
  footprint: number;
  projectedArea: number;
  grossArea: number;
  openingArea: number;
  netArea: number;
  ridge: number;
  hips: number;
  valleys: number;
  eaves: number;
  barges: number;
  maxHeight: number;
  unplacedOpenings: number;
  bounds: { x: number; z: number };
}

function makePlane(id: string, raw: V3[]): RoofPlane {
  let vertices = raw.filter((p, i) => !raw.slice(0, i).some(q => distance(p, q) < EPS));
  let normal = normalize(cross(sub(vertices[1], vertices[0]), sub(vertices[2], vertices[0])));
  if (normal[1] < 0) { vertices = [...vertices].reverse(); normal = mul(normal, -1); }
  const gradient: V3 = [-normal[0] / normal[1], 0, -normal[2] / normal[1]];
  const horizontal = normalize(gradient);
  const u: V3 = [-horizontal[2], 0, horizontal[0]];
  const v = normalize(cross(normal, u));
  const us = vertices.map(p => dot(p, u)), vs = vertices.map(p => dot(p, v));
  const minU = Math.min(...us), minV = Math.min(...vs);
  const origin = add(add(mul(u, minU), mul(v, minV)), mul(normal, dot(vertices[0], normal)));
  const polygon: V2[] = vertices.map(p => [dot(p, u) - minU, dot(p, v) - minV]);
  return { id, vertices, polygon, origin, u, v, normal, width: Math.max(...us) - minU,
    slopeLength: Math.max(...vs) - minV, pitch: Math.acos(Math.min(1, normal[1])) * 180 / Math.PI,
    area: polygonArea(polygon), openings: [] };
}

export const worldPoint = (p: RoofPlane, u: number, v: number, lift = 0): V3 => add(add(add(p.origin, mul(p.u, u)), mul(p.v, v)), mul(p.normal, lift));
export const openingPolygon = (o: Opening): V2[] => [[o.u, o.v], [o.u + o.width, o.v], [o.u + o.width, o.v + o.height], [o.u, o.v + o.height]];

export function planeRuns(plane: RoofPlane, axis: 0 | 1, at: number, deductOpenings = true) {
  let segments = scanLine(plane.polygon, axis, at);
  if (deductOpenings) for (const o of plane.openings) {
    const lo = axis === 0 ? o.u : o.v, hi = lo + (axis === 0 ? o.width : o.height);
    if (at > lo && at < hi) segments = subtractInterval(segments, axis === 0 ? [o.v, o.v + o.height] : [o.u, o.u + o.width]);
  }
  return segments;
}

/** All render and procurement geometry originates here. Unit = meter. */
export function buildRoof(config: RoofConfig): RoofGeometry {
  const { length: L, width: W, overhang: o, height: H, pitch, type } = config;
  if (![L, W, H, pitch, o].every(Number.isFinite) || L <= 0 || W <= 0 || H <= 0 || pitch <= 0 || pitch >= 85 || o < 0) throw new RangeError('geometry');
  const a = L / 2 + o, b = W / 2 + o, t = Math.tan(pitch * Math.PI / 180), y = H - o * t;
  const planes: RoofPlane[] = [], edges: RoofEdge[] = [];
  const edge = (kind: RoofEdge['kind'], p: V3, q: V3) => { const len = distance(p, q); if (len > EPS) edges.push({ kind, a: p, b: q, length: len }); };
  const plane = (id: string, p: V3[]) => planes.push(makePlane(id, p));
  let projectedArea = 4 * a * b, footprint = L * W;
  if (type === 'mono') {
    const A: V3 = [-a, y, -b], B: V3 = [a, y, -b], C: V3 = [a, y + 2 * b * t, b], D: V3 = [-a, y + 2 * b * t, b];
    plane('M1', [A, B, C, D]); edge('eave', A, B); edge('high', D, C); edge('barge', A, D); edge('barge', B, C);
  } else if (type === 'hip') {
    const rotate = W > L, long = Math.max(L, W) / 2 + o, short = Math.min(L, W) / 2 + o;
    const r = config.ridgeLength === null ? 2 * (long - short) : config.ridgeLength;
    if (!Number.isFinite(r) || r < 0 || r >= 2 * long - .1) throw new RangeError('ridge');
    const p = (x: number, z: number, h = y): V3 => rotate ? [z, h, x] : [x, h, z];
    const A = p(-long, -short), B = p(long, -short), C = p(long, short), D = p(-long, short);
    const R1 = p(-r / 2, 0, y + short * t), R2 = p(r / 2, 0, y + short * t);
    plane('H1', [A, B, R2, R1]); plane('H2', [D, R1, R2, C]);
    plane('H3', [B, C, R2]); plane('H4', [A, R1, D]);
    [[A, B], [B, C], [C, D], [D, A]].forEach(([p1, p2]) => edge('eave', p1, p2));
    [[A, R1], [D, R1], [B, R2], [C, R2]].forEach(([p1, p2]) => edge('hip', p1, p2));
    edge('ridge', R1, R2);
  } else {
    const A: V3 = [-a, y, -b], B: V3 = [a, y, -b], C: V3 = [a, y, b], D: V3 = [-a, y, b];
    const R1: V3 = [-a, y + b * t, 0], R2: V3 = [a, y + b * t, 0];
    plane('G1', [A, B, R2, R1]); edge('ridge', R1, R2); edge('eave', A, B);
    [[A, R1], [B, R2], [R1, D], [R2, C]].forEach(([p1, p2]) => edge('barge', p1, p2));
    if (type === 'gable') { plane('G2', [D, R1, R2, C]); edge('eave', D, C); }
    else if (type === 'multi') {
      const c = config.wingWidth / 2 + o, extension = config.wingLength;
      if (!Number.isFinite(c) || !Number.isFinite(extension) || c >= Math.min(a, b) - .05 || c <= 0 || extension <= 0) throw new RangeError('wing');
      const R0: V3 = [0, y + b * t, 0], V: V3 = [0, y + c * t, b - c];
      const EL: V3 = [-c, y, b], ER: V3 = [c, y, b];
      const FL: V3 = [-c, y, b + extension], FR: V3 = [c, y, b + extension], RF: V3 = [0, y + c * t, b + extension];
      plane('T2', [D, R1, R0, V, EL]); plane('T3', [ER, V, R0, R2, C]);
      plane('T4', [FL, EL, V, RF]); plane('T5', [V, ER, FR, RF]);
      edge('valley', V, EL); edge('valley', V, ER); edge('ridge', V, RF);
      [[D, EL], [ER, C], [EL, FL], [ER, FR]].forEach(([p1, p2]) => edge('eave', p1, p2));
      edge('barge', FL, RF); edge('barge', RF, FR);
      footprint += config.wingWidth * extension; projectedArea += 2 * c * extension;
    } else throw new RangeError('type');
  }

  // Openings are real holes in local plane coordinates, packed with an edge margin.
  let unplacedOpenings = 0;
  const candidates = [...planes].sort((p, q) => {
    const frontP = p.normal[2] > 0 ? 1 : 0, frontQ = q.normal[2] > 0 ? 1 : 0;
    return frontQ - frontP || q.area - p.area;
  });
  const kinds = [...Array.from({ length: config.windows }, () => 'window' as const), ...Array.from({ length: config.chimneys }, () => 'chimney' as const)];
  kinds.forEach((kind, i) => {
    let placed = false;
    for (const p of candidates) {
      const width = kind === 'window' ? .78 : .7, height = kind === 'window' ? 1.18 : .7 / p.normal[1];
      for (const fv of [.44, .67, .24]) {
        for (const fu of [.35, .65, .18, .82, .5]) {
          const u = p.width * fu - width / 2, v = p.slopeLength * fv - height / 2;
          const margin = .18;
          const bounds: V2[] = [[u - margin, v - margin], [u + width + margin, v - margin], [u + width + margin, v + height + margin], [u - margin, v + height + margin]];
          const overlaps = p.openings.some(q => u < q.u + q.width + .3 && u + width > q.u - .3 && v < q.v + q.height + .3 && v + height > q.v - .3);
          if (!overlaps && bounds.every(pt => insidePolygon(pt, p.polygon))) {
            p.openings.push({ id: `${kind}-${i}`, kind, u, v, width, height }); placed = true; break;
          }
        }
        if (placed) break;
      }
      if (placed) break;
    }
    if (!placed) unplacedOpenings++;
  });
  const sum = (kind: RoofEdge['kind']) => edges.filter(e => e.kind === kind).reduce((n, e) => n + e.length, 0);
  const grossArea = planes.reduce((s, p) => s + p.area, 0);
  const openingArea = planes.reduce((s, p) => s + p.openings.reduce((n, a) => n + a.width * a.height, 0), 0);
  return { planes, edges, footprint, projectedArea, grossArea, openingArea, netArea: grossArea - openingArea,
    ridge: sum('ridge'), hips: sum('hip'), valleys: sum('valley'), eaves: sum('eave'), barges: sum('barge') + sum('high'),
    maxHeight: Math.max(...planes.flatMap(p => p.vertices.map(v => v[1]))), unplacedOpenings,
    bounds: { x: 2 * a, z: 2 * b + (type === 'multi' ? config.wingLength : 0) } };
}

/** The same analytic roof surface closes the building's gables in the renderer. */
export function roofHeightAt(config: RoofConfig, geometry: RoofGeometry, x: number, z: number) {
  const values = geometry.planes.flatMap(p => {
    const y = (dot(p.normal, p.vertices[0]) - p.normal[0] * x - p.normal[2] * z) / p.normal[1];
    const uv: V2 = [dot(sub([x, y, z], p.origin), p.u), dot(sub([x, y, z], p.origin), p.v)];
    return insidePolygon(uv, p.polygon) ? [y] : [];
  });
  return values.length ? Math.max(...values) : config.height;
}
