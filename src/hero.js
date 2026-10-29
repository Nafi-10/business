import * as THREE from './assets/three.module.min.js';

const canvas = document.querySelector('#cs-glass-cube');
const stage = document.querySelector('.cs-cube-stage');
const pauseButton = document.querySelector('.cs-cube-pause');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let visible = true;
let frame = 0;
let renderer;

function reflectPause() {
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.setAttribute('aria-label', paused ? 'Play cube animation' : 'Pause cube animation');
  pauseButton.innerHTML = `<span aria-hidden="true">${paused ? '▷' : 'Ⅱ'}</span>`;
}

try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x08152b, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, 0, 7.6);
  const group = new THREE.Group();
  scene.add(group);

  // Studio light panels give the glass physical reflections without remote assets.
  const studio = document.createElement('canvas');
  studio.width = 2048; studio.height = 1024;
  const ctx = studio.getContext('2d');
  ctx.fillStyle = '#102445'; ctx.fillRect(0, 0, 2048, 1024);
  const topGlow = ctx.createLinearGradient(0, 0, 0, 1024);
  topGlow.addColorStop(0, '#6e96b8'); topGlow.addColorStop(.4, '#173961'); topGlow.addColorStop(.7, '#050d22'); topGlow.addColorStop(1, '#152b51');
  ctx.fillStyle = topGlow; ctx.fillRect(0, 0, 2048, 1024);
  ctx.fillStyle = '#eaffff'; ctx.fillRect(200, 100, 300, 360);
  ctx.fillStyle = '#4bbcf5'; ctx.fillRect(530, 160, 100, 500);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(1150, 65, 470, 190);
  ctx.fillStyle = '#bea6ff'; ctx.fillRect(1720, 230, 150, 510);
  ctx.fillStyle = '#159deb'; ctx.fillRect(750, 600, 410, 65);
  const envTexture = new THREE.CanvasTexture(studio);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  envTexture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromEquirectangular(envTexture);
  scene.environment = envTarget.texture;
  envTexture.dispose(); pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xc3e9ff, 0x141038, .45));
  const key = new THREE.DirectionalLight(0xbcecff, 1.4);
  key.position.set(-3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0x087fff, 1.5);
  rim.position.set(4, -1, -2); scene.add(rim);
  const violet = new THREE.DirectionalLight(0x8b63ff, .7);
  violet.position.set(-4, 0, 1); scene.add(violet);

  // Rounded, solid glass cubies: 2 × 2 × 2, matching the reference silhouette.
  const geometry = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8);
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const inner = new THREE.Vector3();
  const radius = .045;
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    inner.copy(vertex).clampScalar(-.5 + radius, .5 - radius);
    vertex.sub(inner).normalize().multiplyScalar(radius).add(inner);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.computeVertexNormals();
  const cubies = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
    const material = new THREE.MeshPhysicalMaterial({
      color: x < 0 && y < 0 ? 0x8c9fe6 : y > 0 ? 0x8bd7ee : 0x4b91cd,
      metalness: .1, roughness: .035, transmission: .9, thickness: 1.25,
      transparent: true, opacity: .9,
      ior: 1.46, clearcoat: 1, clearcoatRoughness: .05,
      attenuationColor: new THREE.Color(x < 0 ? 0x4e60c3 : 0x2684ca), attenuationDistance: 1.5,
      envMapIntensity: 2.6,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const home = new THREE.Vector3(x * .525, y * .525, z * .525);
    mesh.position.copy(home);
    group.add(mesh);
    cubies.push({ mesh, home, x, y, z });
  }

  let rotationX = .38, rotationY = -.55;
  let targetX = .38, targetY = -.55;
  let dragging = false, lastX = 0, lastY = 0, manualUntil = 0;
  let elapsed = 0, lastTime = 0;
  const smoothstep = (value) => { const n = Math.max(0, Math.min(1, value)); return n * n * (3 - 2 * n); };

  function draw(now = performance.now()) {
    frame = 0;
    const delta = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
    lastTime = now;
    if (!paused && !dragging && visible && !document.hidden) elapsed += delta;
    const phase = elapsed % 9;
    const separate = smoothstep((phase - 1.7) / 1.8) * (1 - smoothstep((phase - 5.6) / 2));
    const turn = smoothstep((phase - 2.2) / 2) * (1 - smoothstep((phase - 5.4) / 2));
    if (!dragging && now > manualUntil && !paused) {
      targetX = .38 + Math.sin(elapsed * .27) * .13;
      targetY = -.57 + Math.sin(elapsed * .32) * .25;
    }
    rotationX += (targetX - rotationX) * .09;
    rotationY += (targetY - rotationY) * .09;
    group.rotation.set(rotationX, rotationY, -.1 + Math.sin(elapsed * .22) * .035);
    group.position.y = Math.sin(elapsed * .7) * .055;
    cubies.forEach(({ mesh, home, x, y, z }) => {
      mesh.position.copy(home).multiplyScalar(1 + separate * .38);
      mesh.position.y += separate * y * .09;
      mesh.rotation.set(separate * z * .08, turn * y * .43, separate * x * y * .08);
    });
    renderer.render(scene, camera);
    if ((!paused || dragging || Math.abs(targetX - rotationX) + Math.abs(targetY - rotationY) > .001) && visible && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function wake() { if (!frame && visible && !document.hidden) { lastTime = 0; frame = requestAnimationFrame(draw); } }
  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Fit the complete exploded silhouette inside the canvas at every aspect ratio.
    camera.position.z = Math.max(6.8, 6.6 / camera.aspect);
    camera.updateProjectionMatrix();
    wake();
  }
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake(); else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }, { threshold: .02 }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } else wake();
  });

  canvas.addEventListener('pointerdown', (event) => {
    dragging = true; lastX = event.clientX; lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId); wake();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    targetY += (event.clientX - lastX) * .006;
    targetX = THREE.MathUtils.clamp(targetX + (event.clientY - lastY) * .006, -.9, .9);
    lastX = event.clientX; lastY = event.clientY; manualUntil = performance.now() + 5000; wake();
  });
  const stopDrag = () => { dragging = false; manualUntil = performance.now() + 5000; };
  canvas.addEventListener('pointerup', stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);
  function togglePause() { paused = !paused; reflectPause(); wake(); }
  pauseButton.addEventListener('click', togglePause);
  canvas.addEventListener('keydown', (event) => {
    if (event.code === 'Space') { event.preventDefault(); togglePause(); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    targetY += event.key === 'ArrowLeft' ? -.2 : event.key === 'ArrowRight' ? .2 : 0;
    targetX = THREE.MathUtils.clamp(targetX + (event.key === 'ArrowUp' ? -.2 : event.key === 'ArrowDown' ? .2 : 0), -.9, .9);
    manualUntil = performance.now() + 5000; wake();
  });
  reducedMotion.addEventListener('change', (event) => { paused = event.matches; reflectPause(); wake(); });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    if (frame) cancelAnimationFrame(frame);
    frame = 0; stage.classList.remove('cs-cube-ready');
  });
  canvas.addEventListener('webglcontextrestored', () => { stage.classList.add('cs-cube-ready'); wake(); });
  stage.classList.add('cs-cube-ready');
  reflectPause(); resize();
} catch (error) {
  console.warn('Glass cube: using the lightweight visual fallback.', error);
  canvas.hidden = true;
  document.querySelector('.cs-cube-controls').hidden = true;
}
