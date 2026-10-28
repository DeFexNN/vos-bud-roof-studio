'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { messages } from '@/i18n/messages';
import type { Locale } from '@/i18n/types';
import { services, process, values, faq } from '@/data/editorial';
import { projects } from '@/data/projects';
import { href } from '@/lib/site';
import { Accordion, ButtonLink, Eyebrow, PageIntro, ProjectPhoto, Reveal, SectionHeading, TextLink } from '@/components/ui';
import Viewer from '@/three/Viewer';
import { useRoof } from '@/configurator/State';
import { defaultConfig, type LayerId } from '@/configurator/model';
import { buildRoof } from '@/calculators/geometry/roof';
import { layerInfo, productById } from '@/data/materials';

export function Expertise({ locale, full = false }: { locale: Locale; full?: boolean }) {
  const d = messages[locale], [selected, setSelected] = useState(1);
  return <section className={`section container expertise ${full ? 'expertise-full' : ''}`} id="expertise"><div className="expertise-intro"><Eyebrow>{d.expertiseLabel}</Eyebrow><h2>{d.expertiseTitle}</h2><p>{d.expertiseBody}</p><TextLink locale={locale} page="services">{d.approach}</TextLink><div className="expertise-mark" aria-hidden="true"><svg width="184" height="110" viewBox="0 0 184 110" fill="none"><path d="M6 91L84 8L178 91M22 91L84 26L162 91M41 91L84 46L142 91M62 91L84 66L121 91M8 100H178" stroke="currentColor" strokeWidth="1" /><path d="M84 8V100M6 91H178" stroke="currentColor" strokeWidth=".5" strokeDasharray="3 5" /></svg><span className="mono">V / {d.precision}</span></div></div>
    <div className="expertise-work"><figure className="expertise-photo"><ProjectPhoto number="09" phase="before" alt={projects[8].beforeAlt[locale]} position="50% 30%" /><figcaption>{d.detailBefore} <span>09 / V.O.S_BUD</span></figcaption></figure><div className="service-accordion">{services.slice(0, full ? services.length : 3).map((s, i) => <div className={`service-item ${selected === i ? 'open' : ''}`} key={i}><button onClick={() => setSelected(selected === i ? -1 : i)} aria-expanded={selected === i} aria-controls={`service-content-${i}`}><span className="mono">0{i + 1}</span><h3>{s.title[locale]}</h3><Plus size={19} /></button>{selected === i && <div id={`service-content-${i}`}><p>{s.text[locale]}</p>{full && <TextLink locale={locale} page="contact">{d.talk}</TextLink>}</div>}</div>)}</div></div>
  </section>;
}

export function AnatomyFeature({ locale }: { locale: Locale }) {
  const { config, estimate } = useRoof(), d = messages[locale], [active, setActive] = useState<LayerId>('covering'), [explode, setExplode] = useState(1);
  const c = estimate.geometry ? config : defaultConfig, g = estimate.geometry || buildRoof(defaultConfig), product = productById(c.productId)!;
  const layers: LayerId[] = ['covering', ...(product.kind === 'shingle' ? [] : ['battens', 'counter'] as LayerId[]), 'membrane', ...(product.kind === 'shingle' || c.sheathing ? ['sheathing'] as LayerId[] : []), 'structure'];
  return <section className="anatomy-feature"><div className="container anatomy-grid"><div className="anatomy-copy"><Eyebrow>{d.anatomyLabel}</Eyebrow><h2>{d.anatomyTitle}</h2><p>{d.anatomyBody}</p><div className="anatomy-layer-links">{layers.map((id, i) => <button key={id} onClick={() => { setActive(id); setExplode(1); }} className={id === active ? 'active' : ''} aria-pressed={id === active}><span className="mono">0{i + 1}</span>{layerInfo[id].title[locale]}<ArrowUpRight size={17} /></button>)}</div><p className="anatomy-purpose" key={active}>{layerInfo[active].purpose[locale]}</p><ButtonLink locale={locale} page="studio" light>{d.openStudio}</ButtonLink></div><div className="anatomy-model"><Viewer config={c} geometry={g} locale={locale} hero={false} controls={false} exploded={explode} activeLayer={active} onLayer={setActive} /><div className="anatomy-model-top"><span className="mono">V / {d.systemExplorer}</span><Plus size={18} /></div><div className="anatomy-model-bottom"><span className="mono">{layerInfo[active].title[locale]}</span><button onClick={() => setExplode(explode ? 0 : 1)}>{explode ? d.assembled : d.exploded}<Plus size={16} /></button></div></div></div></section>;
}

export function Process({ locale }: { locale: Locale }) {
  const d = messages[locale];
  return <section className="section container process-section"><SectionHeading label={d.processLabel} title={d.processTitle} /><div className="process-grid">{process.map((step, i) => <Reveal key={i}><article><div className="process-number"><span>0{i + 1}</span><ArrowUpRight size={20} strokeWidth={1} /></div><h3>{step.title[locale]}</h3><p>{step.text[locale]}</p></article></Reveal>)}</div></section>;
}
export function Values({ locale }: { locale: Locale }) {
  const d = messages[locale];
  return <section className="values-section"><div className="container"><Eyebrow>{d.whyLabel}</Eyebrow><div className="values-heading"><h2>{d.whyTitle}</h2><div className="values-roofmark" aria-hidden="true">⌁</div></div><div className="values-grid">{values.map((value, i) => <article key={i}><span className="mono">0{i + 1}</span><h3>{value.title[locale]}</h3><p>{value.text[locale]}</p></article>)}</div></div></section>;
}
export function Faq({ locale }: { locale: Locale }) {
  const d = messages[locale];
  return <section className="section container faq-section"><div><Eyebrow>{d.faqLabel}</Eyebrow><h2>{d.faqTitle}</h2><TextLink locale={locale} page="contact">{d.talk}</TextLink></div><div>{faq.map((entry, i) => <Accordion key={i} title={entry.title[locale]} number={String(i + 1).padStart(2, '0')}><p>{entry.text[locale]}</p></Accordion>)}</div></section>;
}
export function Invitation({ locale }: { locale: Locale }) {
  const d = messages[locale];
  return <section className="invitation container"><div><Eyebrow>{d.contactLabel}</Eyebrow><h2>{d.contactTitle}</h2></div><div><p>{d.contactBody}</p><ButtonLink locale={locale} page="contact">{d.talk}</ButtonLink></div></section>;
}
export function ApproachPage({ locale }: { locale: Locale }) {
  const d = messages[locale];
  return <><PageIntro label={d.expertiseLabel} title={d.expertiseTitle} body={d.expertiseBody} /><Expertise locale={locale} full /><Values locale={locale} /><Process locale={locale} /><Faq locale={locale} /></>;
}
