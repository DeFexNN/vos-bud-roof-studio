'use client';

import { useRef, useState } from 'react';
import { Check, Download, FileDown, Link2, RotateCcw, Upload } from 'lucide-react';
import { useRoof, encodeConfig } from '@/configurator/State';
import { messages } from '@/i18n/messages';
import type { Locale } from '@/i18n/types';
import { asset, href } from '@/lib/site';
import { restoreConfig } from '@/calculators/validation';

export function downloadFile(body: string | Blob, name: string, type = 'application/json') {
  const blob = body instanceof Blob ? body : new Blob([body], { type });
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function EstimateActions({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const { config, estimate, replace, reset } = useRoof(), d = messages[locale];
  const [status, setStatus] = useState(''), [busy, setBusy] = useState(false), [link, setLink] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const pdf = async () => {
    if (!estimate.valid) return;
    setBusy(true); setStatus('');
    try {
      const { exportEstimatePdf } = await import('@/lib/pdf');
      let image: string | undefined;
      const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-scene="studio"]') || document.querySelector<HTMLCanvasElement>('canvas[data-scene="hero"]');
      if (canvas) image = await new Promise(resolve => {
        const timer = window.setTimeout(() => resolve(undefined), 1000);
        canvas.dispatchEvent(new CustomEvent('vos-capture', { detail: { resolve: (value: string) => { window.clearTimeout(timer); resolve(value); } } }));
      });
      await exportEstimatePdf(config, estimate, locale, image);
    } catch (error) { console.error('PDF export failed', error); setStatus(d.exportError); }
    finally { setBusy(false); }
  };
  const share = async () => {
    const url = `${window.location.origin}${asset(href(locale, 'studio'))}?roof=${encodeConfig(config)}`;
    try { await navigator.clipboard.writeText(url); setStatus(d.shareCopied); }
    catch { setLink(url); setStatus(d.shareFallback); }
  };
  return <div className={`estimate-actions ${compact ? 'compact' : ''}`}>
    <button className="button" disabled={!estimate.valid || busy} onClick={pdf} data-testid="export-pdf">{busy ? d.exporting : d.exportPdf}<FileDown size={18} /></button>
    <div className="export-options"><button onClick={share} disabled={!estimate.valid}><Link2 size={16} />{d.share}</button><button disabled={!estimate.valid} onClick={() => downloadFile(JSON.stringify(config, null, 2), 'vos-roof-configuration.json')}><Download size={16} />{d.save}</button></div>
    {!compact && <div className="export-options"><button onClick={() => fileInput.current?.click()}><Upload size={15} />{d.importConfig}</button><button onClick={reset}><RotateCcw size={15} />{d.reset}</button></div>}
    <input type="file" accept=".json,application/json" hidden ref={fileInput} aria-label={d.importConfig} onChange={async e => {
      const file = e.target.files?.[0]; if (!file) return;
      try {
        if (file.size > 50000) throw new Error('size');
        const data = restoreConfig(JSON.parse(await file.text()));
        if (!data) throw new Error('config'); replace(data); setStatus('');
      } catch { setStatus(d.importError); }
      e.target.value = '';
    }} />
    {status && <p className="action-status" role="status">{status}</p>}{link && <input className="share-input" readOnly value={link} aria-label={d.shareFallback} onFocus={e => e.target.select()} />}
  </div>;
}
