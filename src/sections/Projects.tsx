'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2 } from 'lucide-react';
import { projects, instagramUrl } from '@/data/projects';
import type { Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { href } from '@/lib/site';
import { Eyebrow, PageIntro, ProjectPhoto, SectionHeading, TextLink, Reveal } from '@/components/ui';
import BeforeAfter from '@/components/BeforeAfter';
const Lightbox = dynamic(() => import('@/components/ProjectLightbox'), { ssr: false });

export function FeaturedProjects({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState(5), [lightbox, setLightbox] = useState<number | null>(null);
  const d = messages[locale], p = projects[selected];
  return <section className="section container featured-projects" id="projects"><SectionHeading label={d.projectLabel} title={d.projectTitle} intro={d.projectIntro}><TextLink locale={locale} page="projects">{d.allProjects}</TextLink></SectionHeading>
    <div className="featured-editorial"><div className="featured-comparison"><BeforeAfter project={p} locale={locale} onExpand={() => setLightbox(selected)} /><div className="comparison-footnote"><span>{d.compareHint}</span><span>{d.photoCredit}</span></div></div><div className="featured-story" key={p.id}><span className="project-number">{p.number}<small>/ 10</small></span><div><span className="mono">{d.projectScope}</span><h3>{p.title[locale]}</h3><p>{p.description[locale]}</p><span className="material-tag">{p.material[locale]}</span><Link className="text-link" href={href(locale, 'projects', p.id)}>{d.viewCase}<ArrowUpRight size={18} /></Link></div><div className="project-switch"><button className="icon-button" onClick={() => setSelected((selected + projects.length - 1) % projects.length)} aria-label={d.previousProject}><ArrowLeft size={20} /></button><div className="project-progress"><i style={{ width: `${(selected + 1) / 10 * 100}%` }} /></div><button className="icon-button" onClick={() => setSelected((selected + 1) % projects.length)} aria-label={d.nextProject}><ArrowRight size={20} /></button></div></div></div>
    <div className="project-peeks">{[projects[1], projects[2], projects[9]].map(project => <Link key={project.id} className="project-peek" href={href(locale, 'projects', project.id)}><div><ProjectPhoto number={project.number} alt={project.afterAlt[locale]} position={project.position} sizes="(max-width: 700px) 75vw, 28vw" /><span className="mono">{project.number}</span><ArrowUpRight size={21} /></div><h3>{project.title[locale]}</h3><p>{project.material[locale]}</p></Link>)}</div>
    {lightbox !== null && <Lightbox locale={locale} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />}
  </section>;
}

export function ProjectsIndex({ locale }: { locale: Locale }) {
  const d = messages[locale], [filter, setFilter] = useState('all'), [lightbox, setLightbox] = useState<number | null>(null);
  const filtered = projects.filter(p => filter === 'all' || p.category === filter);
  return <><PageIntro label={d.projectLabel} title={d.projectIndexTitle} body={d.projectIndexBody} />
    <section className="container portfolio"><div className="portfolio-filter">{(['all', 'renovation', 'rebuilding', 'detail'] as const).map(category => <button key={category} className={filter === category ? 'active' : ''} aria-pressed={filter === category} onClick={() => setFilter(category)}>{d[category]}<sup>{category === 'all' ? 10 : projects.filter(p => p.category === category).length}</sup></button>)}</div><div className="portfolio-grid">{filtered.map((p, i) => <article key={p.id} className={i % 4 === 1 || i % 4 === 2 ? 'offset' : ''}>
      <BeforeAfter project={p} locale={locale} onExpand={() => setLightbox(projects.indexOf(p))} />
      <div className="portfolio-caption"><Link href={href(locale, 'projects', p.id)}><span className="mono">V / {p.number}</span><h2>{p.title[locale]}</h2><span>{p.material[locale]}</span></Link><Link className="icon-button" href={href(locale, 'projects', p.id)} aria-label={`${d.viewCase}: ${p.title[locale]}`}><ArrowUpRight size={22} /></Link></div>
    </article>)}</div><p className="portfolio-note">{d.photoNote} {d.productScope}</p></section>
    {lightbox !== null && <Lightbox locale={locale} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />}
  </>;
}

export function ProjectDetail({ locale, projectId }: { locale: Locale; projectId: string }) {
  const d = messages[locale], index = projects.findIndex(p => p.id === projectId), p = projects[index], next = projects[(index + 1) % projects.length];
  const [lightbox, setLightbox] = useState<number | null>(null);
  return <><section className="project-detail-intro container"><Link className="back-link" href={href(locale, 'projects')}><ArrowLeft size={17} />{d.backProjects}</Link><Eyebrow>{d.photoCredit} / {p.number}</Eyebrow><h1>{p.title[locale]}</h1><div className="project-detail-meta"><p>{p.subtitle[locale]}</p><span>{p.material[locale]}</span><a className="text-link" href={instagramUrl(p)} target="_blank" rel="noreferrer">{d.originalPost}<ArrowUpRight size={17} /></a></div></section>
    <div className="project-detail-comparison container"><BeforeAfter project={p} locale={locale} priority onExpand={() => setLightbox(index)} /><p>{d.photoNote}</p></div>
    <section className="section container project-story"><div><Eyebrow>{d.projectScope}</Eyebrow><h2>{p.subtitle[locale]}</h2></div><div><p>{p.description[locale]}</p>{p.areaNote && <p className="project-area-note">{p.areaNote[locale]}</p>}<div className="scope-list">{p.scope.map((s, i) => <div key={i}><span className="mono">0{i + 1}</span><span>{s[locale]}</span><ArrowUpRight size={17} /></div>)}</div><p className="small-note">{d.productScope}</p></div></section>
    <section className="container project-detail-gallery"><Eyebrow>{d.gallery}</Eyebrow><div>{(['before', 'after'] as const).map(phase => <figure key={phase}><button onClick={() => setLightbox(index)} aria-label={`${d.zoom}: ${d[phase]}`}><ProjectPhoto number={p.number} phase={phase} alt={phase === 'before' ? p.beforeAlt[locale] : p.afterAlt[locale]} position={p.position} /><Maximize2 size={20} /></button><figcaption>{phase === 'before' ? d.progressPhoto : d.after} / {p.number}</figcaption></figure>)}</div>{index === 0 && <figure className="original-collage"><ProjectPhoto number="01" phase="collage" alt={d.collage} /><figcaption>{d.collage}</figcaption></figure>}</section>
    <section className="section container next-project"><span className="mono">{d.nextProject} / {next.number}</span><Link href={href(locale, 'projects', next.id)}>{next.title[locale]}<ArrowUpRight size={46} strokeWidth={1} /></Link></section>
    {lightbox !== null && <Lightbox locale={locale} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />}
  </>;
}
