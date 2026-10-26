'use client';

import { useEffect } from 'react';
import { asset } from '@/lib/site';
export default function Entry() {
  useEffect(() => {
    let locale = 'pl'; try { if (localStorage.getItem('vos-language') === 'en') locale = 'en'; } catch { /* Polish is the default. */ }
    window.location.replace(asset(`/${locale}/`) + window.location.search + window.location.hash);
  }, []);
  return <main style={{ padding: '10vw', minHeight: '100vh' }}><h1>V.O.S_BUD</h1><p style={{ marginBlock: 24 }}>Architektura dachu / Roof architecture</p><a className="button" href={asset('/pl/')}>Polski →</a><a className="button outline" style={{ marginLeft: 16 }} href={asset('/en/')}>English →</a></main>;
}
