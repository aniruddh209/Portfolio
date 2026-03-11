// ============================================================
//  ANIRUDDH PARMAR — script.js  (v3 ULTRA)
//  Cursor · Jeel-style Globe · Particles · Typewriter
//  Tabs · Proficiency Bars · Reveal · Journey · Form
// ============================================================

/* ══════════════════════════════════════════
   1. CUSTOM CURSOR
══════════════════════════════════════════ */
(function () {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  (function lag() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(lag);
  })();

  const sel = 'a,button,.tab-btn,.proj-card,.skill-pill,.hobby-card,.soc,.tt,.info-card,input,textarea';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(sel)) { dot.classList.add('h'); ring.classList.add('h'); }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(sel)) { dot.classList.remove('h'); ring.classList.remove('h'); }
  });
  document.addEventListener('mousedown', () => { dot.style.transform = 'translate(-50%,-50%) scale(.6)'; });
  document.addEventListener('mouseup', () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; });
})();

/* ══════════════════════════════════════════
   2. STAR / CONSTELLATION PARTICLES
══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [], id;

  const randPt = () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .28,
    vy: (Math.random() - .5) * .28,
    r: Math.random() * 1.3 + .3,
    a: Math.random() * .35 + .08,
  });

  function resize() {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(6,182,212,${.09 * (1 - d / 100)})`;
          ctx.lineWidth = .5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(103,232,249,${p.a})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    id = requestAnimationFrame(frame);
  }

  function init() {
    resize();
    pts = [];
    const n = Math.min(Math.floor(W * H / 11000), 100);
    for (let i = 0; i < n; i++) pts.push(randPt());
    cancelAnimationFrame(id);
    frame();
  }

  addEventListener('resize', init);
  init();
})();

/* ══════════════════════════════════════════
   3. JEEL-STYLE 3D EARTH GLOBE
══════════════════════════════════════════ */
(function () {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('globeCanvas');
  const wrapper = document.getElementById('globeWrapper');
  if (!canvas || !wrapper) return;

  const SIZE = Math.min(wrapper.clientWidth || 440, 440);
  const R = 1; // globe radius

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  // ── Scene + Camera ──
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
  camera.position.z = 2.5;

  // ─────────────────────────────
  //  GLOBE BASE SPHERE (dark)
  // ─────────────────────────────
  const globeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(R, 64, 64),
    new THREE.MeshPhongMaterial({
      color: 0x020e14,
      emissive: 0x010810,
      emissiveIntensity: 1,
      shininess: 20,
      transparent: true,
      opacity: 0.97,
    })
  );
  scene.add(globeMesh);

  // ─────────────────────────────
  //  LATITUDE / LONGITUDE GRID
  // ─────────────────────────────
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: .045 });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(R + .002, 36, 18), gridMat));

  // ─────────────────────────────
  //  CONTINENT DOTS  (Jeel-style)
  //  Using THREE.Points for performance — 900+ dots
  // ─────────────────────────────
  function ll2xyz(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return [
      -(r * Math.sin(phi) * Math.cos(theta)),
      (r * Math.cos(phi)),
      (r * Math.sin(phi) * Math.sin(theta)),
    ];
  }

  // Continent bounding boxes  [latMin, latMax, lonMin, lonMax, count, extraLat spread]
  const continents = [
    // North America
    [20, 70, -160, -60, 160],
    // Central America
    [5, 20, -95, -60, 30],
    // South America
    [-56, 12, -82, -34, 110],
    // Greenland
    [60, 83, -55, -18, 30],
    // Europe
    [36, 71, -10, 32, 130],
    // Scandinavia
    [57, 71, 5, 31, 40],
    // Africa
    [-35, 37, -18, 52, 160],
    // Middle East
    [12, 38, 34, 60, 50],
    // Russia / N.Asia
    [50, 73, 60, 150, 100],
    // Central Asia
    [35, 55, 50, 90, 60],
    // South Asia  (India extra density)
    [5, 35, 65, 92, 100],
    // India dense
    [8, 27, 68, 90, 60],
    // Southeast Asia
    [-10, 22, 95, 145, 80],
    // Japan / Korea
    [30, 45, 125, 145, 40],
    // China
    [20, 53, 80, 135, 90],
    // Australia
    [-44, -10, 112, 155, 80],
    // New Zealand
    [-47, -34, 166, 178, 15],
    // UK + Ireland
    [50, 61, -10, 2, 25],
  ];

  const posArr = [];
  const colArr = [];
  const C1 = new THREE.Color(0x06b6d4);
  const C2 = new THREE.Color(0x34d399);
  const C3 = new THREE.Color(0x67e8f9);

  continents.forEach(([latMin, latMax, lonMin, lonMax, count]) => {
    for (let i = 0; i < count; i++) {
      const lat = latMin + Math.random() * (latMax - latMin);
      const lon = lonMin + Math.random() * (lonMax - lonMin);
      const [x, y, z] = ll2xyz(lat, lon, R + .003);
      posArr.push(x, y, z);
      const rnd = Math.random();
      const c = rnd > .93 ? C3 : rnd > .7 ? C2 : C1;
      colArr.push(c.r, c.g, c.b);
    }
  });

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  dotGeo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3));

  const dotMat = new THREE.PointsMaterial({
    size: .018,
    vertexColors: true,
    transparent: true,
    opacity: .9,
    sizeAttenuation: true,
  });

  const dots = new THREE.Points(dotGeo, dotMat);
  scene.add(dots);

  // ─────────────────────────────
  //  ARC LINES (Jeel-style)
  //  Animated dashed arcs between cities
  // ─────────────────────────────
  const cities = [
    { name: 'Rajkot', lat: 22.3, lon: 70.8 },
    { name: 'New York', lat: 40.7, lon: -74.0 },
    { name: 'London', lat: 51.5, lon: -.12 },
    { name: 'Tokyo', lat: 35.7, lon: 139.7 },
    { name: 'San Francisco', lat: 37.8, lon: -122.4 },
    { name: 'Singapore', lat: 1.35, lon: 103.8 },
    { name: 'Dubai', lat: 25.2, lon: 55.3 },
    { name: 'Sydney', lat: -33.9, lon: 151.2 },
    { name: 'Paris', lat: 48.9, lon: 2.3 },
    { name: 'Berlin', lat: 52.5, lon: 13.4 },
    { name: 'Toronto', lat: 43.7, lon: -79.4 },
  ];

  const HOME = cities[0];
  const arcGroup = new THREE.Group();
  scene.add(arcGroup);

  cities.slice(1).forEach(city => {
    const v0 = new THREE.Vector3(...ll2xyz(HOME.lat, HOME.lon, R + .005));
    const v1 = new THREE.Vector3(...ll2xyz(city.lat, city.lon, R + .005));
    const mid = v0.clone().add(v1).multiplyScalar(.5);
    mid.normalize().multiplyScalar(R + .38 + Math.random() * .18);

    const curve = new THREE.QuadraticBezierCurve3(v0, mid, v1);
    const points = curve.getPoints(80);
    const geo = new THREE.BufferGeometry().setFromPoints(points);

    // Gradient color along arc
    const colors = new Float32Array(points.length * 3);
    const cA = new THREE.Color(0x06b6d4);
    const cB = new THREE.Color(0x34d399);
    for (let i = 0; i < points.length; i++) {
      const t = i / (points.length - 1);
      const c = cA.clone().lerp(cB, t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .45 });
    arcGroup.add(new THREE.Line(geo, mat));
  });

  // ─────────────────────────────
  //  TRAVELING DOTS on arcs
  // ─────────────────────────────
  const travelDots = [];
  const tDotGeo = new THREE.SphereGeometry(.012, 8, 8);
  const tDotMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });

  cities.slice(1, 6).forEach(city => {
    const v0 = new THREE.Vector3(...ll2xyz(HOME.lat, HOME.lon, R + .006));
    const v1 = new THREE.Vector3(...ll2xyz(city.lat, city.lon, R + .006));
    const mid = v0.clone().add(v1).multiplyScalar(.5);
    mid.normalize().multiplyScalar(R + .4);
    const curve = new THREE.QuadraticBezierCurve3(v0, mid, v1);
    const mesh = new THREE.Mesh(tDotGeo, tDotMat.clone());
    scene.add(mesh);
    travelDots.push({ mesh, curve, t: Math.random(), speed: .003 + Math.random() * .003 });
  });

  // ─────────────────────────────
  //  LOCATION MARKERS (pulsing)
  // ─────────────────────────────
  const markerGroup = new THREE.Group();
  scene.add(markerGroup);

  function addMarker(lat, lon, color = 0xef4444, r = .02) {
    const [x, y, z] = ll2xyz(lat, lon, R + .01);
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(r, 10, 10),
      new THREE.MeshBasicMaterial({ color })
    );
    inner.position.set(x, y, z);
    markerGroup.add(inner);

    // Pulsing ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r * 1.3, r * 1.9, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .55, side: THREE.DoubleSide })
    );
    ring.position.set(x, y, z);
    ring.lookAt(0, 0, 0);
    markerGroup.add(ring);
    return { inner, ring };
  }

  const home = addMarker(HOME.lat, HOME.lon, 0xef4444, 0.022);
  const marks = [
    addMarker(40.7, -74.0, 0x06b6d4, .016),
    addMarker(51.5, -.12, 0x10b981, .016),
    addMarker(35.7, 139.7, 0x818cf8, .016),
    addMarker(1.35, 103.8, 0x34d399, .016),
  ];

  // ─────────────────────────────
  //  ATMOSPHERE GLOW SHELLS
  // ─────────────────────────────
  [{ r: R + .04, op: .07 }, { r: R + .10, op: .04 }, { r: R + .22, op: .018 }].forEach(({ r, op }) => {
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(r, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: op, side: THREE.BackSide })
    ));
  });

  // ─────────────────────────────
  //  LIGHTS
  // ─────────────────────────────
  scene.add(new THREE.AmbientLight(0x223344, 1.4));
  const sun = new THREE.DirectionalLight(0x06b6d4, 1.2);
  sun.position.set(4, 2, 4); scene.add(sun);
  const fill = new THREE.DirectionalLight(0x10b981, .45);
  fill.position.set(-4, -2, -3); scene.add(fill);

  // ─────────────────────────────
  //  DRAG INTERACTION
  // ─────────────────────────────
  let dragging = false, prev = { x: 0, y: 0 };
  let velX = 0, velY = 0;
  const globeObjects = [globeMesh, dots, arcGroup, markerGroup];

  function rotAll(ax, ay) {
    globeObjects.forEach(o => { o.rotation.x += ax; o.rotation.y += ay; });
  }

  canvas.addEventListener('mousedown', e => { dragging = true; prev = { x: e.clientX, y: e.clientY }; });
  addEventListener('mouseup', () => { dragging = false; });
  addEventListener('mousemove', e => {
    if (!dragging) return;
    velY = (e.clientX - prev.x) * .005;
    velX = (e.clientY - prev.y) * .005;
    prev = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('touchstart', e => { dragging = true; prev = { x: e.touches[0].clientX, y: e.touches[0].clientY }; e.preventDefault(); }, { passive: false });
  addEventListener('touchend', () => { dragging = false; });
  addEventListener('touchmove', e => {
    if (!dragging) return;
    velY = (e.touches[0].clientX - prev.x) * .005;
    velX = (e.touches[0].clientY - prev.y) * .005;
    prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  // ─────────────────────────────
  //  ANIMATION LOOP
  // ─────────────────────────────
  let t0 = 0;
  function animate(ts) {
    requestAnimationFrame(animate);
    t0 += .005;

    if (!dragging) {
      rotAll(0, .0025);
    } else {
      rotAll(velX, velY);
      velX *= .88; velY *= .88;
    }

    // Pulse home marker
    const pulse = 1 + .3 * Math.sin(t0 * 4);
    home.ring.scale.setScalar(pulse);
    home.ring.material.opacity = .3 + .25 * Math.sin(t0 * 4);

    // Blink other markers
    marks.forEach((m, i) => {
      const p = 1 + .2 * Math.sin(t0 * 3 + i);
      m.ring.scale.setScalar(p);
      m.ring.material.opacity = .25 + .2 * Math.sin(t0 * 3 + i);
    });

    // Sync travelDots with rotation
    travelDots.forEach(d => {
      d.t = (d.t + d.speed) % 1;
      const pos = d.curve.getPoint(d.t);

      // We need to apply the same rotation as globeMesh to the travel dot positions
      const rm = globeMesh.rotation;
      const euler = new THREE.Euler(rm.x, rm.y, rm.z, 'XYZ');
      pos.applyEuler(euler);
      d.mesh.position.copy(pos);
    });

    // Flicker arc opacity
    arcGroup.children.forEach((arc, i) => {
      arc.material.opacity = .3 + .15 * Math.sin(t0 * 1.5 + i);
    });

    renderer.render(scene, camera);
  }
  animate(0);

  // Resize
  addEventListener('resize', () => {
    const s = Math.min(wrapper.clientWidth || 440, 440);
    renderer.setSize(s, s);
  });
})();

/* ══════════════════════════════════════════
   4. NAVBAR — scroll + hamburger
══════════════════════════════════════════ */
(function () {
  const nav = document.getElementById('navbar');
  const hb = document.getElementById('hamburger');
  const nl = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');
  const secs = document.querySelectorAll('section[id]');

  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 40);
    let cur = '';
    secs.forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
    links.forEach(l => { l.classList.toggle('active', l.getAttribute('href') === `#${cur}`); });
  });

  hb?.addEventListener('click', () => { hb.classList.toggle('open'); nl.classList.toggle('open'); });
  links.forEach(l => l.addEventListener('click', () => { hb?.classList.remove('open'); nl?.classList.remove('open'); }));
})();

