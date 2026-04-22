const Space = (() => {
  let canvas, ctx, raf, W, H;
  let progress = 0;
  let focusMode = false;
  let targetOpacity = 1;
  let currentOpacity = 1;
  let T = 0; // timestamp from rAF

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function lerp(a, b, f) { return a + (b - a) * f; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function scale() { return clamp(Math.min(W, H) / 820, 0.42, 1.35); }

  // ── Mouse parallax ─────────────────────────────────────────────────────────
  let mouseX = 0, mouseY = 0, targetMX = 0, targetMY = 0, parallaxTimer;

  // ── Star field — 3 parallax layers ────────────────────────────────────────
  const STAR_LAYERS = [
    { count: 130, sx: 0.006, sy: 0.003, minR: 0.4, maxR: 1.0, a: 0.28 },
    { count: 75,  sx: 0.014, sy: 0.007, minR: 0.8, maxR: 1.6, a: 0.55 },
    { count: 32,  sx: 0.026, sy: 0.013, minR: 1.3, maxR: 2.3, a: 0.85 },
  ];
  let stars = [];

  function initStars() {
    stars = [];
    STAR_LAYERS.forEach((l, li) => {
      for (let i = 0; i < l.count; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r:     rand(l.minR, l.maxR),
          alpha: rand(l.a * 0.5, l.a),
          phase: rand(0, Math.PI * 2),
          spd:   rand(0.009, 0.024),
          sx: l.sx, sy: l.sy,
          warm:  Math.random() < 0.13,
          bright: Math.random() < 0.08, // large bright star with spikes
        });
      }
    });
  }

  // ── Nebulae — 5 large blobs ────────────────────────────────────────────────
  let nebulae = [];

  function initNebulae() {
    nebulae = [
      { bx: 0.06, by: 0.14, rx: 0.36, hue: 243, drift:  0.08 },
      { bx: 0.90, by: 0.18, rx: 0.40, hue: 275, drift: -0.06 },
      { bx: 0.50, by: 0.42, rx: 0.52, hue: 218, drift:  0.03 },
      { bx: 0.22, by: 0.68, rx: 0.34, hue: 195, drift:  0.07 },
      { bx: 0.78, by: 0.62, rx: 0.37, hue: 310, drift: -0.05 },
    ];
  }

  // ── Solar system ───────────────────────────────────────────────────────────
  // Sun sits at bottom-center; orbits are perspective-tilted ellipses
  const TILT   = 0.32;      // y-compression for perspective
  const SUN_BX = 0.50;
  const SUN_BY = 0.84;

  const PLANET_DATA = [
    { name:'mercury', r:3.2,  orbit:72,  spd:0.00044, phase:1.2, col:'#9CA3AF' },
    { name:'venus',   r:5.0,  orbit:118, spd:0.00030, phase:3.5, col:'#FDE68A' },
    { name:'earth',   r:5.5,  orbit:168, spd:0.00022, phase:0.8, col:'#60A5FA',
      moon:{ r:1.8, orbit:16, spd:0.0013 } },
    { name:'mars',    r:4.0,  orbit:222, spd:0.00016, phase:2.2, col:'#F97316' },
    { name:'jupiter', r:11,   orbit:308, spd:0.00010, phase:4.5, col:'#D97706', bands:true },
    { name:'saturn',  r:9,    orbit:395, spd:0.00007, phase:0.3, col:'#FCD34D', rings:true },
    { name:'uranus',  r:6.5,  orbit:472, spd:0.00005, phase:3.0, col:'#67E8F9' },
  ];

  let asteroids = [];

  function initAsteroids() {
    asteroids = [];
    for (let i = 0; i < 65; i++) {
      asteroids.push({
        orbit: rand(254, 278),
        phase: rand(0, Math.PI * 2),
        spd:   rand(0.00008, 0.00014),
        r:     rand(0.7, 2.1),
        alpha: rand(0.22, 0.62),
      });
    }
  }

  function sunXY() { return { x: SUN_BX * W, y: SUN_BY * H }; }

  function orbitXY(cx, cy, radius, angle) {
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * TILT,
    };
  }

  function drawOrbitRing(cx, cy, r, a) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, TILT);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(180,200,255,${a})`;
    ctx.lineWidth = 0.6;
    ctx.setLineDash([4, 11]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawSun() {
    const { x: sx, y: sy } = sunXY();
    const sc  = scale();
    const prog = progress / 100;
    const pulse = 1 + 0.055 * Math.sin(T * 0.0014);
    const r = (22 + prog * 7) * sc * pulse;

    // Multi-layer corona
    [5.8, 4.0, 2.7, 1.8].forEach((mult, i) => {
      const a = (0.022 + 0.010 * prog) * (4 - i) * (0.72 + 0.28 * Math.sin(T * 0.001 + i));
      const g = ctx.createRadialGradient(sx, sy, r * 0.55, sx, sy, r * mult);
      g.addColorStop(0,   `hsla(42,100%,78%,${a * 2.8})`);
      g.addColorStop(0.45,`hsla(32,100%,62%,${a})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, r * mult, 0, Math.PI * 2);
      ctx.fill();
    });

    // Solar rays (10 spokes)
    for (let i = 0; i < 10; i++) {
      const angle  = (i / 10) * Math.PI * 2 + T * 0.000024;
      const rayLen = r * (1.85 + 0.50 * Math.sin(T * 0.0017 + i * 1.2));
      const rayA   = 0.05 + 0.024 * Math.sin(T * 0.0013 + i * 0.75);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      const rg = ctx.createLinearGradient(r * 0.85, 0, rayLen, 0);
      rg.addColorStop(0, `rgba(255,215,55,${rayA})`);
      rg.addColorStop(1, 'rgba(255,140,10,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(r * 0.85, -1.6);
      ctx.lineTo(rayLen, 0);
      ctx.lineTo(r * 0.85,  1.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Sun body gradient
    const sg = ctx.createRadialGradient(sx - r * 0.28, sy - r * 0.28, 0, sx, sy, r);
    sg.addColorStop(0,    'rgba(255,255,228,1)');
    sg.addColorStop(0.30, 'rgba(255,228,88,1)');
    sg.addColorStop(0.65, 'rgba(255,175,18,1)');
    sg.addColorStop(1,    'rgba(228,95,5,1)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // Sunspot texture
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + T * 0.000018;
      const dist  = r * rand(0.15, 0.45);
      const px    = sx + Math.cos(angle) * dist;
      const py    = sy + Math.sin(angle) * dist * 0.6;
      const pr    = r * rand(0.08, 0.18);
      const tg    = ctx.createRadialGradient(px, py, 0, px, py, pr);
      tg.addColorStop(0, 'rgba(160,70,0,0.16)');
      tg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Specular highlight
    const hg = ctx.createRadialGradient(sx - r * 0.24, sy - r * 0.24, 0, sx, sy, r * 0.72);
    hg.addColorStop(0, 'rgba(255,255,255,0.62)');
    hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlanet(px, py, p, angle, sc) {
    const r = p.r * sc;

    // Glow aura
    const ga = ctx.createRadialGradient(px, py, 0, px, py, r * 3.4);
    ga.addColorStop(0, p.col + '2E');
    ga.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ga;
    ctx.beginPath();
    ctx.arc(px, py, r * 3.4, 0, Math.PI * 2);
    ctx.fill();

    // Saturn rings (drawn before planet body so planet overlaps)
    if (p.rings) {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, 0.28);
      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, r * 2.6, 0, Math.PI * 2);
      ctx.strokeStyle = p.col + '55';
      ctx.lineWidth = r * 0.65;
      ctx.stroke();
      // Inner ring
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.85, 0, Math.PI * 2);
      ctx.strokeStyle = p.col + '33';
      ctx.lineWidth = r * 0.32;
      ctx.stroke();
      ctx.restore();
    }

    // Planet body
    const bg = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r);
    switch (p.name) {
      case 'mercury':
        bg.addColorStop(0,'#D1D5DB'); bg.addColorStop(0.5,'#9CA3AF'); bg.addColorStop(1,'#374151'); break;
      case 'venus':
        bg.addColorStop(0,'#FEF08A'); bg.addColorStop(0.5,'#CA8A04'); bg.addColorStop(1,'#713F12'); break;
      case 'earth':
        bg.addColorStop(0,'#93C5FD'); bg.addColorStop(0.45,'#2563EB'); bg.addColorStop(1,'#1E3A5F'); break;
      case 'mars':
        bg.addColorStop(0,'#FCA5A5'); bg.addColorStop(0.5,'#EF4444'); bg.addColorStop(1,'#7F1D1D'); break;
      case 'jupiter':
        bg.addColorStop(0,'#FDE68A'); bg.addColorStop(0.35,'#D97706'); bg.addColorStop(0.7,'#92400E'); bg.addColorStop(1,'#451A03'); break;
      case 'saturn':
        bg.addColorStop(0,'#FEF3C7'); bg.addColorStop(0.5,'#F59E0B'); bg.addColorStop(1,'#78350F'); break;
      case 'uranus':
        bg.addColorStop(0,'#A5F3FC'); bg.addColorStop(0.5,'#22D3EE'); bg.addColorStop(1,'#164E63'); break;
    }
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();

    // Jupiter bands
    if (p.bands) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.clip();
      [-0.32, -0.04, 0.28].forEach(o => {
        ctx.fillStyle = 'rgba(200,138,48,0.20)';
        ctx.fillRect(px - r, py + o * r * 2.2 - 1.8, r * 2, 3.6);
      });
      ctx.restore();
    }

    // Earth clouds
    if (p.name === 'earth') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.clip();
      const ca = T * 0.000028;
      [[0.22,-0.38,0.34],[-0.12,0.28,0.27],[0.48,0.10,0.22]].forEach(([cx,cy,cr]) => {
        const ccx = px + cx * r + Math.cos(ca) * 1.5;
        const ccy = py + cy * r;
        const cg  = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, cr * r);
        cg.addColorStop(0, 'rgba(255,255,255,0.24)');
        cg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(ccx, ccy, cr * r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Atmosphere rim
    const ar = r * 1.26;
    const ag2 = ctx.createRadialGradient(px, py, r * 0.82, px, py, ar);
    ag2.addColorStop(0, 'rgba(0,0,0,0)');
    ag2.addColorStop(1, p.col + '25');
    ctx.fillStyle = ag2;
    ctx.beginPath();
    ctx.arc(px, py, ar, 0, Math.PI * 2);
    ctx.fill();

    // Specular
    const sp = ctx.createRadialGradient(px - r * 0.28, py - r * 0.33, 0, px, py, r * 0.88);
    sp.addColorStop(0, 'rgba(255,255,255,0.28)');
    sp.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sp;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();

    // Moon
    if (p.moon) {
      const ma  = angle * 10 + T * p.moon.spd;
      const mox = Math.cos(ma) * p.moon.orbit * sc;
      const moy = Math.sin(ma) * p.moon.orbit * sc * 0.48;
      const mr  = p.moon.r * sc;
      const mg  = ctx.createRadialGradient(px + mox - mr * 0.2, py + moy - mr * 0.2, 0, px + mox, py + moy, mr);
      mg.addColorStop(0, 'rgba(225,225,225,1)');
      mg.addColorStop(1, 'rgba(100,100,110,1)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(px + mox, py + moy, mr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSolarSystem() {
    const { x: sx, y: sy } = sunXY();
    const sc  = scale();
    const prog = progress / 100;

    // Orbit rings
    PLANET_DATA.forEach(p => {
      drawOrbitRing(sx, sy, p.orbit * sc, lerp(0.045, 0.085, prog));
    });
    drawOrbitRing(sx, sy, 266 * sc, lerp(0.028, 0.055, prog));

    // Asteroids
    asteroids.forEach(a => {
      a.phase += a.spd;
      const pos = orbitXY(sx, sy, a.orbit * sc, a.phase);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, a.r * sc, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(165,155,145,${a.alpha})`;
      ctx.fill();
    });

    // Sort planets by depth (back → front, based on sin of current angle)
    const sorted = PLANET_DATA
      .map(p => ({ ...p, angle: p.phase + T * p.spd }))
      .sort((a, b) => Math.sin(a.angle) - Math.sin(b.angle));

    // Back-half planets (behind sun plane)
    sorted.filter(p => Math.sin(p.angle) < 0).forEach(p => {
      const pos = orbitXY(sx, sy, p.orbit * sc, p.angle);
      drawPlanet(pos.x, pos.y, p, p.angle, sc);
    });

    drawSun();

    // Front-half planets (in front of sun)
    sorted.filter(p => Math.sin(p.angle) >= 0).forEach(p => {
      const pos = orbitXY(sx, sy, p.orbit * sc, p.angle);
      drawPlanet(pos.x, pos.y, p, p.angle, sc);
    });
  }

  // ── Comets ─────────────────────────────────────────────────────────────────
  let comets = [], cometTick = 0;

  function spawnComet() {
    const fromLeft = Math.random() > 0.38;
    comets.push({
      x:  fromLeft ? -30 : rand(W * 0.1, W * 0.9),
      y:  fromLeft ? rand(0, H * 0.55) : -20,
      vx: fromLeft ? rand(4, 9) : rand(1.5, 3.5),
      vy: fromLeft ? rand(1.5, 4.0) : rand(5, 9),
      len: rand(90, 185),
      alpha: 0.85,
      w: rand(1.5, 3.2),
      hue: rand(180, 268),
    });
  }

  // ── Shooting stars ─────────────────────────────────────────────────────────
  let shooters = [], shootTick = 0;

  function spawnShooter() {
    const speed = rand(12, 22);
    const angle = rand(-0.14, 0.06) + Math.PI * (Math.random() < 0.5 ? 0 : 1);
    shooters.push({
      x: rand(W * 0.05, W * 0.95),
      y: rand(H * 0.04, H * 0.52),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + rand(1.5, 4.5),
      len: rand(55, 130),
      life: 1.0,
      w: rand(0.8, 1.8),
      hue: rand(185, 242),
    });
  }

  // ── Burst particles ────────────────────────────────────────────────────────
  let bursts = [];

  function burst(x, y) {
    if (!canvas) return;
    const cx = x != null ? x : W / 2;
    const cy = y != null ? y : H / 2;
    const particles = [];
    // Main radial burst
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2 + rand(-0.22, 0.22);
      const spd   = rand(1.8, 6.8);
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - rand(0.3, 2.2),
        r: rand(1.5, 4.8), a: 1,
        decay: rand(0.015, 0.030),
        hue: rand(200, 295),
      });
    }
    // Outer sparkle ring
    for (let i = 0; i < 14; i++) {
      const angle = rand(0, Math.PI * 2);
      const dist  = rand(18, 55);
      particles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: Math.cos(angle) * rand(0.3, 1.1),
        vy: Math.sin(angle) * rand(0.3, 1.1),
        r: rand(0.8, 2.2), a: 1,
        decay: rand(0.020, 0.038),
        hue: rand(215, 280),
      });
    }
    bursts.push({ particles });
  }

  // ── Draw helpers ───────────────────────────────────────────────────────────

  function drawBg() {
    const p = progress / 100;
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    g.addColorStop(0, `hsl(${lerp(228,255,p)},68%,${lerp(3.0,6.2,p)}%)`);
    g.addColorStop(1, `hsl(${lerp(210,238,p)},58%,${lerp(2.0,4.4,p)}%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawNebulae() {
    const intensity = lerp(0.048, 0.160, progress / 100);
    nebulae.forEach((n, i) => {
      const drift = Math.sin(T * 0.00025 + i * 2.1) * W * 0.022 * Math.sign(n.drift);
      const cx = n.bx * W + drift;
      const cy = n.by * H + Math.cos(T * 0.000165 + i) * H * 0.015;
      const rx = n.rx * W;

      // Primary blob
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      g1.addColorStop(0,    `hsla(${n.hue},86%,66%,${intensity})`);
      g1.addColorStop(0.40, `hsla(${n.hue+18},68%,55%,${intensity * 0.50})`);
      g1.addColorStop(0.72, `hsla(${n.hue-12},74%,44%,${intensity * 0.20})`);
      g1.addColorStop(1,    `hsla(${n.hue},72%,40%,0)`);
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // Inner bright accent
      const g2 = ctx.createRadialGradient(cx + rx * 0.18, cy - rx * 0.14, 0, cx, cy, rx * 0.44);
      g2.addColorStop(0, `hsla(${n.hue+32},92%,78%,${intensity * 0.38})`);
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
    });
  }

  function drawStars() {
    stars.forEach(s => {
      const px = (s.x + mouseX * s.sx * 50 + W * 2) % W;
      const py = (s.y + mouseY * s.sy * 50 + H * 2) % H;
      const tw = 0.48 + 0.52 * Math.sin(T * s.spd + s.phase);
      const colBase = s.warm ? 'rgba(255,215,175,' : 'rgba(215,228,255,';

      if (s.r > 1.3) {
        const gr = s.r * 3.8;
        const glowA = s.warm
          ? `rgba(255,200,140,${s.alpha * tw * 0.40})`
          : `rgba(180,205,255,${s.alpha * tw * 0.40})`;
        const g = ctx.createRadialGradient(px, py, 0, px, py, gr);
        g.addColorStop(0, glowA);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, gr, 0, Math.PI * 2);
        ctx.fill();

        // Diffraction cross-spikes for bright stars
        if (s.bright || s.r > 1.9) {
          const spikeA = s.alpha * tw * 0.22;
          const spikeL = s.r * 5.5;
          ctx.strokeStyle = s.warm
            ? `rgba(255,220,180,${spikeA})`
            : `rgba(200,222,255,${spikeA})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(px - spikeL, py); ctx.lineTo(px + spikeL, py);
          ctx.moveTo(px, py - spikeL); ctx.lineTo(px, py + spikeL);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `${colBase}${s.alpha * tw})`;
      ctx.fill();
    });
  }

  function drawComets() {
    cometTick++;
    const interval = Math.max(140, 530 - progress * 2.8);
    if (cometTick >= interval) { cometTick = 0; if (Math.random() < 0.72) spawnComet(); }

    comets = comets.filter(c => {
      c.x += c.vx; c.y += c.vy; c.alpha -= 0.0062;
      if (c.x > W + 130 || c.y > H + 130 || c.alpha <= 0) return false;

      const angle = Math.atan2(c.vy, c.vx);
      const tx = c.x - Math.cos(angle) * c.len;
      const ty = c.y - Math.sin(angle) * c.len;

      const g = ctx.createLinearGradient(tx, ty, c.x, c.y);
      g.addColorStop(0,   `hsla(${c.hue},80%,80%,0)`);
      g.addColorStop(0.65,`hsla(${c.hue},90%,88%,${c.alpha * 0.60})`);
      g.addColorStop(1,   `hsla(${c.hue},96%,96%,${c.alpha})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = c.w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();

      const hg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 9);
      hg.addColorStop(0, `hsla(${c.hue},100%,97%,${c.alpha})`);
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
  }

  function drawShooters() {
    shootTick++;
    const interval = Math.max(80, 240 - progress * 1.4);
    if (shootTick >= interval) { shootTick = 0; if (Math.random() < 0.52) spawnShooter(); }

    shooters = shooters.filter(s => {
      s.x += s.vx; s.y += s.vy; s.life -= 0.026;
      if (s.life <= 0 || s.x > W + 60 || s.y > H + 60 || s.x < -60) return false;

      const angle = Math.atan2(s.vy, s.vx);
      const tx = s.x - Math.cos(angle) * s.len * s.life;
      const ty = s.y - Math.sin(angle) * s.len * s.life;

      const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
      g.addColorStop(0, `hsla(${s.hue},90%,96%,0)`);
      g.addColorStop(1, `hsla(${s.hue},100%,100%,${s.life * 0.88})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = s.w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.w * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.life * 0.82})`;
      ctx.fill();
      return true;
    });
  }

  function drawBursts() {
    bursts = bursts.filter(b => {
      b.particles = b.particles.filter(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.055;
        p.a  -= p.decay;
        p.r  *= 0.974;
        if (p.a <= 0 || p.r < 0.2) return false;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
        g.addColorStop(0, `hsla(${p.hue},100%,86%,${p.a})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},90%,95%,${p.a})`;
        ctx.fill();
        return true;
      });
      return b.particles.length > 0;
    });
  }

  // ── Main loop ──────────────────────────────────────────────────────────────

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    T = ts;

    currentOpacity = lerp(currentOpacity, targetOpacity, 0.04);
    if (Math.abs(currentOpacity - targetOpacity) > 0.001)
      canvas.style.opacity = currentOpacity.toFixed(3);

    ctx.clearRect(0, 0, W, H);
    drawBg();
    drawNebulae();
    drawStars();
    drawSolarSystem();
    drawComets();
    drawShooters();
    drawBursts();
  }

  // ── Resize ─────────────────────────────────────────────────────────────────
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initStars(); initNebulae(); initAsteroids();
    }, 150);
  }

  function onMouse(e) {
    if (reducedMotion) return;
    targetMX = (e.clientX / W - 0.5) * 2;
    targetMY = (e.clientY / H - 0.5) * 2;
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    initStars(); initNebulae(); initAsteroids();

    window.addEventListener('resize',    onResize, { passive: true });
    window.addEventListener('mousemove', onMouse,  { passive: true });

    if (reducedMotion) {
      ctx.clearRect(0, 0, W, H);
      drawBg(); drawNebulae(); drawStars(); drawSolarSystem();
      return;
    }

    parallaxTimer = setInterval(() => {
      mouseX = lerp(mouseX, targetMX, 0.055);
      mouseY = lerp(mouseY, targetMY, 0.055);
    }, 16);

    raf = requestAnimationFrame(loop);
  }

  function setProgress(pct) { progress = clamp(pct || 0, 0, 100); }
  function setFocusMode(on) { focusMode = !!on; targetOpacity = focusMode ? 0.12 : 1; }

  function destroy() {
    if (raf) cancelAnimationFrame(raf);
    if (parallaxTimer) clearInterval(parallaxTimer);
    window.removeEventListener('resize',    onResize);
    window.removeEventListener('mousemove', onMouse);
  }

  return { init, setProgress, setFocusMode, burst, destroy };
})();
