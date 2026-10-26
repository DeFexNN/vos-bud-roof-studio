'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { defaultConfig, type RoofConfig } from './model';
import { calculateEstimate, type Estimate } from '@/calculators/estimate';
import { restoreConfig } from '@/calculators/validation';
import type { Locale } from '@/i18n/types';
import { productById } from '@/data/materials';

const STORAGE_KEY = 'vos-roof-v1';
interface RoofState {
  config: RoofConfig;
  estimate: Estimate;
  update: (patch: Partial<RoofConfig>) => void;
  selectProduct: (id: string) => void;
  reset: () => void;
  replace: (config: RoofConfig) => void;
  deltaArea: number;
  storageError: boolean;
}
const Context = createContext<RoofState | null>(null);
export function RoofProvider({ children, locale }: { children: ReactNode; locale: Locale }) {
  const [config, setConfig] = useState<RoofConfig>(defaultConfig);
  const [ready, setReady] = useState(false), [storageError, setStorageError] = useState(false), [deltaArea, setDelta] = useState(0);
  const previousArea = useRef<number | null>(null);
  useEffect(() => {
    try {
      const shared = new URLSearchParams(window.location.search).get('roof');
      const value = shared ? JSON.parse(atob(shared.replace(/-/g, '+').replace(/_/g, '/'))) : JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (value) {
        const restored = restoreConfig(value);
        if (restored) setConfig(restored); else setStorageError(true);
      }
    } catch { setStorageError(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* Storage is optional. */ }
  }, [ready, config]);
  useEffect(() => { try { localStorage.setItem('vos-language', locale); } catch { /* Private browsing. */ } }, [locale]);
  const estimate = useMemo(() => calculateEstimate(config), [config]);
  useEffect(() => {
    if (!estimate.valid || !estimate.geometry) return;
    const area = estimate.geometry.grossArea;
    if (previousArea.current !== null) setDelta(area - previousArea.current);
    previousArea.current = area;
  }, [estimate]);
  const value: RoofState = {
    config, estimate, deltaArea, storageError,
    update: patch => setConfig(c => ({ ...c, ...patch })),
    selectProduct: id => {
      if (!productById(id)) return;
      setConfig(c => ({ ...c, productId: id, battenSpacing: null, snowGuards: id === 'venecja' && c.snowGuards }));
    },
    replace: c => { setConfig(c); setStorageError(false); },
    reset: () => { setConfig({ ...defaultConfig }); setStorageError(false); setDelta(0); },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useRoof() {
  const value = useContext(Context);
  if (!value) throw new Error('RoofProvider is required');
  return value;
}
export function encodeConfig(c: RoofConfig) {
  return btoa(JSON.stringify(c)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function clearRoofStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('vos-language');
}
