'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import type RoofSceneType from './RoofScene';
import RoofFallback from './Fallback';
const Scene = dynamic(() => import('./RoofScene'), { ssr: false });
export default function Viewer(props: ComponentProps<typeof RoofSceneType>) {
  const host = useRef<HTMLDivElement>(null), [visible, setVisible] = useState(props.hero || false);
  useEffect(() => {
    if (visible || !host.current) return;
    const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: '350px' });
    observer.observe(host.current); return () => observer.disconnect();
  }, [visible]);
  return <div className="viewer-mount" ref={host}>{visible ? <Scene {...props} /> : <div className="roof-scene deferred-scene"><RoofFallback config={props.config} geometry={props.geometry} /></div>}</div>;
}
