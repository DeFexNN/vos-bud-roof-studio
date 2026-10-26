'use client';

import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Download, FileText, Instagram } from 'lucide-react';
import { useRoof } from '@/configurator/State';
import { messages } from '@/i18n/messages';
import { money, number, type Locale } from '@/i18n/types';
import { productById, productName, systemNames } from '@/data/materials';
import { contactEmail, contactInstagram, href } from '@/lib/site';
import { PageIntro, Eyebrow, ProjectPhoto, Toggle } from '@/components/ui';
import { downloadFile } from '@/components/EstimateActions';
import { projects } from '@/data/projects';
import { PRICE_REVIEW } from '@/data/prices';
import Link from 'next/link';

export default function Contact({ locale }: { locale: Locale }) {
  const { config, estimate } = useRoof(), d = messages[locale], product = productById(config.productId)!;
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '', consent: false, attach: true });
  const [errors, setErrors] = useState<Record<string, string>>({}), [status, setStatus] = useState('');
  const update = (key: keyof typeof form, value: string | boolean) => { setForm(f => ({ ...f, [key]: value })); setErrors(e => ({ ...e, [key]: '' })); setStatus(''); };
  const documentText = () => [
    `V.O.S_BUD — ${d.contactForm}`, `${d.name}: ${form.name}`, `${d.email}: ${form.email}`, `${d.phone}: ${form.phone}`, '', `${d.projectNotes}\n${form.notes}`, '',
    ...(form.attach ? [d.currentConfig, `${d.roofType}: ${d.roofNames[config.type]}`, `${d.material}: ${productName(product, locale)}`,
      `${config.length} × ${config.width} m / ${config.pitch}°`, `${d.grossArea}: ${number(estimate.geometry?.grossArea || 0, locale, 2)} m²`,
      ...estimate.items.map(i => `${i.name[locale]} | ${number(i.quantity, locale, 2)} ${d.units[i.unit]} | ${money(i.unitNet, locale, 2)} | ${money(i.costNet, locale, 2)} ${d.net}`),
      `${d.total}: ${money(estimate.gross, locale, 2)} ${d.gross}`, `${d.reviewed}: ${PRICE_REVIEW}`, '', d.priceNote, d.exclusions, '', JSON.stringify(config, null, 2)] : []),
  ].join('\n');
  const submit = (event: FormEvent) => {
    event.preventDefault(); const found: Record<string, string> = {};
    if (!form.name.trim()) found.name = d.required;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.email = d.invalidEmail;
    if (form.phone && !/^[+\d\s()-]{7,22}$/.test(form.phone)) found.phone = d.invalidPhone;
    if (form.notes.trim().length < 10) found.notes = d.shortNotes;
    if (!form.consent) found.consent = d.consentRequired;
    if (form.attach && !estimate.valid) found.attach = d.noResults;
    setErrors(found);
    if (Object.keys(found).length) { requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    downloadFile(documentText(), `VOS-${locale === 'pl' ? 'zapytanie' : 'inquiry'}.txt`, 'text/plain;charset=utf-8'); setStatus(d.inquiryReady);
  };
  const field = (key: 'name' | 'email' | 'phone', label: string, type: string, required = false) => <div className="field"><label htmlFor={`contact-${key}`}>{label}{required ? ' *' : ''}</label><input id={`contact-${key}`} type={type} value={form[key]} onChange={e => update(key, e.target.value)} required={required} autoComplete={key === 'phone' ? 'tel' : key} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `contact-error-${key}` : undefined} maxLength={150} />{errors[key] && <span className="field-error" id={`contact-error-${key}`}>{errors[key]}</span>}</div>;
  return <><PageIntro label={d.contactLabel} title={d.contactTitle} body={d.contactBody} /><section className="container contact-grid"><aside><div className="contact-image"><ProjectPhoto number="02" alt={projects[1].afterAlt[locale]} position="50% 44%" /><span className="mono">V / {d.photoCredit}</span></div><div className="direct-contact"><Eyebrow>{d.contactChannel}</Eyebrow><a href={contactInstagram} target="_blank" rel="noreferrer">@v.o.s_bud<ArrowUpRight size={25} /></a><p>{d.footerNote}</p>{contactEmail && <a href={`mailto:${contactEmail}`}>{contactEmail}<ArrowUpRight size={17} /></a>}</div></aside>
    <div className="contact-form-panel"><div className="form-title"><h2>{d.contactForm}</h2><span className="mono">V / 01</span></div><p className="contact-notice"><FileText size={18} />{d.contactNotice}</p><form onSubmit={submit} noValidate><div className="form-grid">{field('name', d.name, 'text', true)}{field('email', d.email, 'email', true)}{field('phone', d.phone, 'tel')}</div><div className="field"><label htmlFor="contact-notes">{d.projectNotes} *</label><textarea id="contact-notes" rows={5} maxLength={5000} placeholder={d.notesPlaceholder} value={form.notes} onChange={e => update('notes', e.target.value)} required aria-invalid={!!errors.notes} aria-describedby={errors.notes ? 'contact-error-notes' : undefined} />{errors.notes && <span className="field-error" id="contact-error-notes">{errors.notes}</span>}</div>
      <Toggle label={d.attachConfig} checked={form.attach} onChange={value => update('attach', value)} />{form.attach && <div className="attached-configuration"><span className="configuration-icon"><FileText size={25} strokeWidth={1} /></span><div><strong>{systemNames[product.system][locale]}</strong><span>{d.roofNames[config.type]} · {number(estimate.geometry?.grossArea || 0, locale)} m²</span></div><strong>{estimate.valid ? money(estimate.gross, locale) : '—'}</strong><Link href={href(locale, 'studio')} aria-label={d.design}><ArrowUpRight size={19} /></Link></div>}{errors.attach && <p className="field-error">{errors.attach}</p>}
      <label className="consent"><input type="checkbox" checked={form.consent} onChange={e => update('consent', e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'contact-error-consent' : undefined} /><span>{d.consent} <Link href={href(locale, 'privacy')}>{d.privacyLink}</Link></span></label>{errors.consent && <span className="field-error" id="contact-error-consent">{errors.consent}</span>}
      <button className="button full-width" type="submit">{d.downloadInquiry}<Download size={18} /></button>{status && <p className="contact-status" role="status"><Check size={20} />{status}</p>}
      {status && contactEmail && <a className="text-link" href={`mailto:${contactEmail}?subject=${encodeURIComponent(d.contactForm)}&body=${encodeURIComponent(documentText())}`}>{d.emailInquiry}<ArrowUpRight size={18} /></a>}
    </form><a className="instagram-contact" href={contactInstagram} target="_blank" rel="noreferrer"><Instagram size={18} />{d.instagram}<ArrowUpRight size={17} /></a></div></section></>;
}
