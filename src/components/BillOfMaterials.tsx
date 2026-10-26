'use client';

import { Fragment, useState } from 'react';
import { ArrowUpRight, ChevronDown, Info, RotateCcw } from 'lucide-react';
import { useRoof } from '@/configurator/State';
import { messages } from '@/i18n/messages';
import { money, number, type Locale } from '@/i18n/types';
import { prices, sources, type Category } from '@/data/prices';
import { sourceTitle } from '@/i18n/sourceTitles';

export default function BillOfMaterials({ locale }: { locale: Locale }) {
  const { config, estimate: r, update } = useRoof(), d = messages[locale];
  const [open, setOpen] = useState<string | null>(null), [category, setCategory] = useState<Category | 'all'>('all');
  if (!r.valid) return <div className="empty-estimate"><Info size={24} /><p>{d.noResults}</p></div>;
  const items = r.items.filter(i => category === 'all' || i.category === category);
  return <div className="bill-of-materials">
    <div className="bill-filter" aria-label={d.assumptions}><button className={category === 'all' ? 'active' : ''} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{d.all}<sup>{r.items.length}</sup></button>
      {Object.entries(d.categories).filter(([id]) => r.categories[id as Category] > 0).map(([id, label]) => <button key={id} aria-pressed={category === id} className={category === id ? 'active' : ''} onClick={() => setCategory(id as Category)}>{label}</button>)}
    </div>
    <div className="bill-scroll" tabIndex={0} role="region" aria-label={d.billTitle.replace('\n', ' ')}><table className="bill-table">
      <thead><tr><th scope="col">{d.material}</th><th scope="col">{d.quantity}</th><th scope="col">{d.unit}</th><th scope="col">{d.unitPrice}</th><th scope="col">{d.cost}</th></tr></thead>
      <tbody>{items.map(item => {
        const source = sources.find(s => s.id === item.sourceId), expanded = open === item.id;
        return <Fragment key={item.id}><tr className={expanded ? 'expanded' : ''}>
          <th scope="row"><button onClick={() => setOpen(expanded ? null : item.id)} aria-expanded={expanded} aria-controls={`bill-${item.id}`}><span><small>{d.categories[item.category]}</small>{item.name[locale]}{item.overridden && <em>{d.yourPrice}</em>}</span><ChevronDown size={16} /></button></th>
          <td>{number(item.quantity, locale, 2)}</td><td>{d.units[item.unit]}</td><td>{money(item.unitNet, locale, 2)}</td><td>{money(item.costNet, locale, 2)}</td>
        </tr>{expanded && <tr className="bill-explanation" id={`bill-${item.id}`}><td colSpan={5}><div className="bill-explanation-grid"><div><span className="mono">{d.formula}</span><p>{item.formula[locale]}</p><p className="theoretical-line">{d.theoretical}: <strong>{number(item.theoretical, locale, 3)} {d.units[item.unit]}</strong></p>{source && <a className="text-link" href={source.url} target="_blank" rel="noreferrer">{d.source}: {sourceTitle(source, locale)}<ArrowUpRight size={14} /></a>}</div><div>{item.priceId !== 'labor-bundle' && <><label htmlFor={`price-${item.id}`}>{d.yourPrice} / {d.units[item.unit]}</label><div className="override-input"><input id={`price-${item.id}`} type="number" min={0} max={1000000} step={.01} value={Number(item.unitNet.toFixed(2))} onChange={e => update({ priceOverrides: { ...config.priceOverrides, [item.priceId]: Number(e.target.value) } })} /><span>PLN</span></div><button className="restore-price" onClick={() => {
            const next = { ...config.priceOverrides }; delete next[item.priceId]; update({ priceOverrides: next });
          }}><RotateCcw size={14} />{d.restorePrice}</button><p className="small-note">{d.indicativeRange}: {money(item.lowUnitNet, locale, 2)}–{money(item.highUnitNet, locale, 2)}</p></>}{source && <p className="small-note">{source.note[locale]}</p>}</div></div></td></tr>}</Fragment>;
      })}</tbody>
      <tfoot><tr><th scope="row" colSpan={4}>{category === 'all' ? d.total : d.categories[category]} · {d.net}</th><td>{money(items.reduce((sum, i) => sum + i.costNet, 0), locale, 2)}</td></tr></tfoot>
    </table></div>
  </div>;
}
