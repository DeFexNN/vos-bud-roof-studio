'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { instagramUrl, projects } from '@/data/projects';
import BeforeAfter from './BeforeAfter';
import { ProjectPhoto } from './ui';

export default function ProjectLightbox({ index, locale, onClose, onNavigate }: { index: number; locale: Locale; onClose: () => void; onNavigate: (index: number) => void }) {
  const dialog = useRef<HTMLDialogElement>(null), d = messages[locale], project = projects[index];
  const [mode, setMode] = useState<'compare' | 'before' | 'after' | 'collage'>('compare'), [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    const element = dialog.current, oldOverflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = oldOverflow; };
  }, []);
  useEffect(() => { setZoomed(false); setMode('compare'); }, [index]);
  return <dialog ref={dialog} className="project-lightbox" aria-label={`${d.gallery}: ${project.title[locale]}`} onCancel={onClose}
    onKeyDown={e => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') onNavigate((index + 1) % projects.length);
      if (e.key === 'ArrowLeft') onNavigate((index + projects.length - 1) % projects.length);
    }}>
    <div className="lightbox-top"><span className="mono">V.O.S_BUD / {project.number} — 10</span><button className="icon-button" onClick={onClose} aria-label={d.close} autoFocus><X size={23} /></button></div>
    <div className="lightbox-view-tabs">{(['compare', 'before', 'after'] as const).map(m => <button key={m} aria-pressed={mode === m} className={mode === m ? 'active' : ''} onClick={() => { setMode(m); setZoomed(false); }}>{m === 'compare' ? d.compareImages : d[m]}</button>)}{index === 0 && <button aria-pressed={mode === 'collage'} onClick={() => setMode('collage')}>{d.collage}</button>}</div>
    <div className={`lightbox-stage ${zoomed ? 'zoomed' : ''}`}>
      {mode === 'compare' ? <BeforeAfter full priority project={project} locale={locale} /> : <ProjectPhoto number={project.number} phase={mode} alt={mode === 'before' ? project.beforeAlt[locale] : project.afterAlt[locale]} priority sizes="100vw" />}
      {mode !== 'compare' && <button className="lightbox-zoom icon-button" aria-label={d.zoom} aria-pressed={zoomed} onClick={() => setZoomed(!zoomed)}>{zoomed ? <ZoomOut /> : <ZoomIn />}</button>}
    </div>
    <div className="lightbox-bottom"><button className="icon-button" onClick={() => onNavigate((index + projects.length - 1) % projects.length)} aria-label={d.previousProject}><ArrowLeft /></button><div><h2>{project.title[locale]}</h2><p>{d.photoNote}</p></div><a href={instagramUrl(project)} target="_blank" rel="noreferrer" className="text-link">Instagram<ArrowUpRight size={17} /></a><button className="icon-button" onClick={() => onNavigate((index + 1) % projects.length)} aria-label={d.nextProject}><ArrowRight /></button></div>
  </dialog>;
}
