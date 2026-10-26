'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { ChevronsLeftRight, Maximize2 } from 'lucide-react';
import { messages } from '@/i18n/messages';
import type { Locale } from '@/i18n/types';
import type { Project } from '@/data/projects';
import { ProjectPhoto } from './ui';

export default function BeforeAfter({ project, locale, onExpand, full = false, priority = false }: {
  project: Project; locale: Locale; onExpand?: () => void; full?: boolean; priority?: boolean;
}) {
  const d = messages[locale], [position, setPosition] = useState(47), root = useRef<HTMLDivElement>(null);
  const positionFromPointer = (event: PointerEvent<HTMLInputElement>) => {
    const box = root.current?.getBoundingClientRect();
    if (box) setPosition(Math.max(0, Math.min(100, Math.round((event.clientX - box.left) / box.width * 100))));
  };
  return <div className={`comparison ${full ? 'comparison-full' : ''}`} ref={root} data-position={position}>
    <div className="comparison-image"><ProjectPhoto number={project.number} alt={project.afterAlt[locale]} position={project.position} priority={priority} sizes={full ? '100vw' : undefined} /></div>
    <div className="comparison-image before-image" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}><ProjectPhoto number={project.number} phase="before" alt={project.beforeAlt[locale]} position={project.position} priority={priority} sizes={full ? '100vw' : undefined} /></div>
    <div className="comparison-labels" aria-hidden="true"><span>{d.before}</span><span>{d.after}</span></div>
    <div className="comparison-line" style={{ left: `${position}%` }}><span><ChevronsLeftRight size={23} strokeWidth={1.4} /></span></div>
    <input className="comparison-input" type="range" min={0} max={100} step={1} value={position}
      onChange={e => setPosition(Number(e.target.value))} aria-label={`${d.compareImages}: ${project.title[locale]}`}
      aria-valuetext={`${position}% ${d.before}, ${100 - position}% ${d.after}`}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.focus(); positionFromPointer(e); }}
      onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) positionFromPointer(e); }}
      onPointerUp={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }} />
    {onExpand && <button className="comparison-expand" onClick={onExpand} aria-label={`${d.fullPhoto}: ${project.title[locale]}`}><Maximize2 size={18} /></button>}
    <span className="comparison-id mono">V / {project.number}</span>
  </div>;
}
