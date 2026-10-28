import * as THREE from 'three';

export function createEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene, dark: boolean) {
  const background = dark ? '#222426' : '#ede9e1';
  scene.background = new THREE.Color(background); scene.fog = new THREE.Fog(background, 60, 155);
  const sky = document.createElement('canvas'); sky.width = 1024; sky.height = 512;
  const ctx = sky.getContext('2d')!, gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, dark ? '#606c77' : '#7a929f');
  gradient.addColorStop(.30, dark ? '#b8c0c2' : '#dce4df');
  gradient.addColorStop(.47, dark ? '#e8d4b5' : '#f4edce');
  gradient.addColorStop(.56, '#695b4e'); gradient.addColorStop(1, '#292724');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 512);
  const sun = ctx.createRadialGradient(720, 135, 3, 720, 135, 75); sun.addColorStop(0, '#ffffff'); sun.addColorStop(.35, '#fffbdc'); sun.addColorStop(1, '#ffffff00');
  ctx.fillStyle = sun; ctx.fillRect(620, 35, 200, 200);
  const skyTexture = new THREE.CanvasTexture(sky); skyTexture.colorSpace = THREE.SRGBColorSpace; skyTexture.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer), target = pmrem.fromEquirectangular(skyTexture); scene.environment = target.texture;
  pmrem.dispose(); skyTexture.dispose();
  const hemi = new THREE.HemisphereLight('#e2e4e8', '#3b3733', dark ? 1.55 : 2.3); scene.add(hemi);
  const directional = new THREE.DirectionalLight('#ffeed6', dark ? 3.6 : 3.8); directional.position.set(-9, 21, 15); directional.castShadow = true;
  directional.shadow.mapSize.set(2048, 2048); directional.shadow.camera.left = directional.shadow.camera.bottom = -27;
  directional.shadow.camera.right = directional.shadow.camera.top = 27; directional.shadow.camera.near = .1; directional.shadow.camera.far = 90;
  directional.shadow.bias = -.0007; directional.shadow.normalBias = .065; directional.shadow.radius = dark ? 4 : 3;
  scene.add(directional);
  const fill = new THREE.DirectionalLight('#c8d0da', dark ? .95 : 1.25); fill.position.set(12, 14, -16); scene.add(fill);
  if (dark) {
    const rim = new THREE.DirectionalLight('#f0ba84', .6); rim.position.set(-14, 8, -12); scene.add(rim);
  }
  // Matte graphite architectural surface: tonal depth, no wood figure.
  const floor = new THREE.MeshStandardMaterial({ color: dark ? '#a0a4a8' : '#ddd6c9', roughness: dark ? .96 : 1, metalness: 0, envMapIntensity: dark ? .3 : 1 });
  if (dark) {
    const gradient = document.createElement('canvas'); gradient.width = gradient.height = 256;
    const gctx = gradient.getContext('2d')!;
    const radial = gctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    radial.addColorStop(0, '#333b44'); radial.addColorStop(.55, '#2b333c'); radial.addColorStop(1, '#232a32');
    gctx.fillStyle = radial; gctx.fillRect(0, 0, 256, 256);
    const floorMap = new THREE.CanvasTexture(gradient);
    floorMap.colorSpace = THREE.SRGBColorSpace; floorMap.wrapS = floorMap.wrapT = THREE.ClampToEdgeWrapping;
    floor.map = floorMap; floor.roughness = .95;
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), floor);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.16; ground.receiveShadow = true; scene.add(ground);
  // Soft contact shadow beneath the model keeps it grounded on the flat surface.
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext('2d')!;
  const contact = sctx.createRadialGradient(128, 128, 30, 128, 128, 126);
  contact.addColorStop(0, 'rgba(10,10,12,.55)'); contact.addColorStop(.5, 'rgba(10,10,12,.25)'); contact.addColorStop(1, 'rgba(10,10,12,0)');
  sctx.fillStyle = contact; sctx.fillRect(0, 0, 256, 256);
  const contactMap = new THREE.CanvasTexture(shadowCanvas);
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ map: contactMap, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  contactShadow.rotation.x = -Math.PI / 2; contactShadow.position.y = -.13; contactShadow.visible = dark; scene.add(contactShadow);
  const grid = new THREE.GridHelper(65, 65, dark ? '#7a838a' : '#b6a58f', dark ? '#4b5257' : '#c8bba9');
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMaterials.forEach(m => { m.transparent = true; m.opacity = dark ? .04 : .14; }); grid.position.y = -.15; grid.visible = !dark; scene.add(grid);

  // Architectural landscaping uses deterministic instancing rather than repeated draws.
  const grasses = new THREE.InstancedMesh(new THREE.ConeGeometry(.08, .65, 3), new THREE.MeshStandardMaterial({ color: dark ? '#6d7959' : '#88946f', roughness: 1 }), 220);
  const dummy = new THREE.Object3D(); let seed = 133;
  const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 220; i++) {
    const side = i < 110 ? -1 : 1;
    dummy.position.set(side * (9 + random() * 1.6), .15 + random() * .07, -6 + random() * 4.5);
    dummy.scale.setScalar(.65 + random() * .65); dummy.rotation.set(random() * .2, random() * 6, random() * .4 - .2); dummy.updateMatrix(); grasses.setMatrixAt(i, dummy.matrix);
  }
  grasses.castShadow = true; grasses.visible = !dark; scene.add(grasses);
  return { target, directional, hemi, ground, grasses, grid, contactShadow };
}
