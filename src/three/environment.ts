import * as THREE from 'three';

export function createEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene, dark: boolean) {
  const background = dark ? '#1f2925' : '#e8e9df';
  scene.background = new THREE.Color(background); scene.fog = new THREE.Fog(background, 60, 155);
  const sky = document.createElement('canvas'); sky.width = 1024; sky.height = 512;
  const ctx = sky.getContext('2d')!, gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#738f9d'); gradient.addColorStop(.36, '#dce4df'); gradient.addColorStop(.5, '#f4edce'); gradient.addColorStop(.55, '#899483'); gradient.addColorStop(1, '#424d3c');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 512);
  const sun = ctx.createRadialGradient(720, 135, 3, 720, 135, 75); sun.addColorStop(0, '#ffffff'); sun.addColorStop(.35, '#fffbdc'); sun.addColorStop(1, '#ffffff00');
  ctx.fillStyle = sun; ctx.fillRect(620, 35, 200, 200);
  const skyTexture = new THREE.CanvasTexture(sky); skyTexture.colorSpace = THREE.SRGBColorSpace; skyTexture.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer), target = pmrem.fromEquirectangular(skyTexture); scene.environment = target.texture;
  pmrem.dispose(); skyTexture.dispose();
  const hemi = new THREE.HemisphereLight('#e0ece2', '#52553e', dark ? 2.1 : 2.5); scene.add(hemi);
  const directional = new THREE.DirectionalLight('#fff0ce', 4.2); directional.position.set(-13, 22, 12); directional.castShadow = true;
  directional.shadow.mapSize.set(2048, 2048); directional.shadow.camera.left = directional.shadow.camera.bottom = -27;
  directional.shadow.camera.right = directional.shadow.camera.top = 27; directional.shadow.camera.near = .1; directional.shadow.camera.far = 90;
  directional.shadow.bias = -.0002; directional.shadow.normalBias = .035; directional.shadow.radius = 4;
  scene.add(directional);
  const fill = new THREE.DirectionalLight('#a2c2c0', 1.4); fill.position.set(10, 9, -18); scene.add(fill);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: dark ? '#29342d' : '#d9ddce', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.16; ground.receiveShadow = true; scene.add(ground);
  const grid = new THREE.GridHelper(65, 65, dark ? '#586552' : '#c1c9b4', dark ? '#465140' : '#cbd1c2');
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMaterials.forEach(m => { m.transparent = true; m.opacity = dark ? .11 : .24; }); grid.position.y = -.15; scene.add(grid);

  // Architectural landscaping uses deterministic instancing rather than repeated draws.
  const grasses = new THREE.InstancedMesh(new THREE.ConeGeometry(.08, .65, 3), new THREE.MeshStandardMaterial({ color: dark ? '#6d7959' : '#88946f', roughness: 1 }), 220);
  const dummy = new THREE.Object3D(); let seed = 133;
  const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 220; i++) {
    const side = i < 110 ? -1 : 1;
    dummy.position.set(side * (9 + random() * 1.6), .15 + random() * .07, -6 + random() * 4.5);
    dummy.scale.setScalar(.65 + random() * .65); dummy.rotation.set(random() * .2, random() * 6, random() * .4 - .2); dummy.updateMatrix(); grasses.setMatrixAt(i, dummy.matrix);
  }
  grasses.castShadow = true; scene.add(grasses);
  return { target, directional, hemi, ground, grasses, grid };
}
