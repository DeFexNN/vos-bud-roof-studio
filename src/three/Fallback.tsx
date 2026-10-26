'use client';

import { useId } from 'react';
import { colors } from '@/data/materials';
import type { RoofConfig } from '@/configurator/model';
import type { RoofGeometry } from '@/calculators/geometry/roof';
import type { V3 } from '@/calculators/geometry/vector';

export default function RoofFallback({ config, geometry }: { config: RoofConfig; geometry: RoofGeometry }) {
  const id = useId(), color = colors.find(c => c.id === config.color)?.hex || '#3c4642';
  const project = ([x, y, z]: V3): [number, number] => [x - z * .65, -y + z * .28 + x * .22];
  const all = geometry.planes.flatMap(p => p.vertices.map(project));
  const footprint: V3[] = [[-config.length / 2, 0, -config.width / 2], [config.length / 2, 0, -config.width / 2], [config.length / 2, 0, config.width / 2], [-config.length / 2, 0, config.width / 2]];
  const roof = geometry.planes.map(p => p.vertices.map(project));
  const raw = [...all, ...footprint.map(project)], minX = Math.min(...raw.map(p => p[0])), minY = Math.min(...raw.map(p => p[1]));
  const width = Math.max(...raw.map(p => p[0])) - minX, height = Math.max(...raw.map(p => p[1])) - minY;
  const scale = Math.min(680 / width, 390 / height);
  const points = (ps: [number, number][]) => ps.map(([x, y]) => `${(x - minX) * scale + (800 - width * scale) / 2},${(y - minY) * scale + 50}`).join(' ');
  const wall = footprint.map(([x, , z]): V3 => [x, config.height, z]);
  return <svg className="roof-fallback" viewBox="0 0 800 500" aria-hidden="true">
    <defs><pattern id={`${id}-lines`} patternUnits="userSpaceOnUse" width="13" height="18" patternTransform="rotate(-22)"><rect width="13" height="18" fill={color} /><path d="M0 0V18" stroke="#89938b" strokeWidth="1" /></pattern></defs>
    <ellipse cx="420" cy="450" rx="300" ry="17" fill="#0f1d16" opacity=".15" />
    {[1, 2].map(i => <polygon key={i} points={points([project(footprint[i]), project(footprint[(i + 1) % 4]), project(wall[(i + 1) % 4]), project(wall[i])])} fill={i === 1 ? '#b8b9aa' : '#dad9c9'} stroke="#798579" strokeWidth="1" />)}
    {roof.map((p, i) => <polygon key={i} points={points(p)} fill={`url(#${id}-lines)`} stroke="#9aa796" strokeWidth="1.5" />)}
    <text x="35" y="475" fill="#a3ae9b" fontFamily="monospace" fontSize="12">{config.length} × {config.width} m / {config.pitch}° / {geometry.grossArea.toFixed(1)} m²</text>
  </svg>;
}
