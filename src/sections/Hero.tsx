'use client';

import { ArrowDown, ArrowUpRight, Check } from 'lucide-react';
import { useRoof } from '@/configurator/State';
import { defaultConfig } from '@/configurator/model';
import { buildRoof } from '@/calculators/geometry/roof';
import { productById, colors, systemNames } from '@/data/materials';
import { number, type Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { ButtonLink, Eyebrow } from '@/components/ui';
import Viewer from '@/three/Viewer';

export default function Hero({ locale }: { locale: Locale }) {
  const d = messages[locale], { config, estimate, update } = useRoof();
  const c = estimate.geometry ? config : defaultConfig, g = estimate.geometry || buildRoof(defaultConfig), product = productById(c.productId)!;
  return <section className="hero">
    <div className="hero-scene-container"><Viewer config={c} geometry={g} locale={locale} hero controls={false} /></div>
    <div className="hero-shade" />
    <div className="hero-top"><Eyebrow>{d.heroEyebrow}</Eyebrow><span className="hero-edition mono">V / 01 — {d.brandTag}</span></div>
    <div className="hero-content"><div className="hero-title"><h1><span>{d.hero1}</span><span>{d.hero2}</span><em>{d.hero3}</em></h1></div><p>{d.heroBody}</p><div className="hero-actions"><ButtonLink locale={locale} page="studio" light>{d.design}</ButtonLink><ButtonLink locale={locale} page="projects" outline>{d.viewProjects}</ButtonLink></div></div>
    <div className="hero-model-label"><span className="live-dot" /><span>{d.liveModel}</span><span className="model-label-line" /><span className="mono">{c.pitch}° / {number(g.grossArea, locale)} m²</span></div>
    <div className="hero-sample"><span className="mono">{d.selectedSystem}</span><strong>{systemNames[product.system][locale]}</strong><div className="hero-swatches">{colors.slice(0, 5).map(color => <button key={color.id} aria-label={`${color.name[locale]} ${color.ral}`} title={`${color.name[locale]} / ${color.ral}`} aria-pressed={c.color === color.id} onClick={() => update({ color: color.id })} style={{ backgroundColor: color.hex }} className={color.id === c.color ? 'active' : ''}>{color.id === c.color && <Check size={14} />}</button>)}</div><span className="sample-note">{colors.find(color => color.id === c.color)?.ral}<ArrowUpRight size={15} /></span></div>
    <div className="hero-bottom"><a href="#expertise" className="hero-scroll"><span><ArrowDown size={19} /></span>{d.discover}</a><span className="hero-bottom-note">{d.heroNote}</span><span className="hero-coordinate mono">{d.conceptual} / 01</span></div>
  </section>;
}