/* ══════════════════════════════════════════
   5. TYPEWRITER EFFECT
══════════════════════════════════════════ */
(function () {
  const el = document.getElementById('typewriterText');
  if (!el) return;
  const roles = [
    'Full-Stack Developer',
    'Teaching Assistant',
    'ASP.NET Core Expert',
    'MERN Stack Developer',
    'Problem Solver',
    'AI Enthusiast',
  ];
  let ri = 0, ci = 0, del = false;

  (function type() {
    const cur = roles[ri];
    el.textContent = del ? cur.slice(0, ci - 1) : cur.slice(0, ci + 1);
    del ? ci-- : ci++;
    let spd = del ? 52 : 90;
    if (!del && ci === cur.length) { spd = 1800; del = true; }
    else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; spd = 380; }
    setTimeout(type, spd);
  })();
})();

/* ══════════════════════════════════════════
   6. ABOUT TABS
══════════════════════════════════════════ */
(function () {
  const btns = document.querySelectorAll('.tab-btn');
  const types = document.querySelectorAll('.tab-content');

  btns.forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.tab;
    btns.forEach(x => x.classList.remove('active'));
    types.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById(`tab-content-${t}`)?.classList.add('active');
    if (t === 'languages') setTimeout(() => animateLangBars(), 120);
  }));
})();

