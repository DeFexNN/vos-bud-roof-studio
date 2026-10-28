'use client';

import { Check } from 'lucide-react';
import { useRoof } from '@/configurator/State';
import { defaultConfig } from '@/configurator/model';
import { buildRoof } from '@/calculators/geometry/roof';
import { colors, productById, systemNames } from '@/data/materials';
import { number, type Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { ButtonLink, Eyebrow } from '@/components/ui';
import Viewer from '@/three/Viewer';

export default function Hero({ locale }: { locale: Locale }) {
  const d = messages[locale], { config, estimate, update } = useRoof();
  const c = estimate.geometry ? config : defaultConfig, g = estimate.geometry || buildRoof(defaultConfig);
  const product = productById(c.productId)!;
  return <>
    <section className="roof-hero">
      <div className="roof-hero-copy"><Eyebrow>{d.heroEyebrow}</Eyebrow>
        <h1>{d.heroHeading}<span>{d.heroEnding}</span></h1>
        <p>{d.heroBody}</p>
        <div className="hero-actions"><ButtonLink locale={locale} page="studio" light>{d.estimateRoof}</ButtonLink><ButtonLink locale={locale} page="projects" outline>{d.viewProjects}</ButtonLink></div>
        <div className="hero-material-note"><span className="material-line" aria-hidden="true" /><div><strong>{d.heroNote}</strong><span>{d.heroEstimateHelp}</span></div></div>
      </div>
      <figure className="hero-model-stage"><div className="hero-model-top"><span className="live-dot" /><span>{d.liveModel}</span><span>{number(g.grossArea, locale, 1)} m²</span></div>
        <div className="hero-model-canvas"><Viewer config={c} geometry={g} locale={locale} hero /></div>
        <figcaption className="hero-model-bottom"><fieldset className="preview-colors"><legend>{d.tryColor}</legend><div>{colors.slice(0, 5).map(color => <button key={color.id} aria-label={`${color.name[locale]} ${color.ral}`} title={color.name[locale]} aria-pressed={c.color === color.id} onClick={() => update({ color: color.id })} style={{ backgroundColor: color.hex }}>{color.id === c.color && <Check size={16} />}</button>)}</div></fieldset><div className="hero-model-system"><span>{systemNames[product.system][locale]}</span><span>{d.previewNotProject}</span></div></figcaption>
      </figure>
    </section>
    <nav className="journey-links container" aria-label={d.journeyTitle}>{([
      ['projects', d.viewProjects, d.journeyProjects], ['studio', d.estimateRoof, d.journeyStudio], ['contact', d.talk, d.journeyContact],
    ] as const).map(([page, title, body], i) => <ButtonLink className="journey-link" key={page} locale={locale} page={page} outline><span className="journey-content"><span className="mono">0{i + 1}</span><span><strong>{title}</strong><span>{body}</span></span></span></ButtonLink>)}</nav>
  </>;
}
