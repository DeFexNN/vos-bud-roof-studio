'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, ArrowUp, Menu, X } from 'lucide-react';
import { messages } from '@/i18n/messages';
import type { Locale } from '@/i18n/types';
import { contactInstagram, href, type Page } from '@/lib/site';
import { Invitation } from '@/sections/Editorial';

export function Brand({ locale, large = false }: { locale: Locale; large?: boolean }) {
  const d = messages[locale];
  return <Link className={`brand ${large ? 'large' : ''}`} href={href(locale)} title={d.nav.home}><svg className="brand-mark" viewBox="0 0 40 34" fill="none" aria-hidden="true"><path d="M2 26L18 5L38 26M8 26L19 12L32 26" stroke="currentColor" strokeWidth="2" /><path d="M18 5V28M3 30H38" stroke="currentColor" strokeWidth="1" /></svg><span className="wordmark">v.o.s<span>_</span>bud</span>{!large && <span className="brand-tag">{d.brandTag}</span>}</Link>;
}
export default function Shell({ locale, page, projectId, children }: { locale: Locale; page: Page; projectId?: string; children: ReactNode }) {
  const d = messages[locale], [menu, setMenu] = useState(false), dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const links: Page[] = ['projects', 'studio', 'materials'];
  useEffect(() => {
    if (menu) { dialog.current?.showModal(); const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = old; }; }
    dialog.current?.close();
  }, [menu]);
  useEffect(() => { setMenu(false); }, [page, projectId, locale]);
  const close = () => { setMenu(false); trigger.current?.focus(); };
  const languages = <div className="language-switch" aria-label="PL / EN">{(['pl', 'en'] as const).map(l => <Link key={l} href={href(l, page, projectId)} hrefLang={l} lang={l} className={l === locale ? 'active' : ''} aria-current={l === locale ? 'true' : undefined}>{l.toUpperCase()}</Link>)}</div>;
   return <><a className="skip-link" href="#main">{d.skip}</a><header className={`site-header ${page === 'home' ? 'home-header' : ''}`}><Brand locale={locale} /><nav className="desktop-nav" aria-label={d.menu}>{links.map(item => <Link href={href(locale, item)} key={item} className={page === item ? 'active' : ''}>{item === 'studio' ? d.estimateRoof : d.nav[item]}</Link>)}</nav><div className="header-actions">{languages}<Link className="header-cta" href={href(locale, 'contact')}>{d.nav.contact}<ArrowUpRight size={16} /></Link><button ref={trigger} className="menu-trigger icon-button" onClick={() => setMenu(true)} aria-label={d.openMenu} aria-expanded={menu}><Menu size={23} /></button></div></header>
    {menu && <dialog ref={dialog} className="mobile-menu" aria-label={d.menu} onCancel={close}><div className="mobile-menu-top"><Brand locale={locale} /><button className="icon-button" onClick={close} aria-label={d.close} autoFocus><X size={25} /></button></div><nav>{([...links, 'calculator', 'contact', 'services'] as Page[]).map((item, i) => <Link key={item} href={href(locale, item)} onClick={close}><span className="mono">0{i + 1}</span>{d.nav[item]}<ArrowUpRight size={22} /></Link>)}</nav><div className="mobile-menu-bottom">{languages}<span className="mono">{d.heroNote}</span></div></dialog>}
    <main id="main">{children}</main>
    {!['contact', 'privacy', 'studio', 'calculator'].includes(page) && <Invitation locale={locale} />}
    <footer className={`site-footer ${page === 'studio' || page === 'calculator' ? 'has-mobile-bar' : ''}`}><div className="container"><div className="footer-top"><div className="footer-brand"><Brand locale={locale} large /><h2>{d.footerLine}</h2><p>{d.footerNote}</p></div><div className="footer-column"><h3>{d.footerExplore}</h3>{(['services', 'projects', 'materials'] as Page[]).map(p => <Link key={p} href={href(locale, p)}>{d.nav[p]}</Link>)}</div><div className="footer-column"><h3>{d.footerTools}</h3>{(['studio', 'calculator', 'contact'] as Page[]).map(p => <Link key={p} href={href(locale, p)}>{d.nav[p]}</Link>)}</div><div className="footer-contact"><h3>{d.footerContact}</h3><a href={contactInstagram} target="_blank" rel="noreferrer">@v.o.s_bud<ArrowUpRight size={21} /></a><span className="mono">{d.brandTag} / PL · EN</span></div></div><div className="footer-bottom"><span>{d.rights}</span><span className="footer-bottom-line">{d.heroNote}</span><Link href={href(locale, 'privacy')}>{d.nav.privacy}</Link><button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })} aria-label={d.backTop}><ArrowUp size={18} /></button></div></div></footer>
  </>;
}
