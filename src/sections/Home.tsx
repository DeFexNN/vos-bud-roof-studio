'use client';

import type { Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { useRoof } from '@/configurator/State';
import { number } from '@/i18n/types';
import { ButtonLink, Eyebrow } from '@/components/ui';
import Hero from './Hero';
import { FeaturedProjects } from './Projects';
import { MaterialTeaser } from './Materials';
import { AnatomyFeature, Expertise, Faq, Process, Values } from './Editorial';
import CostSummary from '@/components/CostSummary';

export default function Home({ locale }: { locale: Locale }) {
  const d = messages[locale], { estimate } = useRoof();
  return <><Hero locale={locale} />
    <FeaturedProjects locale={locale} /><Expertise locale={locale} /><MaterialTeaser locale={locale} /><AnatomyFeature locale={locale} /><Process locale={locale} />
    <section className="estimate-teaser"><div className="container estimate-teaser-grid"><div><Eyebrow>{d.estimate}</Eyebrow><h2>{d.billTitle}</h2><p>{d.heroEstimateHelp}</p><ButtonLink locale={locale} page="studio">{d.estimateRoof}</ButtonLink></div><div className="teaser-summary"><div className="teaser-summary-label"><span>{d.currentConfig}</span><span>{number(estimate.geometry?.grossArea || 0, locale)} m²</span></div><CostSummary locale={locale} compact actions={false} /></div></div></section>
    <Values locale={locale} /><Faq locale={locale} />
  </>;
}
