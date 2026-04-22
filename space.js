const Space = (() => {
  let canvas, ctx, raf, W, H;
  let progress = 0;
  let focusMode = false;
  let targetOpacity = 1;
  let currentOpacity = 1;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Stars ──────────────────────────────────────────────────────────────────

  const LAYERS = [
    { count: 90,  speedX: 0.007, speedY: 0.004, minR: 0.5, maxR: 1.1, alpha: 0.35 },
    { count: 55,  speedX: 0.015, speedY: 0.008, minR: 0.9, maxR: 1.7, alpha: 0.60 },
    { count: 22,  speedX: 0.028, speedY: 0.014, minR: 1.4, maxR: 2.4, alpha: 0.90 },
  ];
  let stars = [];
  let mouseX = 0, mouseY = 0, targetMX = 0, targetMY = 0;

  function initStars() {
    stars = [];
    LAYERS.forEach((l, li) => {
      for (let i = 0; i < l.count; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: rand(l.minR, l.maxR),
          alpha: rand(l.alpha * 0.5, l.alpha),
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.010, 0.028),
          sx: l.speedX, sy: l.speedY, li,
        });
      }
    });
  }

  // ── Nebulae ────────────────────────────────────────────────────────────────

  let nebulae = [];

  function initNebulae() {
    nebulae = [
      { bx: 0.18, by: 0.22, rx: 0.42, ry: 0.38, hue: 243, drift: 0.09 },
      { bx: 0.82, by: 0.72, rx: 0.48, ry: 0.42, hue: 273, drift:-0.07 },
      { bx: 0.50, by: 0.50, rx: 0.55, ry: 0.50, hue: 215, drift: 0.04 },
    ];
  }

  // ── Comets ─────────────────────────────────────────────────────────────────

  let comets = [];
  let cometTick = 0;

  function spawnComet() {
    const fromLeft = Math.random() > 0.4;
    comets.push({
      x: fromLeft ? -30 : rand(W * 0.1, W * 0.9),
      y: fromLeft ? rand(0, H * 0.6) : -20,
      vx: fromLeft ? rand(5, 10) : rand(1.5, 3.5),
      vy: fromLeft ? rand(1.5, 4.0) : rand(5,  9),
      len: rand(80, 170),
      alpha: 0.9,
      w: rand(1.5, 3),
      hue: rand(185, 265),
    });
  }

  // ── Bursts ─────────────────────────────────────────────────────────────────

  let bursts = [];

  function burst(x, y) {
    if (!canvas) return;
    const cx = (x != null ? x : W / 2);
    const cy = (y != null ? y : H / 2);
    const n = 22;
    const particles = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
      const spd   = rand(1.8, 5.5);
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - rand(0.5, 2.5),
        r: rand(1.5, 4.0),
        a: 1,
        decay: rand(0.018, 0.034),
        hue: rand(195, 290),
      });
    }
    bursts.push({ particles });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function rand(a, b) { return a + Math.random() * (b - a); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── Draw ───────────────────────────────────────────────────────────────────

  function drawBg(t) {
    const h1 = lerp(228, 255, progress / 100);
    const h2 = lerp(212, 238, progress / 100);
    const l1 = lerp(3.5, 7, progress / 100);
    const l2 = lerp(2.5, 5, progress / 100);
    const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
    g.addColorStop(0, `hsl(${h1},65%,${l1}%)`);
    g.addColorStop(1, `hsl(${h2},55%,${l2}%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawNebulae(t) {
    const intensity = lerp(0.055, 0.17, progress / 100);
    nebulae.forEach((n, i) => {
      const drift = Math.sin(t * 0.00028 + i * 2.1) * (W * 0.025) * (n.drift > 0 ? 1 : -1);
      const cx = n.bx * W + drift;
      const cy = n.by * H + Math.cos(t * 0.00018 + i) * (H * 0.018);
      const rx = n.rx * W;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      g.addColorStop(0,   `hsla(${n.hue},82%,62%,${intensity})`);
      g.addColorStop(0.45,`hsla(${n.hue+22},65%,52%,${intensity * 0.48})`);
      g.addColorStop(1,   `hsla(${n.hue},72%,42%,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
  }

  function drawStars(t) {
    stars.forEach(s => {
      const px = (s.x + mouseX * s.sx * 55 + W * 2) % W;
      const py = (s.y + mouseY * s.sy * 55 + H * 2) % H;
      const twinkle = 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);

      if (s.r > 1.4) {
        const g = ctx.createRadialGradient(px, py, 0, px, py, s.r * 3.5);
        g.addColorStop(0, `rgba(180,205,255,${s.alpha * twinkle * 0.45})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, s.r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(215,228,255,${s.alpha * twinkle})`;
      ctx.fill();
    });
  }

  function drawComets() {
    // Spawn
    const interval = Math.max(160, 580 - progress * 3.2);
    cometTick++;
    if (cometTick >= interval) { cometTick = 0; if (Math.random() < 0.72) spawnComet(); }

    comets = comets.filter(c => {
      c.x += c.vx; c.y += c.vy; c.alpha -= 0.007;
      if (c.x > W + 120 || c.y > H + 120 || c.alpha <= 0) return false;

      const angle = Math.atan2(c.vy, c.vx);
      const tx = c.x - Math.cos(angle) * c.len;
      const ty = c.y - Math.sin(angle) * c.len;

      const g = ctx.createLinearGradient(tx, ty, c.x, c.y);
      g.addColorStop(0, `hsla(${c.hue},80%,80%,0)`);
      g.addColorStop(1, `hsla(${c.hue},92%,92%,${c.alpha})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = c.w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();

      const hg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 7);
      hg.addColorStop(0, `hsla(${c.hue},100%,96%,${c.alpha})`);
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
  }

  function drawBursts() {
    bursts = bursts.filter(b => {
      b.particles = b.particles.filter(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.07;
        p.a  -= p.decay;
        p.r  *= 0.975;
        if (p.a <= 0 || p.r < 0.2) return false;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.2);
        g.addColorStop(0, `hsla(${p.hue},100%,82%,${p.a})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},90%,92%,${p.a})`;
        ctx.fill();
        return true;
      });
      return b.particles.length > 0;
    });
  }

  // ── Loop ───────────────────────────────────────────────────────────────────

  function loop(t) {
    raf = requestAnimationFrame(loop);

    currentOpacity = lerp(currentOpacity, targetOpacity, 0.04);
    if (Math.abs(currentOpacity - targetOpacity) > 0.001)
      canvas.style.opacity = currentOpacity.toFixed(3);

    ctx.clearRect(0, 0, W, H);
    drawBg(t);
    drawNebulae(t);
    drawStars(t);
    drawComets();
    drawBursts();
  }

  // ── Resize ─────────────────────────────────────────────────────────────────

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initStars();
      initNebulae();
    }, 150);
  }

  // ── Mouse ──────────────────────────────────────────────────────────────────

  let parallaxTimer;
  function onMouse(e) {
    if (reducedMotion) return;
    targetMX = (e.clientX / W - 0.5) * 2;
    targetMY = (e.clientY / H - 0.5) * 2;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  function init() {
    canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    initStars();
    initNebulae();

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });

    if (reducedMotion) {
      // One-shot static render
      ctx.clearRect(0, 0, W, H);
      drawBg(0);
      drawNebulae(0);
      drawStars(0);
      return;
    }

    // Smooth parallax lerp (separate from rAF to avoid drift)
    parallaxTimer = setInterval(() => {
      mouseX = lerp(mouseX, targetMX, 0.055);
      mouseY = lerp(mouseY, targetMY, 0.055);
    }, 16);

    raf = requestAnimationFrame(loop);
  }

  function setProgress(pct) {
    progress = Math.max(0, Math.min(100, pct || 0));
  }

  function setFocusMode(on) {
    focusMode = !!on;
    targetOpacity = focusMode ? 0.12 : 1;
  }

  function destroy() {
    if (raf) cancelAnimationFrame(raf);
    if (parallaxTimer) clearInterval(parallaxTimer);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouse);
  }

  return { init, setProgress, setFocusMode, burst, destroy };
})();
