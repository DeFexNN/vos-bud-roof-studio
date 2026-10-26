import * as THREE from 'three';
import type { LayerId, RoofConfig } from '@/configurator/model';
import type { RoofProduct } from '@/data/materials';
import { colors } from '@/data/materials';
import { type RoofGeometry, type RoofPlane, worldPoint, roofHeightAt, openingPolygon, planeRuns } from '@/calculators/geometry/roof';
import { add, mul, sub, distance, insidePolygon, type V2, type V3 } from '@/calculators/geometry/vector';
import { calculateQuantities, runPositions } from '@/calculators/quantities';
import { glassMaterial, plasterMaterial, roofMaterial, woodMaterial } from './materials';

export interface HouseModel {
  root: THREE.Group;
  layers: Record<LayerId, THREE.Group>;
  roofMaterial: THREE.MeshStandardMaterial;
  measurements: THREE.Group;
}

export function disposeGroup(group: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  group.traverse(o => {
    if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.Sprite) {
      if ('geometry' in o) geometries.add(o.geometry as THREE.BufferGeometry);
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m));
    }
  });
  for (const material of materials) {
    for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    material.dispose();
  }
  textures.forEach(t => t.dispose()); geometries.forEach(g => g.dispose());
}

export function planeGeometry(plane: RoofPlane, lift = 0, holes = true) {
  const shape = new THREE.Shape(plane.polygon.map(p => new THREE.Vector2(...p)));
  if (holes) for (const o of plane.openings) shape.holes.push(new THREE.Path(openingPolygon(o).map(p => new THREE.Vector2(...p))));
  const geometry = new THREE.ShapeGeometry(shape);
  const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(...plane.u), new THREE.Vector3(...plane.v), new THREE.Vector3(...plane.normal));
  basis.setPosition(new THREE.Vector3(...add(plane.origin, mul(plane.normal, lift))));
  geometry.applyMatrix4(basis);
  return geometry;
}

function beamBatch(runs: { a: V3; b: V3; normal: V3 }[], width: number, thickness: number, material: THREE.Material, lift = 0) {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, runs.length);
  const matrix = new THREE.Matrix4(), scale = new THREE.Vector3();
  runs.forEach((run, i) => {
    const a = new THREE.Vector3(...run.a), b = new THREE.Vector3(...run.b), normal = new THREE.Vector3(...run.normal);
    const direction = b.clone().sub(a).normalize(), right = direction.clone().cross(normal).normalize();
    matrix.makeBasis(right, direction, normal);
    matrix.scale(scale.set(width, a.distanceTo(b), thickness));
    matrix.setPosition(a.add(b).multiplyScalar(.5).addScaledVector(normal, lift));
    mesh.setMatrixAt(i, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true; mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function addTiles(p: RoofPlane, product: RoofProduct, material: THREE.MeshStandardMaterial, mobile: boolean, gauge: number) {
  const w = product.system === 'metal' ? .23 : product.effectiveWidth, h = product.system === 'metal' ? .35 : gauge;
  const positions: V2[] = [];
  for (let v = 0; v + h <= p.slopeLength + .001; v += h) for (let u = 0; u + w <= p.width + .001; u += w) {
    const points: V2[] = [[u + .006, v + .006], [u + w - .006, v + .006], [u + w - .006, v + h - .006], [u + .006, v + h - .006]];
    if (points.every(point => insidePolygon(point, p.polygon)) && !p.openings.some(o => u < o.u + o.width && u + w > o.u && v < o.v + o.height && v + h > o.v)) positions.push([u + w / 2, v + h / 2]);
  }
  if (!positions.length || positions.length > (mobile ? 4500 : 9000)) return null;
  const geometry = new THREE.PlaneGeometry(w - .005, h - .006, mobile ? 4 : 8, 3);
  const vertices = geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i) / w + .5, y = vertices.getY(i) / h + .5;
    const wave = Math.pow(Math.max(0, Math.sin(x * Math.PI)), 3) * (product.kind === 'tile' ? .044 : .024);
    vertices.setZ(i, wave + .015 + (1 - y) * .012);
  }
  geometry.computeVertexNormals();
  // No texture stretch: geometry holds the macro-profile, map adds fine surface grain.
  const tileMaterial = material.clone(); tileMaterial.map = null; tileMaterial.bumpMap = null;
  const mesh = new THREE.InstancedMesh(geometry, tileMaterial, positions.length), matrix = new THREE.Matrix4();
  const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(...p.u), new THREE.Vector3(...p.v), new THREE.Vector3(...p.normal));
  positions.forEach(([u, v], i) => {
    matrix.copy(basis).setPosition(new THREE.Vector3(...worldPoint(p, u, v, .075)));
    mesh.setMatrixAt(i, matrix); mesh.setColorAt(i, new THREE.Color().setScalar(.88 + ((i * 31) % 19) / 105));
  });
  mesh.instanceMatrix.needsUpdate = true; mesh.castShadow = !mobile; mesh.receiveShadow = true;
  return mesh;
}

