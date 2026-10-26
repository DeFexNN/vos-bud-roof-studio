'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Plus } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { href, projectImage, type Page } from '@/lib/site';
import type { Locale } from '@/i18n/types';
import imageMetadata from '@/data/imageMetadata.json';

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`eyebrow ${className}`}><span aria-hidden="true" />{children}</div>;
}
export function ButtonLink({ locale, page, children, light = false, outline = false, className = '', hash = '' }: {
  locale: Locale; page: Page; children: ReactNode; light?: boolean; outline?: boolean; className?: string; hash?: string;
}) {
  return <Link href={`${href(locale, page)}${hash}`} className={`button ${light ? 'light' : ''} ${outline ? 'outline' : ''} ${className}`}><span>{children}</span><ArrowUpRight size={19} aria-hidden="true" /></Link>;
}
export function TextLink({ locale, page, children, project }: { locale: Locale; page: Page; children: ReactNode; project?: string }) {
  return <Link className="text-link" href={href(locale, page, project)}>{children}<ArrowUpRight size={18} aria-hidden="true" /></Link>;
}
export function SectionHeading({ label, title, children, intro }: { label: string; title: string; children?: ReactNode; intro?: string }) {
  return <div className="section-heading"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div>{(intro || children) && <div className="heading-aside">{intro && <p>{intro}</p>}{children}</div>}</div>;
}
export function PageIntro({ label, title, body, children }: { label: string; title: string; body?: string; children?: ReactNode }) {
  return <section className="page-intro container"><Eyebrow>{label}</Eyebrow><div className="intro-grid"><h1>{title}</h1><div>{body && <p>{body}</p>}{children}</div></div></section>;
}
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    node.classList.add('will-reveal');
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { node.classList.add('revealed'); observer.disconnect(); }
    }, { threshold: .08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div className={`reveal ${className}`} ref={ref}>{children}</div>;
}
export function ProjectPhoto({ number, phase = 'after', alt, position = 'center', className = '', priority = false, sizes = '(max-width: 700px) 100vw, 50vw' }: {
  number: string; phase?: 'before' | 'after' | 'collage'; alt: string; position?: string; className?: string; priority?: boolean; sizes?: string;
}) {
  const dimensions = imageMetadata[`${number}-${phase}` as keyof typeof imageMetadata] || { width: 1600, height: 1600 };
  return <img className={`project-image ${className}`} src={projectImage(number, phase)}
    srcSet={`${projectImage(number, phase, 480)} 480w, ${projectImage(number, phase, 960)} 960w, ${projectImage(number, phase, 1600)} ${Math.min(dimensions.width, 1600)}w`}
    sizes={sizes} alt={alt} style={{ objectPosition: position }} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} width={dimensions.width} height={dimensions.height} />;
}
export function Numeric({ label, value, onChange, min, max, step = 1, unit = 'm', id: givenId, disabled = false }: {
  label: string; value: number; onChange: (n: number) => void; min: number; max: number; step?: number; unit?: string; id?: string; disabled?: boolean;
}) {
  const autoId = useId(), id = givenId || autoId;
  const invalid = !Number.isFinite(value) || value < min - .00001 || value > max + .00001;
  return <div className={`numeric-field ${disabled ? 'disabled' : ''}`}><label htmlFor={id}>{label}</label>
    <div className="numeric-value"><input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={Number.isFinite(value) ? Number(value.toFixed(4)) : ''}
      onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))} aria-invalid={invalid || undefined} disabled={disabled} /><span>{unit}</span></div>
    <input className="slider" type="range" min={min} max={max} step={step} value={Math.max(min, Math.min(max, value))}
      onChange={e => onChange(Number(e.target.value))} aria-label={`${label} · ${unit}`} disabled={disabled}
      style={{ '--progress': `${Math.max(0, Math.min(100, (value - min) / (max - min) * 100))}%` } as React.CSSProperties} />
    <div className="range-limits" aria-hidden="true"><span>{min} {unit}</span><span>{max} {unit}</span></div>
  </div>;
}
export function Toggle({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return <label className={`toggle-field ${disabled ? 'disabled' : ''}`}><span>{label}</span><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} /><span className="toggle-track" aria-hidden="true"><i /></span></label>;
}
export function FieldSelect({ label, value, onChange, children, id: provided }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode; id?: string }) {
  const generated = useId(), id = provided || generated;
  return <div className="field"><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={e => onChange(e.target.value)}>{children}</select></div>;
}
export function Accordion({ title, children, open = false, number }: { title: string; children: ReactNode; open?: boolean; number?: string }) {
  return <details className="accordion" open={open || undefined}><summary>{number && <span className="mono">{number}</span>}<span>{title}</span><Plus size={19} aria-hidden="true" /></summary><div className="accordion-content">{children}</div></details>;
}
export function useAnimatedNumber(target: number) {
  const [value, setValue] = useState(target), previous = useRef(target);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { previous.current = target; setValue(target); return; }
    const start = performance.now(), from = previous.current;
    let frame = 0;
    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / 360);
      const next = from + (target - from) * (1 - Math.pow(1 - progress, 3));
      previous.current = next; setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}
export function ArrowCircle() { return <span className="arrow-circle"><ArrowRight size={24} strokeWidth={1.3} aria-hidden="true" /></span>; }
