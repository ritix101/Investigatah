/* INVESTIGATAH — shared scripts */

// mobile nav
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
if (burger) burger.addEventListener('click', () => navLinks.classList.toggle('open'));

// reveal on scroll
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// stat counters
const cio = new IntersectionObserver(es => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = parseFloat(el.dataset.n), suf = el.dataset.suf || '';
    const t0 = performance.now(), dur = 1600;
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1), v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = (target % 1 ? v.toFixed(1) : Math.round(v)) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    cio.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat .n[data-n]').forEach(el => cio.observe(el));

// terminal typing effect
const termLines = document.getElementById('termLines');
if (termLines) {
  const lines = [
    ['p', '$ trace --chain solana --tx 4xMajQJ…YYBc'],
    ['c', '> resolving hops ................ 14 found'],
    ['w', '> cold wallet identified  ✓'],
    ['w', '> exchange deposit flagged  ✓'],
    ['p', '$ report --format evidence-grade'],
    ['c', '> compiling on-chain proof ...'],
    ['g', '> DOSSIER READY — attribution confirmed'],
  ];
  let li = 0;
  const cls = { p: 'p', c: 'c', w: 'w', g: 'p' };
  function nextLine() {
    if (li >= lines.length) return;
    const [k, txt] = lines[li++];
    const div = document.createElement('div');
    div.className = cls[k];
    termLines.insertBefore(div, termLines.lastElementChild);
    let ci = 0;
    (function type() {
      div.textContent = txt.slice(0, ++ci);
      if (ci < txt.length) setTimeout(type, 14);
      else setTimeout(nextLine, 260);
    })();
  }
  const tio = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { nextLine(); tio.disconnect(); } });
  }, { threshold: 0.4 });
  tio.observe(termLines);
}

// contact form → mailto
const form = document.getElementById('inquiryForm');
if (form) {
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const subject = encodeURIComponent(`[${d.type || 'Investigation'}] Inquiry — ${d.first} ${d.last}`);
    const body = encodeURIComponent(
      `Name: ${d.first} ${d.last}\nEmail: ${d.email}\nCompany: ${d.company || '—'}\nInvestigation Type: ${d.type}\n\nCase details:\n${d.message}`
    );
    window.location.href = `mailto:ritix@investigatah.com?subject=${subject}&body=${body}`;
  });
}

/* ---------- 3D forensic globe + live trace arcs (Three.js) ---------- */
const heroCanvas = document.getElementById('net3d');
if (heroCanvas && window.THREE && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const isMobile = innerWidth < 820;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = isMobile ? 13.5 : 11.5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  heroCanvas.appendChild(renderer.domElement);

  const globe = new THREE.Group();
  scene.add(globe);
  globe.position.x = isMobile ? 0 : 3.4;
  globe.rotation.z = 0.32;

  const R = 4.1;

  // dark occluder sphere — gives the globe real depth
  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(R - 0.06, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x040705, transparent: true, opacity: 0.92 })
  ));

  // fibonacci point field — clean, even, premium
  const N = isMobile ? 500 : 900;
  const pos = new Float32Array(N * 3);
  const pts3 = [];
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = GA * i;
    const v = new THREE.Vector3(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R);
    pts3.push(v);
    pos.set([v.x, v.y, v.z], i * 3);
  }
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  globe.add(new THREE.Points(dotsGeo, new THREE.PointsMaterial({
    color: 0x00e05c, size: 0.045, transparent: true, opacity: 0.75,
    sizeAttenuation: true, depthWrite: false
  })));

  // fine latitude rings — subtle structure
  for (let i = 1; i < 7; i++) {
    const phi = (i / 7) * Math.PI;
    const rr = Math.sin(phi) * R, yy = Math.cos(phi) * R;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(rr, 0.004, 6, 120),
      new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.10 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = yy;
    globe.add(ring);
  }

  // outer halo ring (tilted) — the branded touch
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(R + 1.15, 0.012, 8, 180),
    new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.35 })
  );
  halo.rotation.x = Math.PI / 2.25;
  globe.add(halo);
  const haloDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x9dffc4 })
  );
  globe.add(haloDot);

  // ---- travelling trace arcs ----
  const ARCS = isMobile ? 5 : 8;
  const SEG = 64;
  const arcs = [];
  function surfacePoint() { return pts3[(Math.random() * N) | 0].clone(); }
  function buildArc(a) {
    const p1 = surfacePoint(), p2 = surfacePoint();
    if (p1.distanceTo(p2) < R * 0.7) return buildArc(a); // skip short hops
    const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize()
      .multiplyScalar(R + p1.distanceTo(p2) * 0.42);
    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const arr = new Float32Array((SEG + 1) * 3);
    curve.getPoints(SEG).forEach((p, i) => arr.set([p.x, p.y, p.z], i * 3));
    a.geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    a.geo.setDrawRange(0, 0);
    a.t = -Math.random() * 1.4; // stagger
    a.end = p2;
  }
  for (let i = 0; i < ARCS; i++) {
    const geo = new THREE.BufferGeometry();
    const mat = new THREE.LineBasicMaterial({
      color: 0x00ff66, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const line = new THREE.Line(geo, mat);
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xc8ffdf, transparent: true })
    );
    globe.add(line); globe.add(pulse);
    const a = { geo, mat, line, pulse, t: 0, end: null };
    buildArc(a);
    arcs.push(a);
  }

  // interaction
  let mx = 0, my = 0;
  if (!isMobile) addEventListener('pointermove', e => {
    mx = (e.clientX / innerWidth - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    globe.rotation.y += dt * 0.11;
    globe.rotation.x += ((my * 0.10) - globe.rotation.x) * 0.045;
    halo.rotation.z += dt * 0.22;
    haloDot.position.set(
      Math.cos(t * 0.55) * (R + 1.15),
      Math.sin(t * 0.55) * (R + 1.15) * Math.cos(Math.PI / 2.25) * -1,
      Math.sin(t * 0.55) * (R + 1.15) * Math.sin(Math.PI / 2.25)
    );

    // arcs lifecycle: grow → glow at destination → fade → respawn
    for (const a of arcs) {
      a.t += dt * 0.55;
      if (a.t < 0) { a.line.visible = a.pulse.visible = false; continue; }
      a.line.visible = a.pulse.visible = true;
      if (a.t < 1) {                    // drawing phase
        const n = Math.floor(a.t * SEG);
        a.geo.setDrawRange(0, Math.max(n, 2));
        a.mat.opacity = 0.85;
        const p = a.geo.attributes.position;
        const i = Math.min(n, SEG) * 3;
        a.pulse.position.set(p.array[i], p.array[i + 1], p.array[i + 2]);
        a.pulse.material.opacity = 1;
        a.pulse.scale.setScalar(1);
      } else if (a.t < 1.7) {           // destination glow + fade
        a.geo.setDrawRange(0, SEG + 1);
        const f = 1 - (a.t - 1) / 0.7;
        a.mat.opacity = 0.85 * f;
        a.pulse.position.copy(a.end);
        a.pulse.material.opacity = f;
        a.pulse.scale.setScalar(1 + (1 - f) * 2.4);
      } else buildArc(a);               // respawn
    }

    renderer.render(scene, camera);
  })();
}
