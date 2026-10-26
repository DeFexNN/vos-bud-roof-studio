'use client';

import { ArrowUpRight, Info } from 'lucide-react';
import Link from 'next/link';
import { useRoof } from '@/configurator/State';
import { messages } from '@/i18n/messages';
import { money, number, type Locale } from '@/i18n/types';
import { useAnimatedNumber } from './ui';
import EstimateActions from './EstimateActions';
import { href } from '@/lib/site';

export default function CostSummary({ locale, actions = true, compact = false }: { locale: Locale; actions?: boolean; compact?: boolean }) {
  const { estimate: r, deltaArea } = useRoof(), d = messages[locale], animated = useAnimatedNumber(r.gross);
  return <aside className={`cost-summary ${compact ? 'cost-summary-compact' : ''}`} aria-label={d.investment}>
    <div className="cost-eyebrow"><span className="mono">{d.investment}</span><span className="live-dot" aria-hidden="true" /></div>
    <div className="investment-total" data-testid="estimate-total" data-value={r.gross}>{r.valid ? money(animated, locale) : '—'}<span>{d.gross}</span></div>
    {r.valid && <><div className="source-range"><span>{d.indicativeRange}</span><strong>{money(r.low, locale)} — {money(r.high, locale)}</strong></div>
      <div className="cost-bars" aria-hidden="true">{[['materials', r.materialsNet], ['labor', r.laborNet], ['tax', r.vat]].map(([key, value]) => <span key={String(key)} className={String(key)} style={{ width: `${Number(value) / r.gross * 100}%` }} />)}</div>
      {!compact && <dl className="cost-summary-lines"><div><dt>{d.materialSubtotal} <small>{d.net}</small></dt><dd>{money(r.materialsNet, locale)}</dd></div><div><dt>{d.laborSubtotal} <small>{d.net}</small></dt><dd>{money(r.laborNet, locale)}</dd></div>{r.categories.demolition > 0 && <div><dt>{d.demolition} <small>{d.net}</small></dt><dd>{money(r.categories.demolition, locale)}</dd></div>}<div><dt>VAT {number(r.vatRate * 100, locale, 2)}%</dt><dd>{money(r.vat, locale)}</dd></div></dl>}
    </>}
    {actions && <EstimateActions locale={locale} compact={compact} />}
    {!compact && <><p className="cost-disclaimer"><Info size={13} />{d.priceNote}</p><Link className="text-link" href={href(locale, 'contact')}>{d.talk}<ArrowUpRight size={16} /></Link></>}
    {r.partial && !compact && <p className="partial-note">{d.partial}</p>}
    {Math.abs(deltaArea) >= .05 && !compact && <p className="delta-note" role="status">{d.changedArea}: <strong>{deltaArea > 0 ? '+' : ''}{number(deltaArea, locale, 1)} m²</strong></p>}
  </aside>;
}
