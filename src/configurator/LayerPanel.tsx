'use client';

import { ArrowUpRight, Layers, Plus, Minus } from 'lucide-react';
import type { LayerId } from './model';
import { useRoof } from './State';
import { layerInfo, productById } from '@/data/materials';
import { messages } from '@/i18n/messages';
import { money, number, type Locale } from '@/i18n/types';

export default function LayerPanel({ locale, active, onActive, exploded, onExploded }: { locale: Locale; active: LayerId; onActive: (id: LayerId) => void; exploded: number; onExploded: (v: number) => void }) {
  const { config, estimate } = useRoof(), d = messages[locale], product = productById(config.productId)!;
  const selected: LayerId[] = ['covering', ...(product.kind === 'shingle' ? [] : ['battens', 'counter'] as LayerId[]), 'membrane', ...(product.kind === 'shingle' || config.sheathing ? ['sheathing'] as LayerId[] : []), 'structure'];
  const current = selected.includes(active) ? active : 'covering';
  const layerItems = estimate.items.filter(item => current === 'covering' ? item.category === 'covering'
    : current === 'battens' ? item.id === 'batten' : current === 'counter' ? item.id === 'counter'
    : current === 'sheathing' ? item.id === 'osb' : current === 'structure' ? item.id === 'structural-wood'
    : ['membrane-red', 'membrane-pure', 'bitumen-underlay', 'sealing-tape'].includes(item.id));
  return <div className="layer-panel"><div className="panel-heading"><h3>{d.layers}</h3><Layers size={18} /></div>
    <button className="button outline full-width" onClick={() => onExploded(exploded > .1 ? 0 : 1)}>{exploded > .1 ? d.assembled : d.exploded}{exploded > .1 ? <Minus size={18} /> : <Plus size={18} />}</button>
    <label className="layer-range-label" htmlFor="roof-explode">{d.layerControl}<span>{Math.round(exploded * 100)}%</span></label><input id="roof-explode" className="slider" type="range" min={0} max={1} step={.05} value={exploded} onChange={e => onExploded(Number(e.target.value))} />
    <div role="tablist" aria-label={d.selectedLayer} className="layer-list">{selected.map((id, i) => <button key={id} role="tab" id={`tab-layer-${id}`} aria-selected={current === id} aria-controls="layer-detail" tabIndex={current === id ? 0 : -1} onClick={() => { onActive(id); if (exploded < .1) onExploded(1); }}
      onKeyDown={event => {
        let next = i;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (i + 1) % selected.length;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (i + selected.length - 1) % selected.length;
        else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = selected.length - 1; else return;
        event.preventDefault(); onActive(selected[next]); document.getElementById(`tab-layer-${selected[next]}`)?.focus();
      }} className={current === id ? 'active' : ''}><span className="mono">0{i + 1}</span><i style={{ backgroundColor: layerInfo[id].color }} />{layerInfo[id].title[locale]}<ArrowUpRight size={16} /></button>)}</div>
    <div id="layer-detail" className="layer-detail" role="tabpanel" aria-labelledby={`tab-layer-${current}`}><span className="mono">{d.selectedLayer}</span><h3>{layerInfo[current].title[locale]}</h3><p>{layerInfo[current].purpose[locale]}</p><div className="layer-cost">{layerItems.map(item => <div key={item.id}><span>{number(item.quantity, locale)} {d.units[item.unit]}</span><strong>{money(item.costNet, locale)} <small>{d.net}</small></strong></div>)}{!layerItems.length && <p className="small-note">{current === 'structure' ? d.exclusions : d.noResults}</p>}</div></div>
  </div>;
}
