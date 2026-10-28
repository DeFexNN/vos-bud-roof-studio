'use client';

import { Check, ChevronDown, Info } from 'lucide-react';
import type { Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { colors, productById, productName, products, systemNames } from '@/data/materials';
import { numericLimits, roofTypes, type RoofConfig } from './model';
import { useRoof } from './State';
import { Accordion, FieldSelect, Numeric, Toggle } from '@/components/ui';

export function RoofTypeIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    mono: 'M4 21V13L21 7L31 13V25L14 31L4 26M4 13L14 18L31 13M14 18V31',
    gable: 'M4 21V14L12 6L31 13V25L14 31L4 26M4 14L14 20L22 12L12 6M14 20V31M22 12L31 13',
    hip: 'M4 21V16L12 9L23 8L31 15V25L14 31L4 26M4 16L14 21L31 15M14 21L19 12L12 9M19 12L23 8M14 21V31',
    multi: 'M4 21V15L11 8L23 12L31 17V25L20 29L13 26L9 30L4 27M4 15L13 20L20 14L23 12M13 20L20 24L26 21L31 17M20 24V29',
  };
  return <svg viewBox="0 0 36 36" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[type]} /></svg>;
}
export function ShapeSelector({ locale }: { locale: Locale }) {
  const { config, update } = useRoof(), d = messages[locale];
  return <fieldset className="shape-selector"><legend>{d.roofType}</legend><div>{roofTypes.map(type => <button key={type} className={config.type === type ? 'active' : ''} onClick={() => update({ type, ridgeLength: null })} aria-pressed={config.type === type}>
    <RoofTypeIcon type={type} /><span>{d.roofNames[type]}</span>{config.type === type && <i />}
  </button>)}</div><p className="shape-description" aria-live="polite">{d.shapeDescriptions[config.type]}</p></fieldset>;
}
export function AppearanceControls({ locale }: { locale: Locale }) {
  const { config, update, selectProduct } = useRoof(), d = messages[locale], product = productById(config.productId)!;
  const color = colors.find(c => c.id === config.color)!;
  return <>
    <FieldSelect id="roof-product" label={d.material} value={config.productId} onChange={selectProduct}>{products.map(p => <option key={p.id} value={p.id}>{systemNames[p.system][locale]} · {productName(p, locale)}</option>)}</FieldSelect>
    <fieldset className="color-selector"><legend>{d.color}<span>{color.name[locale]} / {color.ral}</span></legend><div className="swatches">{colors.map(c => <button className={`color-swatch ${config.color === c.id ? 'active' : ''}`} key={c.id} style={{ '--swatch': c.hex } as React.CSSProperties} aria-label={`${c.name[locale]} ${c.ral}`} title={c.name[locale]} aria-pressed={config.color === c.id} onClick={() => update({ color: c.id })}>{config.color === c.id && <Check size={18} />}</button>)}</div></fieldset>
    <FieldSelect id="roof-finish" label={d.finish} value={config.finish} onChange={value => update({ finish: value as RoofConfig['finish'] })}><option value="matte">{d.matte}</option><option value="satin">{d.satin}</option></FieldSelect>
    <details className="product-note"><summary>{d.manufacturerSpec}<Info size={15} /></summary><p>{product.requirements[locale]}</p><a className="text-link" href={product.specificationURL} target="_blank" rel="noreferrer">{d.referenceProduct}<ChevronDown size={14} /></a></details>
    <p className="small-note">{d.visualNote}</p>
  </>;
}

export function GeometryControls({ locale }: { locale: Locale }) {
  const { config, update } = useRoof(), d = messages[locale];
  const numeric = (key: keyof typeof numericLimits, label: string, unit = 'm', step = .1) => {
    const [min, max] = numericLimits[key];
    return <Numeric key={key} id={`roof-${key}`} label={label} value={config[key]} min={min} max={max} step={step} unit={unit} onChange={v => update({ [key]: v })} />;
  };
  return <><ShapeSelector locale={locale} /><div className="dimension-grid">
    {numeric('length', d.length)}{numeric('width', d.width)}{numeric('pitch', d.pitch, '°', 1)}{numeric('overhang', d.overhang, 'm', .05)}
  </div>
    {config.type === 'multi' && <div className="dimension-grid">{numeric('wingWidth', d.wingWidth)}{numeric('wingLength', d.wingLength)}</div>}
    <Accordion title={d.advancedGeometry}><p className="small-note">{d.advancedHelp}</p><div className="dimension-grid">{numeric('height', d.height)}</div>
      {config.type === 'hip' && <div className="ridge-field"><Toggle label={d.automatic + ' · ' + d.ridgeLength} checked={config.ridgeLength === null} onChange={auto => update({ ridgeLength: auto ? null : Math.abs(config.length - config.width) })} />{config.ridgeLength !== null && <Numeric id="roof-ridgeLength" label={d.ridgeLength} value={config.ridgeLength} min={0} max={Math.max(config.length, config.width) + config.overhang * 2 - .2} step={.1} onChange={v => update({ ridgeLength: v })} />}<p className="small-note">{d.ridgeNote}</p></div>}
    </Accordion>
  </>;
}

