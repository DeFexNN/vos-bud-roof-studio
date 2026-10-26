'use client';

import { useRoof } from '@/configurator/State';
import { messages } from '@/i18n/messages';
import { number, type Locale } from '@/i18n/types';

export default function MeasurementDashboard({ locale }: { locale: Locale }) {
  const { estimate: r } = useRoof(), d = messages[locale], g = r.geometry, q = r.quantities;
  if (!g || !q) return null;
  const measures = [[d.footprint, g.footprint], [d.grossArea, g.grossArea], [d.netArea, g.netArea], [d.purchaseArea, q.covering.purchaseArea], [d.physicalArea, q.covering.physicalArea], [d.overlapArea, q.covering.overlapArea], [d.cuttingWaste, q.covering.cuttingWaste], [d.reserve, q.covering.reserveArea]] as const;
  return <div className="measurement-dashboard"><div className="measure-grid">{measures.map(([label, value]) => <div key={label}><span>{label}</span><strong>{number(value, locale, 2)}<small>m²</small></strong></div>)}</div><p className="small-note">{d.areaDefinition}</p>
    <div className="edge-measures">{[[d.ridge, g.ridge], [d.hips, g.hips], [d.valleys, g.valleys], [d.eaves, g.eaves], [d.barges, g.barges]].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{number(Number(value), locale, 2)} m</strong></div>)}</div>
    <details className="plane-details"><summary>{d.slopes}<span>{g.planes.length}</span></summary><div className="plane-list">{g.planes.map(p => <div key={p.id}><span className="mono">{p.id}</span><span>{number(p.area, locale, 2)} m²</span><span>{number(p.pitch, locale, 1)}°</span><span>{d.slopeLength}: {number(p.slopeLength, locale, 2)} m</span></div>)}</div></details>
    {q.covering.sheetCuts.length > 0 && <details className="plane-details"><summary>{d.sheetSchedule}<span>{q.covering.units} {d.pieces}</span></summary><div className="sheet-cuts">{q.covering.sheetCuts.map((s, i) => <div key={i}><span>{s.reserve ? d.reserve : `${d.plane} ${s.plane}`}</span><strong>{s.count} × {number(s.length, locale, 2)} m</strong></div>)}</div></details>}
  </div>;
}
