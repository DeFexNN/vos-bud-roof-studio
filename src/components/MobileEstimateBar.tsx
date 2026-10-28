'use client';

import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';

/** The measured border box includes the device's bottom safe area. */
export default function MobileEstimateBar({ locale, total }: { locale: Locale; total: number | null }) {
  const bar = useRef<HTMLDivElement>(null), d = messages[locale];
  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    const root = document.documentElement, mobile = window.matchMedia('(max-width: 760px)');
    const viewport = window.visualViewport;
    let frame = 0, viewerVisible = false, clearFocus = false;
    root.dataset.estimateBar = 'true';
    const update = () => {
      frame = 0;
      const height = mobile.matches ? element.getBoundingClientRect().height : 0;
      root.style.setProperty('--estimate-bar', `${height}px`);
      const focused = document.activeElement;
      const editing = focused instanceof HTMLElement && focused.matches('input:not([type="range"]):not([type="checkbox"]):not([type="file"]), textarea, select');
      // The model, fullscreen dialogs and the on-screen keyboard take priority.
      element.dataset.suspended = String(viewerVisible || editing);
      const ensureFocus = clearFocus; clearFocus = false;
      if (!ensureFocus) return;
      if (!mobile.matches || !(focused instanceof HTMLElement) || focused === document.body || element.contains(focused) || focused.closest('dialog, .scene-fullscreen')) return;
      const box = focused.getBoundingClientRect();
      const top = Math.max(viewport?.offsetTop || 0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0) + 12;
      const bottom = (viewport ? viewport.offsetTop + viewport.height : innerHeight) - (viewerVisible || editing ? 0 : height) - 12;
      const delta = box.bottom > bottom ? box.bottom - bottom : box.top < top ? box.top - top : 0;
      if (delta && box.height < bottom - top) window.scrollBy({ top: delta, behavior: 'instant' });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const focusChanged = (event?: Event) => {
      // Jump navigation owns its scroll; do not interrupt a smooth transition.
      clearFocus = !(event?.target instanceof HTMLElement && event.target.dataset.navigationFocus);
      schedule();
    };
    const resize = new ResizeObserver(() => focusChanged()); resize.observe(element, { box: 'border-box' });
    const visibleViewerParts = new Set<Element>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleViewerParts.add(entry.target);
        else visibleViewerParts.delete(entry.target);
      }
      viewerVisible = visibleViewerParts.size > 0; schedule();
    }, { rootMargin: '-84px 0px 0px' });
    document.querySelectorAll('#studio-model .studio-viewer, #studio-model .viewer-topline').forEach(part => observer.observe(part));
    mobile.addEventListener('change', focusChanged);
    document.addEventListener('focusin', focusChanged); document.addEventListener('focusout', schedule);
    window.addEventListener('resize', focusChanged);
    viewport?.addEventListener('resize', focusChanged); viewport?.addEventListener('scroll', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      mobile.removeEventListener('change', focusChanged);
      document.removeEventListener('focusin', focusChanged); document.removeEventListener('focusout', schedule);
      window.removeEventListener('resize', focusChanged);
      viewport?.removeEventListener('resize', focusChanged); viewport?.removeEventListener('scroll', schedule);
      root.style.removeProperty('--estimate-bar'); delete root.dataset.estimateBar;
    };
  }, []);
  return <div className="mobile-estimate-bar" ref={bar} data-suspended="true">
    <span>{d.investment}<strong>{total === null ? '—' : new Intl.NumberFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(total)}</strong></span>
    <a href="#bill" onClick={() => document.getElementById('bill')?.focus({ preventScroll: true })}>{d.viewEstimate}<ArrowUpRight size={17} aria-hidden="true" /></a>
  </div>;
}