export function TechnicalControls({ locale }: { locale: Locale }) {
  const { config, update } = useRoof(), d = messages[locale], product = productById(config.productId)!;
  return <div className="technical-controls">
    <div className="dimension-grid"><Numeric id="roof-rafterSpacing" label={d.rafterSpacing} min={.4} max={1.2} step={.05} value={config.rafterSpacing} onChange={v => update({ rafterSpacing: v })} />
      <FieldSelect id="roof-timberLength" label={d.timberLength} value={String(config.timberLength)} onChange={v => update({ timberLength: Number(v) })}>{[3, 4, 5, 6].map(v => <option key={v} value={v}>{v} m</option>)}</FieldSelect></div>
    {product.kind !== 'shingle' && <div className="gauge-control"><Toggle label={d.battenSpacing + ' · ' + d.systemDefault} checked={config.battenSpacing === null} onChange={auto => update({ battenSpacing: auto ? null : product.battenSpacing })} />
      {config.battenSpacing === null ? <p className="small-note">{product.battenSpacing * 1000} mm · {productName(product, locale)}</p> : <Numeric id="roof-battenSpacing" label={d.battenSpacing} min={product.minBattenSpacing * 1000} max={Math.max(product.maxBattenSpacing * 1000, product.minBattenSpacing * 1000 + 1)} step={1} unit="mm" value={config.battenSpacing * 1000} onChange={v => update({ battenSpacing: v / 1000 })} />}</div>}
    <div className="dimension-grid"><Numeric label={d.waste} id="roof-coveringWaste" value={config.coveringWaste * 100} min={0} max={25} step={1} unit="%" onChange={v => update({ coveringWaste: v / 100 })} /><Numeric label={d.timberWaste} id="roof-timberWaste" value={config.timberWaste * 100} min={0} max={30} step={1} unit="%" onChange={v => update({ timberWaste: v / 100 })} /></div>
    {product.kind !== 'shingle' && <><FieldSelect id="roof-membrane" label={d.membrane} value={config.membraneId} onChange={value => update({ membraneId: value as RoofConfig['membraneId'] })}><option value="membrane-red">Corotop Red Strong 180</option><option value="membrane-pure">Corotop PURE 205</option></FieldSelect><Numeric id="roof-membraneOverlap" label={d.overlap} value={config.membraneOverlap * 1000} min={100} max={300} step={10} unit="mm" onChange={v => update({ membraneOverlap: v / 1000 })} /></>}
    <Numeric label={d.membraneWaste} id="roof-membraneWaste" value={config.membraneWaste * 100} min={0} max={20} step={1} unit="%" onChange={v => update({ membraneWaste: v / 100 })} />
  </div>;
}
export function AccessoryControls({ locale }: { locale: Locale }) {
  const { config, update } = useRoof(), d = messages[locale], product = productById(config.productId)!;
  return <div className="accessory-controls"><div className="dimension-grid"><Numeric id="roof-windows" label={d.windows} min={0} max={4} step={1} unit={d.pieces} value={config.windows} onChange={v => update({ windows: v })} /><Numeric id="roof-chimneys" label={d.chimneys} min={0} max={2} step={1} unit={d.pieces} value={config.chimneys} onChange={v => update({ chimneys: v })} /></div>
    <Toggle label={d.gutters} checked={config.gutters} onChange={v => update({ gutters: v })} />
    <Toggle label={d.sheathing} checked={product.kind === 'shingle' || config.sheathing} disabled={product.kind === 'shingle'} onChange={v => update({ sheathing: v })} />
    <Toggle label={d.insulation} checked={config.insulation} onChange={v => update({ insulation: v })} />
    <Toggle label={d.structuralTimber} checked={config.structuralTimber} onChange={v => update({ structuralTimber: v })} />
    {product.system === 'metal' && <Toggle label={d.snowGuards} checked={config.snowGuards} onChange={v => update({ snowGuards: v })} />}
  </div>;
}
export function CostControls({ locale }: { locale: Locale }) {
  const { config, update } = useRoof(), d = messages[locale];
  return <div className="cost-controls"><Toggle label={d.labor} checked={config.labor} onChange={v => update({ labor: v })} />
    {config.labor && <><FieldSelect label={d.laborScope} id="roof-laborScope" value={config.laborScope} onChange={v => update({ laborScope: v as RoofConfig['laborScope'] })}><option value="itemized">{d.itemized}</option><option value="bundled">{d.bundled}</option></FieldSelect>{config.laborScope === 'bundled' && <Numeric id="roof-bundledLaborNet" label={d.bundledRate} min={1} max={1000} value={config.bundledLaborNet} step={1} unit="PLN" onChange={v => update({ bundledLaborNet: v })} />}</>}
    <FieldSelect label={d.demolition} id="roof-demolition" value={config.demolition} onChange={v => update({ demolition: v as RoofConfig['demolition'] })}><option value="none">{d.noDemolition}</option><option value="metal">{d.metalDemolition}</option><option value="felt">{d.feltDemolition}</option></FieldSelect>
    {config.demolition === 'felt' && <Numeric label={d.disposalVolume} min={0} max={100} step={.1} unit="m³" value={config.disposalVolume} onChange={v => update({ disposalVolume: v })} />}
    <FieldSelect label={d.taxes} id="roof-vatMode" value={config.vatMode} onChange={v => update({ vatMode: v as RoofConfig['vatMode'] })}><option value="standard">{d.standardVat}</option><option value="residential">{d.residentialVat}</option></FieldSelect>
    {config.vatMode === 'residential' && <><Toggle label={d.eligible} checked={config.vatEligible} onChange={v => update({ vatEligible: v })} /><FieldSelect label={d.residentialType} value={config.residentialType} onChange={v => update({ residentialType: v as RoofConfig['residentialType'] })}><option value="house">{d.house}</option><option value="apartment">{d.apartment}</option></FieldSelect><Numeric label={d.residentialArea} min={1} max={1000} value={config.residentialArea} step={1} unit="m²" onChange={v => update({ residentialArea: v })} /></>}
    <p className="small-note">{d.vatNote}</p>
  </div>;
}