function spriteLabel(text: string) {
  const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 88;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f1f1e7'; ctx.fillRect(0, 0, 384, 88);
  ctx.fillStyle = '#28332b'; ctx.font = '500 33px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 192, 45);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
  sprite.scale.set(2.7, .62, 1); sprite.renderOrder = 20;
  return sprite;
}

export function buildHouse(c: RoofConfig, g: RoofGeometry, product: RoofProduct, mobile = false): HouseModel {
  const root = new THREE.Group(), building = new THREE.Group(); root.add(building);
  const layers = Object.fromEntries(['structure', 'sheathing', 'membrane', 'counter', 'battens', 'covering'].map(id => {
    const group = new THREE.Group(); group.name = id; root.add(group); return [id, group];
  })) as Record<LayerId, THREE.Group>;
  const plaster = plasterMaterial(), wood = woodMaterial(), darkWood = woodMaterial('#6e604b'), glass = glassMaterial();
  const frame = new THREE.MeshStandardMaterial({ color: '#242b28', roughness: .58, metalness: .45 });
  const concrete = new THREE.MeshStandardMaterial({ color: '#aaa89a', roughness: .95 });
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, parent = building) => {
    const mesh = new THREE.Mesh(boxGeometry, material); mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const L = c.length, W = c.width, H = c.height;
  box(L, H - .12, W, 0, H / 2, 0, plaster);
  box(L + .05, .22, W + .05, 0, .13, 0, concrete);
  box(L + .5, .16, W + .5, 0, -.05, 0, concrete);

  // Close the actual roof/wall boundary, including variable mono and hip profiles.
  const makeWallCap = (a: V3, b: V3) => {
    const positions: number[] = [];
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const p = add(a, mul(sub(b, a), i / steps)), q = add(a, mul(sub(b, a), (i + 1) / steps));
      const yp = roofHeightAt(c, g, p[0] * .99999, p[2] * .99999), yq = roofHeightAt(c, g, q[0] * .99999, q[2] * .99999);
      positions.push(p[0], H - .1, p[2], q[0], H - .1, q[2], q[0], yq, q[2], p[0], H - .1, p[2], q[0], yq, q[2], p[0], yp, p[2]);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.computeVertexNormals();
    const mat = plaster.clone(); mat.side = THREE.DoubleSide;
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; building.add(mesh);
  };
  makeWallCap([-L / 2, H, -W / 2], [L / 2, H, -W / 2]);
  makeWallCap([L / 2, H, -W / 2], [L / 2, H, W / 2]);
  makeWallCap([L / 2, H, W / 2], [-L / 2, H, W / 2]);
  makeWallCap([-L / 2, H, W / 2], [-L / 2, H, -W / 2]);

  const windowOnZ = (x: number, z: number, w: number, h: number, base = .38) => {
    box(w + .12, h + .13, .08, x, base + h / 2, z, frame);
    box(w, h, .085, x, base + h / 2, z + .035, glass);
    const parts = Math.max(1, Math.round(w / 1.2));
    for (let i = 1; i < parts; i++) box(.035, h, .11, x - w / 2 + w * i / parts, base + h / 2, z + .095, frame);
    box(w + .2, .045, .23, x, base - .05, z + .09, concrete);
  };
  const glazingWidth = W * .66, glazingHeight = H * .78;
  box(.09, glazingHeight + .16, glazingWidth + .16, L / 2 + .022, .3 + glazingHeight / 2, 0, frame);
  box(.10, glazingHeight, glazingWidth, L / 2 + .065, .3 + glazingHeight / 2, 0, glass);
  for (let i = 1; i < 4; i++) box(.12, glazingHeight, .045, L / 2 + .12, .3 + glazingHeight / 2, -glazingWidth / 2 + glazingWidth * i / 4, frame);
  box(.32, .055, glazingWidth + .4, L / 2 + .05, .25, 0, concrete);

  if (c.type === 'gable' || c.type === 'multi') {
    const peak = roofHeightAt(c, g, L / 2 - .001, 0);
    const half = W * .33, bottom = H + .05, top = peak - .34;
    if (top > bottom + .3) {
      const vertices = [L / 2 + .048, bottom, -half, L / 2 + .048, bottom, half, L / 2 + .048, top, 0];
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, glass); building.add(mesh);
      box(.09, top - bottom, .035, L / 2 + .095, (top + bottom) / 2, 0, frame);
    }
  }
  windowOnZ(L * .19, W / 2 + .012, L * .40, H * .72);
  windowOnZ(-L * .36, W / 2 + .012, Math.max(.7, L * .1), H * .69);
  windowOnZ(0, -W / 2 - .08, L * .46, H * .58, H * .24);
  const slats: THREE.Matrix4[] = [];
  const slatArea = L * .24, start = -L * .22;
  for (let x = start - slatArea / 2; x < start + slatArea / 2; x += .105) {
    const m = new THREE.Matrix4().makeScale(.07, H - .22, .075); m.setPosition(x, H / 2 + .05, W / 2 + .03); slats.push(m);
  }
  const slatMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), darkWood, slats.length);
  slats.forEach((m, i) => slatMesh.setMatrixAt(i, m)); slatMesh.castShadow = true; slatMesh.receiveShadow = true; building.add(slatMesh);
  // A terrace provides scale without altering the measured roof footprint.
  box(L * .62, .12, 1.8, L * .16, .035, W / 2 + 1, concrete);
  for (let z = W / 2 + .15; z < W / 2 + 1.9; z += .16) box(L * .62, .015, .135, L * .16, .106, z, wood);
  box(.26, .06, .13, -L * .12, H * .7, W / 2 + .14, frame);
  const lamp = new THREE.MeshStandardMaterial({ color: '#f9d6a1', emissive: '#efb974', emissiveIntensity: 1.1 });
  box(.16, .018, .11, -L * .12, H * .7 - .038, W / 2 + .14, lamp);

  if (c.type === 'multi') {
    const ww = c.wingWidth, wl = c.wingLength;
    box(ww, H - .1, wl, 0, H / 2, W / 2 + wl / 2, plaster);
    box(ww + .3, .18, wl + .2, 0, .04, W / 2 + wl / 2, concrete);
    const z = W / 2 + wl;
    const height = H + ww / 2 * Math.tan(c.pitch * Math.PI / 180);
    const shape = new THREE.BufferGeometry();
    shape.setAttribute('position', new THREE.Float32BufferAttribute([-ww / 2, H - .12, z, ww / 2, H - .12, z, 0, height, z], 3)); shape.computeVertexNormals();
    building.add(new THREE.Mesh(shape, plaster));
    windowOnZ(0, z + .015, ww * .68, H * .75);
  }

  const color = colors.find(x => x.id === c.color)!.hex;
  const covering = roofMaterial(product, color, c.finish);
  const membrane = new THREE.MeshStandardMaterial({ color: product.kind === 'shingle' ? '#4a4d40' : c.membraneId === 'membrane-red' ? '#ad6252' : '#728370', roughness: .92, side: THREE.DoubleSide });
  const sheathing = woodMaterial('#c9b38d'); sheathing.side = THREE.DoubleSide;
  const q = calculateQuantities(g, product, c);
  const byId = new Map(g.planes.map(p => [p.id, p]));
  for (const p of g.planes) {
    const roof = new THREE.Mesh(planeGeometry(p, .075), covering); roof.castShadow = true; roof.receiveShadow = true; layers.covering.add(roof);
    const underlay = new THREE.Mesh(planeGeometry(p, .015), membrane); underlay.receiveShadow = true; underlay.castShadow = true; layers.membrane.add(underlay);
    if (c.sheathing || product.kind === 'shingle') {
      const deck = new THREE.Mesh(planeGeometry(p, -.015), sheathing); deck.castShadow = true; deck.receiveShadow = true; layers.sheathing.add(deck);
    }
    if (product.kind === 'tile' || product.kind === 'module') {
      const tiles = addTiles(p, product, covering, mobile, c.battenSpacing ?? product.battenSpacing);
      if (tiles) layers.covering.add(tiles);
    } else if (product.kind === 'sheet') {
      const runs: { a: V3; b: V3; normal: V3 }[] = [];
      const spacing = product.system === 'seam' ? product.effectiveWidth : .2256;
      for (let u = .005; u < p.width; u += spacing) for (const [start, end] of planeRuns(p, 0, u)) {
        runs.push({ a: worldPoint(p, u, start), b: worldPoint(p, u, end), normal: p.normal });
      }
      const seamMat = new THREE.MeshStandardMaterial({ color, metalness: .53, roughness: c.finish === 'matte' ? .56 : .28 });
      layers.covering.add(beamBatch(runs, product.system === 'seam' ? .016 : .045, product.system === 'seam' ? .032 : .018, seamMat, .095));
    }
    for (const opening of p.openings) {
      const center = worldPoint(p, opening.u + opening.width / 2, opening.v + opening.height / 2, .10);
      if (opening.kind === 'window') {
        const group = new THREE.Group();
        const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(...p.u), new THREE.Vector3(...p.v), new THREE.Vector3(...p.normal));
        group.quaternion.setFromRotationMatrix(basis); group.position.set(...center);
        box(opening.width + .16, opening.height + .16, .07, 0, 0, 0, frame, group);
        box(opening.width, opening.height, .09, 0, 0, .025, glass, group);
        box(opening.width + .06, .03, .11, 0, 0, .045, frame, group);
        layers.covering.add(group);
      } else {
        const minY = Math.min(...openingPolygon(opening).map(([u, v]) => worldPoint(p, u, v)[1]));
        box(.7, center[1] - minY + 1.35, .7, center[0], (minY + center[1] + 1.35) / 2, center[2], concrete, layers.covering);
        box(.9, .1, .9, center[0], center[1] + 1.35, center[2], frame, layers.covering);
        box(.44, .045, .44, center[0], center[1] + 1.405, center[2], new THREE.MeshStandardMaterial({ color: '#131816' }), layers.covering);
      }
    }
  }
  const battenRuns = q.battens.runs.map(r => ({ ...r, normal: byId.get(r.plane)!.normal }));
  const counterRuns = q.counter.runs.map(r => ({ ...r, normal: byId.get(r.plane)!.normal }));
  if (battenRuns.length) layers.battens.add(beamBatch(battenRuns, .06, .04, wood, .047));
  if (counterRuns.length) layers.counter.add(beamBatch(counterRuns, .05, .025, wood, .025));
  const rafters: { a: V3; b: V3; normal: V3 }[] = [];
  for (const p of g.planes) for (const u of runPositions(p.width, c.rafterSpacing)) for (const [start, end] of planeRuns(p, 0, u)) rafters.push({ a: worldPoint(p, u, start), b: worldPoint(p, u, end), normal: p.normal });
  layers.structure.add(beamBatch(rafters, .08, .20, wood, -.13));
  const ridgeRuns = g.edges.filter(e => e.kind === 'ridge' || e.kind === 'hip' || e.kind === 'valley').map(e => ({ a: e.a, b: e.b, normal: [0, 1, 0] as V3 }));
  layers.structure.add(beamBatch(ridgeRuns, .14, .14, wood, -.23));

  for (const e of g.edges) {
    if (e.kind === 'ridge' || e.kind === 'hip') {
      const dir = new THREE.Vector3(...sub(e.b, e.a)).normalize();
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(product.kind === 'tile' ? .16 : .095, product.kind === 'tile' ? .16 : .095, e.length + .03, 10, 1, true, 0, Math.PI), covering);
      cap.position.set(...mul(add(e.a, e.b), .5)); cap.position.y += .115;
      cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); cap.castShadow = true; layers.covering.add(cap);
    }
    if (e.kind === 'barge' || e.kind === 'eave' || e.kind === 'high') {
      const edgeMaterial = new THREE.MeshStandardMaterial({ color, roughness: .63, metalness: .35 });
      layers.covering.add(beamBatch([{ a: e.a, b: e.b, normal: [0, 1, 0] }], .10, .16, edgeMaterial, -.005));
    }
    if (c.gutters && e.kind === 'eave') {
      const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, e.length, 10, 1, true, 0, Math.PI), frame);
      const direction = new THREE.Vector3(...sub(e.b, e.a)).normalize();
      cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      cylinder.position.set(...mul(add(e.a, e.b), .5)); cylinder.position.y -= .12; cylinder.castShadow = true; building.add(cylinder);
      const count = Math.max(1, Math.ceil(e.length / 10));
      for (let j = 0; j < count; j++) {
        const fraction = count === 1 ? .12 : .08 + j / (count - 1) * .84;
        const p = add(e.a, mul(sub(e.b, e.a), fraction));
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, Math.max(1, p[1] - .26), 8), frame);
        pipe.position.set(p[0], p[1] / 2, p[2]); pipe.castShadow = true; building.add(pipe);
      }
    }
  }
  if (c.snowGuards && product.system === 'metal') {
    const stops: { a: V3; b: V3; normal: V3 }[] = [];
    for (const p of g.planes) for (let u = .25; u < p.width; u += .5) {
      if (insidePolygon([u, .4], p.polygon)) stops.push({ a: worldPoint(p, u, .32, .13), b: worldPoint(p, u, .47, .13), normal: p.normal });
    }
    layers.covering.add(beamBatch(stops, .11, .065, frame));
  }
  Object.entries(layers).forEach(([id, group]) => group.traverse(o => { o.userData.layer = id; }));

  const measurements = new THREE.Group(); root.add(measurements);
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#84957d', transparent: true, opacity: .8 });
  const dimension = (a: V3, b: V3, text: string) => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
    measurements.add(new THREE.Line(geo, lineMaterial));
    for (const p of [a, b]) {
      const mark = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p[0] - .15, p[1] - .15, p[2]), new THREE.Vector3(p[0] + .15, p[1] + .15, p[2])]); measurements.add(new THREE.Line(mark, lineMaterial));
    }
    const label = spriteLabel(text); label.position.set(...mul(add(a, b), .5)); label.position.y += .25; measurements.add(label);
  };
  dimension([-L / 2, .03, W / 2 + 2.5], [L / 2, .03, W / 2 + 2.5], `${L.toFixed(1)} m`);
  dimension([L / 2 + 1.8, .03, -W / 2], [L / 2 + 1.8, .03, W / 2], `${W.toFixed(1)} m`);
  dimension([-L / 2 - 1.2, .1, W / 2], [-L / 2 - 1.2, H, W / 2], `${H.toFixed(1)} m`);
  const mainPlane = g.planes.find(p => p.normal[2] > .05) || g.planes[0];
  if (mainPlane) dimension(worldPoint(mainPlane, mainPlane.width * .62, 0, .25), worldPoint(mainPlane, mainPlane.width * .62, mainPlane.slopeLength, .25), `${mainPlane.slopeLength.toFixed(2)} m`);
  const ridge = g.edges.find(e => e.kind === 'ridge');
  if (ridge) dimension(add(ridge.a, [0, .4, 0]), add(ridge.b, [0, .4, 0]), `${ridge.length.toFixed(2)} m`);
  measurements.visible = false;
  return { root, layers, roofMaterial: covering, measurements };
}
