'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Maximize2, Plus } from 'lucide-react';
import { projects, instagramUrl } from '@/data/projects';
import type { Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { href } from '@/lib/site';
import { Eyebrow, PageIntro, ProjectPhoto, SectionHeading, TextLink } from '@/components/ui';
import BeforeAfter from '@/components/BeforeAfter';
const Lightbox = dynamic(() => import('@/components/ProjectLightbox'), { ssr: false });

export function FeaturedProjects({ locale }: { locale: Locale }) {
  const d = messages[locale];
  return <section className="section container featured-projects" id="projects"><SectionHeading label={d.projectLabel} title={d.projectTitle} intro={d.projectIntro}><TextLink locale={locale} page="projects">{d.allProjects}</TextLink></SectionHeading>
    <div className="selected-projects">{[projects[1], projects[2]].map((p, i) => <article key={p.id} className={i === 0 ? 'selected-project-wide' : 'selected-project-close'}><Link className="selected-project-photo" href={href(locale, 'projects', p.id)} aria-label={`${d.newCovering} — ${d.viewCase}: ${p.title[locale]}`}><ProjectPhoto number={p.number} alt={p.afterAlt[locale]} position={p.previewPosition} sizes="(max-width: 760px) 100vw, 60vw" /><span className="photo-stage-label">{d.newCovering}</span><span className="photo-open"><ArrowUpRight size={22} /></span></Link><div className="selected-project-caption"><span className="mono">{p.number} / V.O.S_BUD</span><h3><Link href={href(locale, 'projects', p.id)}>{p.title[locale]}</Link></h3><p>{p.material[locale]}</p></div></article>)}</div>
  </section>;
}

export function ProjectsIndex({ locale }: { locale: Locale }) {
  const d = messages[locale], [filter, setFilter] = useState('all'), [lightbox, setLightbox] = useState<number | null>(null);
  const filtered = [1, 2, 8, 5, 0, 7, 3, 4, 6, 9].map(i => projects[i]).filter(p => filter === 'all' || p.category === filter);
  return <><PageIntro label={d.projectLabel} title={d.projectIndexTitle} body={d.projectIndexBody} />
    <section className="container portfolio"><div className="portfolio-filter">{(['all', 'renovation', 'rebuilding', 'detail'] as const).map(category => <button key={category} className={filter === category ? 'active' : ''} aria-pressed={filter === category} onClick={() => setFilter(category)}>{d[category]}<sup>{category === 'all' ? 10 : projects.filter(p => p.category === category).length}</sup></button>)}</div><div className="portfolio-grid">{filtered.map(p => <article key={p.id} data-project-card={p.number}>
      <button className="project-preview" onClick={() => setLightbox(projects.indexOf(p))} aria-label={`${p.presentation === 'views' ? d.viewTwo : d.newCovering} — ${d.fullPhoto}: ${p.title[locale]}`}><ProjectPhoto number={p.number} alt={p.afterAlt[locale]} position={p.previewPosition} zoom={p.previewScale} sizes="(max-width: 760px) 100vw, 50vw" /><span className="photo-stage-label">{p.presentation === 'views' ? d.viewTwo : d.newCovering}</span><span className="photo-open"><Maximize2 size={20} /></span></button>
      <div className="portfolio-caption"><Link href={href(locale, 'projects', p.id)}><span className="mono">V / {p.number}</span><h2>{p.title[locale]}</h2><span>{p.material[locale]}</span></Link><Link className="icon-button" href={href(locale, 'projects', p.id)} aria-label={`${d.viewCase}: ${p.title[locale]}`}><ArrowUpRight size={22} /></Link></div>
      <details className="project-evidence"><summary>{p.presentation === 'views' ? d.projectViewEvidence : d.projectEvidence}<Plus size={18} /></summary><BeforeAfter project={p} locale={locale} onExpand={() => setLightbox(projects.indexOf(p))} /></details>
    </article>)}</div><p className="portfolio-note">{d.photoNote} {d.productScope}</p></section>
    {lightbox !== null && <Lightbox locale={locale} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />}
  </>;
}

export function ProjectDetail({ locale, projectId }: { locale: Locale; projectId: string }) {
  const d = messages[locale], index = projects.findIndex(p => p.id === projectId), p = projects[index], next = projects[(index + 1) % projects.length];
  const [lightbox, setLightbox] = useState<number | null>(null);
  return <><section className="project-detail-intro container"><Link className="back-link" href={href(locale, 'projects')}><ArrowLeft size={17} />{d.backProjects}</Link><Eyebrow>{d.photoCredit} / {p.number}</Eyebrow><h1>{p.title[locale]}</h1><div className="project-detail-meta"><p>{p.subtitle[locale]}</p><span>{p.material[locale]}</span><a className="text-link" href={instagramUrl(p)} target="_blank" rel="noreferrer">{d.originalPost}<ArrowUpRight size={17} /></a></div></section>
    <div className="project-detail-comparison container"><BeforeAfter project={p} locale={locale} priority onExpand={() => setLightbox(index)} /><p>{p.presentation === 'views' ? d.viewsNote : d.sequenceNote}</p></div>
    <section className="section container project-story"><div><Eyebrow>{d.projectScope}</Eyebrow><h2>{p.subtitle[locale]}</h2></div><div><p>{p.description[locale]}</p>{p.areaNote && <p className="project-area-note">{p.areaNote[locale]}</p>}<div className="scope-list">{p.scope.map((s, i) => <div key={i}><span className="mono">0{i + 1}</span><span>{s[locale]}</span><ArrowUpRight size={17} /></div>)}</div><p className="small-note">{d.productScope}</p></div></section>
    <section className="container project-detail-gallery"><Eyebrow>{d.gallery}</Eyebrow><div>{(['before', 'after'] as const).map(phase => <figure key={phase}><button onClick={() => setLightbox(index)} aria-label={`${d.zoom}: ${p.presentation === 'views' ? (phase === 'before' ? d.viewOne : d.viewTwo) : d[phase]}`}><ProjectPhoto number={p.number} phase={phase} alt={phase === 'before' ? p.beforeAlt[locale] : p.afterAlt[locale]} position={p.position} /><Maximize2 size={20} /></button><figcaption>{p.presentation === 'views' ? (phase === 'before' ? d.viewOne : d.viewTwo) : phase === 'before' ? d.progressPhoto : d.after} / {p.number}</figcaption></figure>)}</div>{index === 0 && <figure className="original-collage"><ProjectPhoto number="01" phase="collage" alt={d.collage} /><figcaption>{d.collage}</figcaption></figure>}</section>
    <section className="section container next-project"><span className="mono">{d.nextProject} / {next.number}</span><Link href={href(locale, 'projects', next.id)}>{next.title[locale]}<ArrowUpRight size={46} strokeWidth={1} /></Link></section>
    {lightbox !== null && <Lightbox locale={locale} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />}
  </>;
}
