'use client';

import { useState } from 'react';
import { Box, Layers, Ruler, SlidersHorizontal } from 'lucide-react';
import type { Locale } from '@/i18n/types';
import { number } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { useRoof } from '@/configurator/State';
import { defaultConfig, type LayerId } from '@/configurator/model';
import { buildRoof } from '@/calculators/geometry/roof';
import { GeometryControls, AppearanceControls, TechnicalControls, AccessoryControls, CostControls, type EstimateMode } from '@/configurator/Controls';
import { issueMessages } from '@/calculators/validation';
import LayerPanel from '@/configurator/LayerPanel';
import Viewer from '@/three/Viewer';
import { PageIntro, Accordion } from '@/components/ui';
import CostSummary from '@/components/CostSummary';
import BillOfMaterials from '@/components/BillOfMaterials';
import MeasurementDashboard from '@/components/MeasurementDashboard';
import PriceDocumentation from '@/components/PriceDocumentation';
import Scenarios from '@/components/Scenarios';
import EstimateActions from '@/components/EstimateActions';

export default function Studio({ locale, calculator = false }: { locale: Locale; calculator?: boolean }) {
  const d = messages[locale], { config, estimate, storageError } = useRoof();
  const [tab, setTab] = useState<'geometry' | 'appearance' | 'layers'>('geometry');
  const tabs = ['geometry', 'appearance', 'layers'] as const;
  const [mode, setMode] = useState<EstimateMode>(calculator ? 'professional' : 'quick');
  const [exploded, setExploded] = useState(0), [layer, setLayer] = useState<LayerId>('covering'), [measurements, setMeasurements] = useState(false);
  const renderConfig = estimate.geometry ? config : defaultConfig, geometry = estimate.geometry || buildRoof(defaultConfig);
  const uniqueIssues = estimate.issues.filter((issue, i, all) => all.findIndex(j => j.code === issue.code) === i);
  return <><PageIntro label={d.studioLabel} title={calculator ? d.billTitle.replace('\n', ' ') : d.studioPageTitle} body={d.studioPageBody} />
    <section className="studio-workspace container" id="workspace">
      <div className="studio-visual">
        <div className="viewer-topline"><span className="mono">V / {d.nav.studio} <span>01.0</span></span><div><button className={measurements ? 'active' : ''} onClick={() => setMeasurements(!measurements)} aria-label={d.measurements} aria-pressed={measurements} title={d.measurements}><Ruler size={18} /></button><button className={exploded > 0 ? 'active' : ''} onClick={() => { setExploded(exploded > .1 ? 0 : 1); setTab('layers'); }} aria-label={exploded > .1 ? d.assembled : d.exploded} aria-pressed={exploded > .1} title={d.layers}><Layers size={18} /></button></div></div>
        <div className="studio-viewer"><Viewer config={renderConfig} geometry={geometry} locale={locale} exploded={exploded} measurements={measurements} activeLayer={tab === 'layers' ? layer : null} onLayer={id => { setLayer(id); setTab('layers'); }} />
          <div className="scene-area"><span className="mono">{d.roofArea}</span><strong data-testid="roof-area" data-area={geometry.grossArea}>{number(geometry.grossArea, locale, 1)}<small>m²</small></strong></div>
          <div className="scene-coordinate mono">X / Y / Z</div>
        </div>
        <div className="viewer-bottomline"><Box size={14} /><span>{d.sceneHelp}</span><span className="mono">{geometry.planes.length} {d.slopes}</span></div>
        <div className="scene-quick-measures"><div><span>{d.length}</span><strong>{number(renderConfig.length, locale)} m</strong></div><div><span>{d.width}</span><strong>{number(renderConfig.width, locale)} m</strong></div><div><span>{d.pitch}</span><strong>{renderConfig.pitch}°</strong></div><div><span>{d.quantity}</span><strong>{estimate.valid ? number(estimate.quantities!.covering.units, locale, 0) : '—'} {d.pieces}</strong></div></div>
      </div>
      <div className="studio-controls"><div className="studio-tabs" role="tablist" aria-label={d.studioPageTitle}>{tabs.map((t, i) => <button key={t} className={tab === t ? 'active' : ''} role="tab" id={`studio-tab-${t}`} aria-selected={tab === t} aria-controls="studio-control-panel" tabIndex={tab === t ? 0 : -1} onClick={() => setTab(t)} onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
        if (next < 0) return;
        event.preventDefault(); setTab(tabs[next]); document.getElementById(`studio-tab-${tabs[next]}`)?.focus();
      }}>{d[t]}</button>)}</div>
        <div className="control-panel" id="studio-control-panel" role="tabpanel" aria-labelledby={`studio-tab-${tab}`}>
          {tab === 'geometry' && <><div className="control-mode"><label htmlFor="estimate-mode">{d.mode}</label><select id="estimate-mode" value={mode} onChange={e => setMode(e.target.value as EstimateMode)}>{(['quick', 'detailed', 'professional'] as const).map(m => <option key={m} value={m}>{d[m]}</option>)}</select></div><GeometryControls locale={locale} mode={mode} />{mode === 'quick' && <AppearanceControls locale={locale} />}{mode !== 'quick' && <><Accordion title={d.openings}><AccessoryControls locale={locale} /></Accordion><Accordion title={d.manufacturerSpec}><TechnicalControls locale={locale} /></Accordion><Accordion title={d.labor + ' / VAT'}><CostControls locale={locale} /></Accordion></>}</>}
          {tab === 'appearance' && <><AppearanceControls locale={locale} /><Accordion title={d.manufacturerSpec}><TechnicalControls locale={locale} /></Accordion><Accordion title={d.openings}><AccessoryControls locale={locale} /></Accordion></>}
          {tab === 'layers' && <LayerPanel locale={locale} active={layer} onActive={setLayer} exploded={exploded} onExploded={setExploded} />}
        </div>
        {(uniqueIssues.length > 0 || storageError) && <div className="studio-warnings" role="status">{storageError && <p>{issueMessages.storage[locale]}</p>}{uniqueIssues.map(issue => <p key={issue.code} className={issue.severity === 'error' ? 'error' : ''}><span>{issue.severity === 'error' ? '!' : 'i'}</span>{issueMessages[issue.code][locale]}</p>)}</div>}
        <CostSummary locale={locale} compact actions={false} />
        <div className="control-footer"><a className="button" href="#bill">{d.professional}<ArrowLabel /></a><span>{d.localSaved}</span></div>
      </div>
    </section>
    <section className="section container estimate-section" id="bill"><div className="section-heading"><div><span className="eyebrow"><span />{d.estimate.toUpperCase()} / 2026</span><h2>{d.billTitle}</h2></div><div className="heading-aside"><p>{d.billIntro}</p></div></div>
      <div className="estimate-layout"><div><MeasurementDashboard locale={locale} /><BillOfMaterials locale={locale} /><Scenarios locale={locale} /><PriceDocumentation locale={locale} /></div><div className="estimate-sidebar"><CostSummary locale={locale} /><p className="sidebar-caption">{d.areaDefinition}</p></div></div>
    </section>
    <div className="mobile-estimate-bar"><span>{d.investment}<strong>{estimate.valid ? new Intl.NumberFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(estimate.gross) : '—'}</strong></span><a href="#bill">{d.estimate}<Chevron /></a></div>
  </>;
}
function ArrowLabel() { return <SlidersHorizontal size={17} />; }
function Chevron() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10" /></svg>; }
