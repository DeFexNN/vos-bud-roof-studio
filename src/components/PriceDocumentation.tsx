'use client';

import { ArrowUpRight } from 'lucide-react';
import { PRICE_REVIEW, sources } from '@/data/prices';
import { messages } from '@/i18n/messages';
import type { Locale } from '@/i18n/types';
import { useRoof } from '@/configurator/State';
import { sourceTitle } from '@/i18n/sourceTitles';

export default function PriceDocumentation({ locale }: { locale: Locale }) {
  const d = messages[locale], { estimate } = useRoof(), used = new Set(estimate.items.map(i => i.sourceId));
  if (used.has('venecja-shop')) used.add('budmat'); if (used.has('swissporton')) used.add('titania-retail'); if (used.has('concrete')) used.add('concrete-retail');
  return <section className="price-documentation"><div className="documentation-heading"><h3>{d.sourcesTitle}</h3><span className="mono">{d.reviewed} / {PRICE_REVIEW}</span></div>
    <details className="assumptions-details" open><summary>{d.assumptions}<ArrowUpRight size={17} /></summary><div><p>{d.rangeNote}</p><p>{d.laborNote}</p><p>{d.exclusions}</p><p>{d.productScope}</p></div></details>
    <details className="sources-details"><summary>{d.source}<span>{sources.length}</span></summary><div className="sources-list">{sources.map(s => <article key={s.id} className={used.has(s.id) ? 'used' : ''}><a href={s.url} target="_blank" rel="noreferrer">{sourceTitle(s, locale)}<ArrowUpRight size={15} /></a><span className="mono">{d.sourceDate}: {s.date || d.undated} / {d.accessed}: {PRICE_REVIEW}</span><p>{s.note[locale]}</p></article>)}</div></details>
    <p className="small-note">{d.priceNote}</p>
  </section>;
}
