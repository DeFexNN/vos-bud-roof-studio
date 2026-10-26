'use client';

import { ArrowUpRight, Check } from 'lucide-react';
import { useRoof } from '@/configurator/State';
import { calculateEstimate } from '@/calculators/estimate';
import { messages } from '@/i18n/messages';
import { money, type Locale } from '@/i18n/types';
import { productById, productName } from '@/data/materials';

export default function Scenarios({ locale }: { locale: Locale }) {
  const { config, update } = useRoof(), d = messages[locale];
  const variants = [
    { name: d.economy, productId: 't18', membraneId: 'membrane-red' as const, color: 'anthracite' as const },
    { name: d.standard, productId: 'venecja', membraneId: 'membrane-red' as const, color: 'anthracite' as const },
    { name: d.premium, productId: 'titania', membraneId: 'membrane-pure' as const, color: 'black' as const },
  ];
  return <div className="scenarios"><div className="scenarios-heading"><h3>{d.scenarios}</h3><p>{d.scenarioNote}</p></div><div className="scenario-grid">{variants.map((v, i) => {
    const patch = { productId: v.productId, membraneId: v.membraneId, color: v.color, battenSpacing: null, snowGuards: false };
    const r = calculateEstimate({ ...config, ...patch }); const active = config.productId === v.productId;
    return <article key={v.productId} className={active ? 'active' : ''}><div className="scenario-top"><span className="mono">0{i + 1}</span><span>{v.name}</span>{active && <Check size={17} />}</div><h4>{productName(productById(v.productId)!, locale)}</h4><strong className="scenario-total">{r.valid ? money(r.gross, locale) : '—'}<small>{d.gross}</small></strong><button onClick={() => update(patch)}>{d.apply}<ArrowUpRight size={17} /></button></article>;
  })}</div></div>;
}
