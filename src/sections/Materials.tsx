'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Check } from 'lucide-react';
import { useRoof } from '@/configurator/State';
import { products, systemNames, productName, productById } from '@/data/materials';
import { calculateEstimate } from '@/calculators/estimate';
import { netPrice, prices } from '@/data/prices';
import { defaultConfig } from '@/configurator/model';
import { buildRoof } from '@/calculators/geometry/roof';
import type { Locale } from '@/i18n/types';
import { money, number } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { href } from '@/lib/site';
import { ButtonLink, Eyebrow, PageIntro, SectionHeading } from '@/components/ui';
import Viewer from '@/three/Viewer';

function perM2(id: string) {
  const product = productById(id)!, price = prices[id];
  const coverage = product.kind === 'tile' ? product.effectiveWidth * product.battenSpacing : product.kind === 'module' ? product.effectiveWidth * product.effectiveLength : product.kind === 'shingle' ? product.packageCoverage! : 1;
  return netPrice(price) / coverage * 1.23 * (product.id === 't18' ? product.physicalWidth / product.effectiveWidth : 1);
}
export function MaterialTeaser({ locale }: { locale: Locale }) {
  const d = messages[locale];
  return <section className="section material-teaser"><div className="container"><SectionHeading label={d.materialsLabel} title={d.materialsTitle} intro={d.materialsBody}><ButtonLink locale={locale} page="materials" outline>{d.compareSystems}</ButtonLink></SectionHeading><div className="material-editorial">{['seam', 'ceramic', 'metal'].map((system, i) => {
    const p = products.find(p => p.system === system)!;
    return <Link key={p.id} href={href(locale, 'materials') + `#${p.id}`} className="material-preview"><div className={`material-surface surface-${system}`}><span className="mono">0{i + 1} / {d.referenceProduct}</span><span className="material-sample-shape" /><ArrowUpRight size={23} /></div><div><h3>{systemNames[p.system][locale]}</h3><span>{money(perM2(p.id), locale)} / m²</span></div><p>{p.description[locale]}</p></Link>;
  })}</div></div></section>;
}

export default function Materials({ locale }: { locale: Locale }) {
  const d = messages[locale], { config, estimate, selectProduct } = useRoof();
  const [selected, setSelected] = useState(config.productId), [compareA, setCompareA] = useState('classic-design'), [compareB, setCompareB] = useState('titania');
  useEffect(() => {
    const sync = () => setSelected(productById(window.location.hash.slice(1))?.id || config.productId);
    sync(); window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [config.productId]);
  const choose = (id: string) => {
    window.history.replaceState(null, '', `#${id}`);
    setSelected(id); selectProduct(id);
  };
  const p = productById(selected)!;
  const geometry = estimate.geometry || buildRoof(defaultConfig), visual = estimate.geometry ? config : defaultConfig;
  return <><PageIntro label={d.materialsLabel} title={d.materialsTitle} body={d.materialsBody} />
    <section className="container material-library"><aside className="material-selector"><span className="mono">{d.referenceProduct}</span>{products.map((product, i) => <button key={product.id} className={selected === product.id ? 'active' : ''} aria-pressed={selected === product.id} onClick={() => choose(product.id)}><span className="mono">0{i + 1}</span><span className={`mini-surface surface-${product.system}`} />{systemNames[product.system][locale]}<ArrowUpRight size={17} /></button>)}</aside>
      <div className="material-showcase"><div className="material-model"><Viewer config={{ ...visual, productId: p.id, battenSpacing: null }} geometry={geometry} locale={locale} controls={false} /><span className="mono">V / {d.materialStudy}</span></div><div className="material-description"><Eyebrow>{productName(p, locale)}</Eyebrow><h2>{systemNames[p.system][locale]}</h2><p>{p.description[locale]}</p><div className="material-spec-grid"><div><span>{d.materialOnly}</span><strong>{money(perM2(p.id), locale)} / m²</strong></div><div><span>{d.weight}</span><strong>{number(p.weightKgM2, locale)} kg/m²</strong></div><div><span>{d.minimumPitch}</span><strong>{p.minimumPitch}°</strong></div></div><details className="product-note" open><summary>{d.requirements}<ArrowRight size={16} /></summary><p>{p.requirements[locale]}</p><p>{p.maintenance[locale]}</p><a className="text-link" href={p.specificationURL} target="_blank" rel="noreferrer">{d.manufacturerSpec}<ArrowUpRight size={15} /></a></details><details className="product-note"><summary>{d.serviceLife}<ArrowRight size={16} /></summary><p>{p.kind === 'tile' ? d.tileLife : d.metalLife}</p>{p.kind === 'tile' && <a className="text-link" href="https://www.bmigroup.com/pl/braas/braas-faq/ile-kosztuje-m2-dachowki-betonowej" target="_blank" rel="noreferrer">BMI Braas · {d.source}<ArrowUpRight size={15} /></a>}</details><p className="small-note">{d.visualNote}</p><Link className="button" href={href(locale, 'studio')} onClick={() => selectProduct(p.id)}>{d.chooseMaterial}<ArrowUpRight size={18} /></Link></div></div>
    </section>
    <section className="section container material-comparison" id="compare"><SectionHeading label={d.compareSystems} title={d.forYourRoof} intro={d.compareDescription} /><div className="material-compare-grid">{[compareA, compareB].map((id, side) => {
      const product = productById(id)!, c = { ...config, productId: id, battenSpacing: null, snowGuards: false }, result = calculateEstimate(c);
      const g = result.geometry || geometry;
      return <article key={side}><div className="compare-select"><label htmlFor={`compare-${side}`}>{side === 0 ? d.compareLeft : d.compareRight}</label><select id={`compare-${side}`} value={id} onChange={e => side === 0 ? setCompareA(e.target.value) : setCompareB(e.target.value)}>{products.map(p => <option key={p.id} value={p.id}>{systemNames[p.system][locale]}</option>)}</select></div><div className="comparison-model"><Viewer config={c} geometry={g} locale={locale} controls={false} /></div><div className="compare-material-data"><span className="mono">{productName(product, locale)}</span><strong>{result.valid ? money(result.gross, locale) : '—'}<small>{d.gross}</small></strong><dl><div><dt>{d.materialOnly}</dt><dd>{money(perM2(id), locale)}</dd></div><div><dt>{d.weight}</dt><dd>{number(product.weightKgM2, locale)} kg/m²</dd></div><div><dt>{d.minimumPitch}</dt><dd>{product.minimumPitch}°</dd></div><div><dt>{d.battenSpacing}</dt><dd>{product.battenSpacing * 1000} mm</dd></div><div><dt>{d.laborSubtotal}</dt><dd>{result.valid ? money(result.laborNet, locale) : '—'}</dd></div></dl><p>{product.requirements[locale]}</p><p>{product.maintenance[locale]}</p><button className="text-link" onClick={() => choose(id)}>{d.chooseMaterial}<ArrowUpRight size={17} /></button></div></article>;
    })}</div><p className="small-note">{d.priceNote} {d.visualNote}</p></section>
  </>;
}