function animateLangBars() {
  document.querySelectorAll('.lang-fill').forEach(b => b.classList.add('animated'));
}

/* ══════════════════════════════════════════
   7. SCROLL REVEAL + PROFICIENCY BARS
══════════════════════════════════════════ */
(function () {
  const els = document.querySelectorAll('.reveal');
  const bars = document.querySelectorAll('.prof-fill');
  const langBars = document.querySelectorAll('.lang-fill');
  let profAnimated = false;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

  const profObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !profAnimated) {
        profAnimated = true;
        setTimeout(() => bars.forEach(b => b.classList.add('animated')), 200);
      }
    });
  }, { threshold: .3 });

  els.forEach(el => obs.observe(el));
  const profBlock = document.querySelector('.proficiency');
  if (profBlock) profObs.observe(profBlock);
})();

/* ══════════════════════════════════════════
   8. HERO COUNTER ANIMATION
══════════════════════════════════════════ */
(function () {
  const nums = document.querySelectorAll('.hs-num');
  if (!nums.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = parseFloat(el.dataset.target);
      const isFloat = end % 1 !== 0;
      let cur = 0;
      const step = end / 60;
      const timer = setInterval(() => {
        cur += step;
        if (cur >= end) { cur = end; clearInterval(timer); }
        el.textContent = isFloat ? cur.toFixed(2) : Math.floor(cur) + '+';
      }, 25);
      obs.unobserve(el);
    });
  }, { threshold: .5 });

  nums.forEach(n => obs.observe(n));
})();

/* ══════════════════════════════════════════
   9. CONTACT FORM
══════════════════════════════════════════ */
function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('nameInput').value;
  const email = document.getElementById('emailInput').value;
  const msg = document.getElementById('messageInput').value;
  if (!name || !email || !msg) { showToast('❌ Please fill all required fields'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
    btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
    showToast("✅ Message sent! Aniruddh will respond within 24 hours.");
    e.target.reset();
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; btn.style.background = ''; btn.disabled = false; }, 3500);
  }, 1600);
}

/* ══════════════════════════════════════════
   10. TOAST
══════════════════════════════════════════ */
function showToast(msg, dur = 4500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

/* ══════════════════════════════════════════
   11. MOUSE GLOW AURA
══════════════════════════════════════════ */
(function () {
  const g = document.createElement('div');
  Object.assign(g.style, {
    position: 'fixed', pointerEvents: 'none', zIndex: '0',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(6,182,212,.045) 0%,transparent 70%)',
    transform: 'translate(-50%,-50%)',
    transition: 'left .25s ease, top .25s ease',
  });
  document.body.appendChild(g);
  document.addEventListener('mousemove', e => { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; });
})();

/* ══════════════════════════════════════════
   12. SMOOTH ANCHOR SCROLL
══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
