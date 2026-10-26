export type V3 = [number, number, number];
export type V2 = [number, number];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (v: V3, s: number): V3 => [v[0] * s, v[1] * s, v[2] * s];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const length = (v: V3) => Math.hypot(...v);
export const normalize = (v: V3) => mul(v, 1 / (length(v) || 1));
export const distance = (a: V3, b: V3) => length(sub(a, b));
export const EPS = 1e-8;

export function polygonArea(poly: V2[]) {
  return Math.abs(poly.reduce((s, p, i) => {
    const q = poly[(i + 1) % poly.length];
    return s + p[0] * q[1] - q[0] * p[1];
  }, 0)) / 2;
}

/** Sutherland–Hodgman clipping against one axis-aligned half-plane. */
export function clip(poly: V2[], axis: 0 | 1, bound: number, above: boolean): V2[] {
  const out: V2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const insideA = above ? a[axis] >= bound - EPS : a[axis] <= bound + EPS;
    const insideB = above ? b[axis] >= bound - EPS : b[axis] <= bound + EPS;
    if (insideA) out.push(a);
    if (insideA !== insideB) {
      const t = (bound - a[axis]) / (b[axis] - a[axis]);
      out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return out;
}
export const clipBand = (poly: V2[], axis: 0 | 1, min: number, max: number) => clip(clip(poly, axis, min, true), axis, max, false);

export function insidePolygon(point: V2, poly: V2[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const cross = (point[0] - a[0]) * dy - (point[1] - a[1]) * dx;
    if (Math.abs(cross) < EPS && point[0] >= Math.min(a[0], b[0]) - EPS && point[0] <= Math.max(a[0], b[0]) + EPS
      && point[1] >= Math.min(a[1], b[1]) - EPS && point[1] <= Math.max(a[1], b[1]) + EPS) return true;
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

/** Intersections of a convex plane and a line; handles a coincident boundary. */
export function scanLine(poly: V2[], axis: 0 | 1, value: number): [number, number][] {
  const values: number[] = [], other = (1 - axis) as 0 | 1;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if (Math.abs(a[axis] - value) < EPS) values.push(a[other]);
    if ((a[axis] < value && b[axis] > value) || (b[axis] < value && a[axis] > value)) {
      values.push(a[other] + (b[other] - a[other]) * (value - a[axis]) / (b[axis] - a[axis]));
    }
  }
  if (values.length < 2) return [];
  const min = Math.min(...values), max = Math.max(...values);
  return max - min > EPS ? [[min, max]] : [];
}

export function subtractInterval(segments: [number, number][], cut: [number, number]) {
  return segments.flatMap(([a, b]): [number, number][] => {
    if (cut[1] <= a || cut[0] >= b) return [[a, b]];
    return [...(cut[0] > a ? [[a, cut[0]] as [number, number]] : []), ...(cut[1] < b ? [[cut[1], b] as [number, number]] : [])];
  });
}
