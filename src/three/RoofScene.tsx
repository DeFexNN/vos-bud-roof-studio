'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ArrowDownToLine, Box, Eye, Layers, Maximize2, Minus, Plus, RotateCcw, Rotate3D, Ruler, X } from 'lucide-react';
import type { LayerId, RoofConfig } from '@/configurator/model';
import type { RoofGeometry } from '@/calculators/geometry/roof';
import { colors, productById } from '@/data/materials';
import type { Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { buildHouse, disposeGroup, type HouseModel } from './building';
import { createEnvironment } from './environment';
import RoofFallback from './Fallback';

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  house: HouseModel | null;
  dirty: boolean;
  request: () => void;
  rebuild: (config: RoofConfig, geometry: RoofGeometry) => void;
  command: (command: string) => void;
  explode: number;
  targetExplode: number;
  cameraTween: { from: THREE.Vector3; to: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; start: number } | null;
  colorTarget: THREE.Color;
}

export default function RoofScene({ config, geometry, locale, hero = false, exploded = 0, activeLayer = null, onLayer, measurements = false, controls = true }: {
  config: RoofConfig; geometry: RoofGeometry; locale: Locale; hero?: boolean; exploded?: number;
  activeLayer?: LayerId | null; onLayer?: (id: LayerId) => void; measurements?: boolean; controls?: boolean;
}) {
  const mount = useRef<HTMLDivElement>(null), container = useRef<HTMLDivElement>(null), state = useRef<SceneState | null>(null);
  const [ready, setReady] = useState(false), [fallback, setFallback] = useState(false), [full, setFull] = useState(false);
  const d = messages[locale], latest = useRef({ config, geometry, exploded, activeLayer, onLayer, measurements }); latest.current = { config, geometry, exploded, activeLayer, onLayer, measurements };
  const geometryKey = JSON.stringify([config.type, config.length, config.width, config.height, config.pitch, config.overhang, config.ridgeLength, config.wingWidth, config.wingLength,
    config.productId, config.rafterSpacing, config.battenSpacing, config.windows, config.chimneys, config.sheathing, config.insulation, config.gutters, config.snowGuards, config.membraneId]);

  useEffect(() => {
    if (!full) return;
    const old = document.body.style.overflow;
    const parent = container.current?.closest<HTMLElement>('.studio-visual');
    const oldIndex = parent?.style.zIndex || '';
    const previousFocus = document.activeElement as HTMLElement | null;
    if (parent) parent.style.zIndex = '150';
    document.body.style.overflow = 'hidden';
    container.current?.querySelector<HTMLButtonElement>('.fullscreen-close')?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFull(false);
      if (event.key === 'Tab') {
        const buttons = container.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!buttons?.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', close);
    return () => { document.body.style.overflow = old; if (parent) parent.style.zIndex = oldIndex; document.removeEventListener('keydown', close); previousFocus?.focus(); };
  }, [full]);

  useEffect(() => {
    const host = mount.current; if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2', { antialias: true, powerPreference: 'default', preserveDrawingBuffer: true });
      if (!context) throw new Error('WebGL unavailable');
      renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, powerPreference: 'default', preserveDrawingBuffer: true });
    } catch { setFallback(true); return; }
    const mobile = window.innerWidth < 700, reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = hero ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', messages[locale].sceneLabel); renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.dataset.scene = hero ? 'hero' : 'studio';
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), environment = createEnvironment(renderer, scene, hero);
    if (mobile) environment.directional.shadow.mapSize.set(1024, 1024);
    const camera = new THREE.PerspectiveCamera(hero ? 29 : 34, 1, .1, 450);
    const orbit = new OrbitControls(camera, renderer.domElement);
    // OrbitControls.connect() writes `none` inline. Keep native vertical page
    // scrolling and pinch zoom; horizontal drags still rotate the model.
    renderer.domElement.style.touchAction = 'pan-y pinch-zoom';
    orbit.enableDamping = true; orbit.dampingFactor = .085; orbit.enablePan = false;
    orbit.enableZoom = !hero; orbit.minPolarAngle = .025; orbit.maxPolarAngle = Math.PI / 2.03;
    orbit.zoomSpeed = .7; orbit.rotateSpeed = .7; orbit.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    let frameId = 0, visible = true, disposed = false, frameRunning = false;
    const s: SceneState = { renderer, scene, camera, controls: orbit, house: null, dirty: true,
      request: () => { if (!disposed && visible && !frameRunning) { frameRunning = true; frameId = requestAnimationFrame(draw); } },
      rebuild: () => {}, command: () => {}, explode: exploded, targetExplode: exploded, cameraTween: null,
      colorTarget: new THREE.Color(colors.find(c => c.id === latest.current.config.color)!.hex) };
    state.current = s;
    const targetFor = (g: RoofGeometry) => new THREE.Vector3(0, g.maxHeight * .38, latest.current.config.type === 'multi' ? latest.current.config.wingLength * .12 : 0);
    const viewFor = (g: RoofGeometry, view = 'iso') => {
      const size = Math.max(g.bounds.x, g.bounds.z, g.maxHeight * 1.7), target = targetFor(g);
      const aspect = host.clientWidth / Math.max(1, host.clientHeight);
      const factor = (hero ? 1.63 : 1.48) * Math.max(1, 1.3 / aspect);
      if (view === 'top') return { position: target.clone().add(new THREE.Vector3(.001, size * factor * 1.1, .001)), target };
      if (view === 'front') return { position: target.clone().add(new THREE.Vector3(size * factor * 1.5, size * .12, 0)), target };
      return { position: target.clone().add(new THREE.Vector3(size * factor * (hero ? .82 : .88), size * factor * (hero ? .68 : .58), size * factor)), target };
    };
    let currentGeometry = latest.current.geometry;
    const cameraTo = (view: string, immediate = false) => {
      const v = viewFor(currentGeometry, view);
      if (reduced || immediate) { camera.position.copy(v.position); orbit.target.copy(v.target); }
      else s.cameraTween = { from: camera.position.clone(), to: v.position, fromTarget: orbit.target.clone(), toTarget: v.target, start: performance.now() };
      s.dirty = true; s.request();
    };
    s.rebuild = (c, g) => {
      const oldSize = Math.max(currentGeometry.bounds.x, currentGeometry.bounds.z, currentGeometry.maxHeight * 1.7);
      const newSize = Math.max(g.bounds.x, g.bounds.z, g.maxHeight * 1.7);
      if (s.house && Math.abs(oldSize - newSize) > .01) {
        const relative = camera.position.clone().sub(orbit.target).multiplyScalar(newSize / oldSize);
        camera.position.copy(relative.add(targetFor(g)));
      }
      currentGeometry = g;
      if (s.house) { scene.remove(s.house.root); disposeGroup(s.house.root); }
      s.house = buildHouse(c, g, productById(c.productId)!, mobile); scene.add(s.house.root);
      s.house.measurements.visible = latest.current.measurements;
      const size = Math.max(g.bounds.x, g.bounds.z);
      orbit.minDistance = size * .8; orbit.maxDistance = size * 5;
      s.colorTarget.set(colors.find(x => x.id === c.color)!.hex);
      orbit.target.copy(targetFor(g)); s.dirty = true; s.request();
    };
    const draw = (now: number) => {
      frameRunning = false;
      if (!visible || disposed) return;
      let animate = false;
      if (s.cameraTween) {
        const tween = s.cameraTween, progress = Math.min(1, (now - tween.start) / (hero ? 1900 : 750));
        const ease = 1 - Math.pow(1 - progress, 3);
        camera.position.lerpVectors(tween.from, tween.to, ease); orbit.target.lerpVectors(tween.fromTarget, tween.toTarget, ease);
        animate = true; if (progress === 1) s.cameraTween = null;
      }
      if (Math.abs(s.explode - s.targetExplode) > .002) { s.explode += (s.targetExplode - s.explode) * .11; animate = true; }
      else s.explode = s.targetExplode;
      if (s.house) {
        const order: LayerId[] = ['structure', 'sheathing', 'membrane', 'counter', 'battens', 'covering'];
        order.forEach((id, i) => { s.house!.layers[id].position.y = s.explode * i * .60; });
        const old = s.house.roofMaterial.color;
        if (Math.max(Math.abs(old.r - s.colorTarget.r), Math.abs(old.g - s.colorTarget.g), Math.abs(old.b - s.colorTarget.b)) > .002) {
          old.lerp(s.colorTarget, reduced ? 1 : .18); animate = true;
          s.house.layers.covering.traverse(o => {
            if (o instanceof THREE.InstancedMesh) {
              const material = o.material as THREE.MeshStandardMaterial;
              if (material !== s.house!.roofMaterial) material.color?.lerp(s.colorTarget, reduced ? 1 : .18);
            }
          });
        }
      }
      const changed = orbit.update();
      if (s.dirty || changed || animate) {
        renderer.render(scene, camera); s.dirty = false;
        const canvas = renderer.domElement;
        canvas.dataset.area = currentGeometry.grossArea.toFixed(6);
        canvas.dataset.planes = String(currentGeometry.planes.length);
        canvas.dataset.exploded = String(s.explode.toFixed(2));
        canvas.dataset.drawCalls = String(renderer.info.render.calls);
      }
      if (animate || changed) s.request();
    };
    s.rebuild(latest.current.config, latest.current.geometry);
    cameraTo('iso', true);
    if (hero && !reduced) {
      const end = camera.position.clone(), target = orbit.target.clone();
      camera.position.add(new THREE.Vector3(6, 4, -4));
      s.cameraTween = { from: camera.position.clone(), to: end, fromTarget: target.clone(), toTarget: target, start: performance.now() };
    }
    s.command = cmd => {
      if (cmd === 'top' || cmd === 'front' || cmd === 'iso') { cameraTo(cmd); return; }
      s.cameraTween = null;
      const relative = camera.position.clone().sub(orbit.target);
      if (cmd === 'rotate') relative.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 6);
      if (cmd === 'in' || cmd === 'out') relative.multiplyScalar(cmd === 'in' ? .86 : 1.16).clampLength(orbit.minDistance, orbit.maxDistance);
      camera.position.copy(relative.add(orbit.target)); s.dirty = true; s.request();
    };
    let previousFit = Math.max(1, 1.3 / (host.clientWidth / Math.max(1, host.clientHeight)));
    const resize = new ResizeObserver(() => {
      if (!host.clientWidth || !host.clientHeight) return;
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / host.clientHeight;
      // Keep the full house on narrow canvases without changing the viewing angle.
      const fit = Math.max(1, 1.3 / camera.aspect);
      if (Math.abs(fit - previousFit) > .001) {
        s.cameraTween = null;
        camera.position.sub(orbit.target).multiplyScalar(fit / previousFit).add(orbit.target);
      }
      previousFit = fit;
      camera.updateProjectionMatrix();
      s.dirty = true; s.request();
    }); resize.observe(host);
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) { s.dirty = true; s.request(); }
    }, { rootMargin: '100px' }); observer.observe(host);
    const change = () => { s.dirty = true; s.request(); }, start = () => { s.cameraTween = null; };
    orbit.addEventListener('change', change); orbit.addEventListener('start', start);
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    let pointerStart: [number, number] = [0, 0];
    const down = (event: PointerEvent) => { pointerStart = [event.clientX, event.clientY]; };
    const select = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) > 6 || !s.house || s.targetExplode < .15) return;
      const box = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const objects = raycaster.intersectObject(s.house.root, true);
      const hit = objects.find(o => o.object.userData.layer);
      if (hit) latest.current.onLayer?.(hit.object.userData.layer as LayerId);
    };
    renderer.domElement.addEventListener('pointerdown', down); renderer.domElement.addEventListener('pointerup', select);
    const lost = (event: Event) => { event.preventDefault(); visible = false; setFallback(true); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    const capture = (event: Event) => {
      const detail = (event as CustomEvent<{ resolve: (image: string) => void }>).detail;
      renderer.render(scene, camera); detail.resolve(renderer.domElement.toDataURL('image/png'));
    };
    renderer.domElement.addEventListener('vos-capture', capture);
    setReady(true); s.request();
    return () => {
      disposed = true; cancelAnimationFrame(frameId); resize.disconnect(); observer.disconnect(); orbit.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', lost); renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointerup', select); renderer.domElement.removeEventListener('vos-capture', capture);
      disposeGroup(scene); environment.target.dispose(); renderer.dispose();
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
      state.current = null;
    };
    // A renderer is mounted once. Parametric updates are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero]);
  useEffect(() => { if (state.current) state.current.rebuild(config, geometry); }, [geometryKey]);
  useEffect(() => {
    const s = state.current; if (!s) return;
    s.targetExplode = exploded;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) s.explode = exploded;
    if (s.house) {
      s.house.measurements.visible = measurements;
      const target = colors.find(c => c.id === config.color)!; s.colorTarget.set(target.hex);
      s.house.roofMaterial.roughness = config.finish === 'matte' ? .66 : .3;
      Object.entries(s.house.layers).forEach(([id, group]) => {
        group.traverse(o => {
          if (!(o instanceof THREE.Mesh)) return;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const mat of mats) if (mat instanceof THREE.MeshStandardMaterial) {
            mat.emissive.set(id === activeLayer && exploded > .1 ? '#795234' : '#000000'); mat.emissiveIntensity = .14;
          }
        });
      });
    }
    s.dirty = true; s.request();
  }, [exploded, activeLayer, measurements, config.color, config.finish, ready, geometryKey]);

  const command = (cmd: string) => state.current?.command(cmd);
  return <div className={`roof-scene ${hero ? 'hero-scene' : ''} ${full ? 'scene-fullscreen' : ''}`} ref={container} role={full ? 'dialog' : undefined} aria-modal={full ? true : undefined} aria-label={full ? d.sceneLabel : undefined}>
    <div ref={mount} className={`scene-canvas ${fallback ? 'is-fallback' : ''}`} />
    {!ready && !fallback && <div className="scene-loading"><Box size={25} strokeWidth={1} /><span>{d.loading3d}</span><i /></div>}
    {fallback && <div className="scene-fallback"><RoofFallback config={config} geometry={geometry} /><p>{d.fallback}</p></div>}
    {controls && !fallback && (hero ? <div className="scene-toolbar hero-scene-tools"><span>{d.heroDrag}</span><div><button onClick={() => command('rotate')} aria-label={d.rotate} title={d.rotate}><Rotate3D size={19} /></button><button onClick={() => command('iso')} aria-label={d.resetView} title={d.resetView}><RotateCcw size={18} /></button></div></div> : <div className="scene-toolbar" aria-label={d.sceneLabel}>
      <div className="camera-views"><button onClick={() => command('iso')} aria-label={d.isometric} title={d.isometric}><Box size={18} /></button><button onClick={() => command('top')} aria-label={d.topView} title={d.topView}><ArrowDownToLine size={18} /></button><button onClick={() => command('front')} aria-label={d.frontView} title={d.frontView}><Eye size={18} /></button></div>
      <div><button onClick={() => command('rotate')} aria-label={d.rotate} title={d.rotate}><Rotate3D size={19} /></button><button onClick={() => command('in')} aria-label={d.zoomIn} title={d.zoomIn}><Plus size={20} /></button><button onClick={() => command('out')} aria-label={d.zoomOut} title={d.zoomOut}><Minus size={20} /></button><button onClick={() => command('iso')} aria-label={d.resetView} title={d.resetView}><RotateCcw size={17} /></button><button onClick={() => setFull(!full)} aria-label={full ? d.exitFullscreen : d.fullscreen} title={d.fullscreen}>{full ? <X size={20} /> : <Maximize2 size={17} />}</button></div>
    </div>)}
    {full && <button className="fullscreen-close icon-button" onClick={() => setFull(false)} aria-label={d.exitFullscreen}><X /></button>}
  </div>;
}

export async function captureRoofScene(): Promise<string | undefined> {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-scene="studio"]') || document.querySelector<HTMLCanvasElement>('canvas[data-scene="hero"]');
  if (!canvas) return undefined;
  return new Promise(resolve => {
    const timer = window.setTimeout(() => resolve(undefined), 800);
    canvas.dispatchEvent(new CustomEvent('vos-capture', { detail: { resolve: (image: string) => { window.clearTimeout(timer); resolve(image); } } }));
  });
}
