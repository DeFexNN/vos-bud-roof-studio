import * as THREE from 'three';
import type { RoofProduct } from '@/data/materials';

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void, color = true) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function noise(ctx: CanvasRenderingContext2D, size: number, amount = .1, seed = 71) {
  const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < size * size / 3; i++) {
    ctx.fillStyle = `rgba(${random() > .5 ? '255,255,255' : '0,0,0'},${random() * amount})`;
    ctx.fillRect(random() * size, random() * size, 1 + random(), 1 + random());
  }
}

export function roofMaterial(product: RoofProduct, color: string, finish: 'matte' | 'satin') {
  const tile = product.kind === 'tile' || product.kind === 'module';
  const map = canvasTexture(512, (ctx, s) => {
    ctx.fillStyle = '#c6c8c7'; ctx.fillRect(0, 0, s, s);
    if (tile) {
      const grad = ctx.createLinearGradient(0, 0, s, 0);
      grad.addColorStop(0, '#828789'); grad.addColorStop(.12, '#d4d7d5'); grad.addColorStop(.34, '#bec4c2'); grad.addColorStop(.77, '#acb3b1'); grad.addColorStop(1, '#727b7a');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#525959'; ctx.fillRect(0, 0, s, 8);
      ctx.fillStyle = '#dce0dc'; ctx.fillRect(0, 9, s, 6);
      ctx.fillStyle = '#68706e'; ctx.fillRect(0, 0, 4, s);
    } else if (product.system === 'seam') {
      ctx.fillStyle = '#d3d6d2'; ctx.fillRect(12, 0, 5, s);
      ctx.fillStyle = '#6c7470'; ctx.fillRect(3, 0, 8, s);
      const grad = ctx.createLinearGradient(18, 0, s, 0);
      grad.addColorStop(0, '#b2b9b6'); grad.addColorStop(.5, '#c4c8c5'); grad.addColorStop(1, '#bec4c0');
      ctx.fillStyle = grad; ctx.fillRect(18, 0, s - 18, s);
    } else if (product.system === 'trapezoid') {
      ctx.fillStyle = '#868f8a'; ctx.fillRect(0, 0, s * .13, s);
      ctx.fillStyle = '#d1d8d3'; ctx.fillRect(s * .13, 0, s * .12, s);
      ctx.fillStyle = '#a3afa7'; ctx.fillRect(s * .25, 0, s * .11, s);
    } else {
      ctx.fillStyle = '#747d76'; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#3b433e'; ctx.fillRect(0, 0, s, 8); ctx.fillRect(0, 0, 5, s);
    }
    noise(ctx, s, product.system === 'shingle' ? .5 : .12);
  });
  const bump = canvasTexture(512, (ctx, s) => {
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, s, s);
    if (tile) {
      const gradient = ctx.createLinearGradient(0, 0, s, 0);
      gradient.addColorStop(0, '#333333'); gradient.addColorStop(.22, '#eeeeee'); gradient.addColorStop(.7, '#888888'); gradient.addColorStop(1, '#333333');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#292929'; ctx.fillRect(0, 0, s, 8);
    } else if (product.system === 'seam') {
      ctx.fillStyle = '#eeeeee'; ctx.fillRect(2, 0, 10, s);
    } else if (product.system === 'trapezoid') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(s * .12, 0, s * .14, s);
    }
    noise(ctx, s, product.system === 'shingle' ? .85 : .17, 37);
  }, false);
  const stepU = product.system === 'metal' ? .23 : product.system === 'trapezoid' ? .2256 : product.system === 'shingle' ? .333 : product.effectiveWidth;
  const stepV = product.kind === 'tile' ? product.battenSpacing : product.system === 'metal' ? .35 : product.system === 'shingle' ? .143 : 1.4;
  for (const texture of [map, bump]) texture.repeat.set(1 / stepU, 1 / stepV);
  const material = new THREE.MeshStandardMaterial({ color, map, bumpMap: bump, bumpScale: tile ? .025 : .008,
    metalness: ['seam', 'trapezoid', 'metal'].includes(product.system) ? .48 : .02,
    roughness: finish === 'satin' ? .33 : product.system === 'shingle' ? .97 : .66,
    side: THREE.DoubleSide, envMapIntensity: 1.25 });
  return material;
}

export function woodMaterial(color = '#aa8060') {
  const map = canvasTexture(256, (ctx, s) => {
    ctx.fillStyle = '#d8cab2'; ctx.fillRect(0, 0, s, s);
    let seed = 91;
    for (let i = 0; i < 110; i++) {
      seed = seed * 16807 % 2147483647;
      const x = seed / 2147483647 * s;
      ctx.strokeStyle = `rgba(72,47,26,${.025 + (i % 9) / 150})`; ctx.lineWidth = .5 + (i % 3);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 5, s * .3, x - 3, s * .7, x + 2, s); ctx.stroke();
    }
  });
  return new THREE.MeshStandardMaterial({ color, map, roughness: .85 });
}

export function plasterMaterial() {
  const map = canvasTexture(256, (ctx, s) => { ctx.fillStyle = '#e4e2db'; ctx.fillRect(0, 0, s, s); noise(ctx, s, .12); });
  return new THREE.MeshStandardMaterial({ color: '#ece9df', map, roughness: .94 });
}

export function glassMaterial() {
  const map = canvasTexture(256, (ctx, s) => {
    const gradient = ctx.createLinearGradient(0, 0, 65, s);
    gradient.addColorStop(0, '#274044'); gradient.addColorStop(.42, '#708e87'); gradient.addColorStop(.46, '#a6b9ac'); gradient.addColorStop(1, '#20352e');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#dfd5ad30'; ctx.fillRect(s * .15, s * .3, s * .55, s * .7);
    ctx.fillStyle = '#fff8dd18';
    for (let x = 40; x < 170; x += 5) ctx.fillRect(x, 100, 2, s);
  });
  return new THREE.MeshStandardMaterial({ color: '#bac5ad', map, metalness: .68, roughness: .17, envMapIntensity: 1.5, emissive: '#4b3722', emissiveIntensity: .14, side: THREE.DoubleSide });
}
