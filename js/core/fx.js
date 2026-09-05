/* 全屏 Canvas 特效：樱花常驻 + 烟花 / 纸屑 / 星光迸溅 + 屏幕震动 */
window.FX = (function () {
  'use strict';
  const U = window.U;

  const canvas = document.createElement('canvas');
  canvas.id = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // 烟花用独立图层，用 destination-out 做拖尾
  const fwCanvas = document.createElement('canvas');
  fwCanvas.id = 'fx-fw';
  fwCanvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fwCanvas);
  const fwCtx = fwCanvas.getContext('2d');

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    [canvas, fwCanvas].forEach(c => {
      c.width = W * DPR; c.height = H * DPR;
      c.style.width = W + 'px'; c.style.height = H + 'px';
      c.getContext('2d').setTransform(DPR, 0, 0, DPR, 0, 0);
    });
  }
  window.addEventListener('resize', resize);
  resize();

  const reduced = U.REDUCED;
  const PETAL_MAX = reduced ? 0 : 26;
  const PARTICLE_CAP = reduced ? 120 : 700;

  const petals = [];
  const parts = []; // 通用粒子（confetti/spark）

  const PETAL_SETS = {
    neon: ['rgba(255,167,196,', 'rgba(255,196,215,', 'rgba(255,143,185,'],
    dawn: ['rgba(255,143,185,', 'rgba(255,183,205,', 'rgba(255,120,170,'],
    matcha: ['rgba(200,255,215,', 'rgba(170,240,190,', 'rgba(235,255,240,'],
    sumi: ['rgba(235,232,225,', 'rgba(205,202,195,', 'rgba(255,255,255,']
  };
  const petalColors = () => PETAL_SETS[document.body.dataset.theme] || PETAL_SETS.neon;

  function newPetal(fromTop) {
    return {
      x: Math.random() * (W + 80) - 40,
      y: fromTop ? -20 - Math.random() * 40 : Math.random() * H,
      vy: 0.35 + Math.random() * 0.75,
      vx: -0.15 - Math.random() * 0.4,
      size: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      sway: 0.6 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      color: U.randItem(petalColors()),
      alpha: 0.5 + Math.random() * 0.45
    };
  }
  for (let i = 0; i < PETAL_MAX; i++) petals.push(newPetal(false));

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color + p.alpha + ')';
    ctx.beginPath();
    ctx.moveTo(0, -p.size / 2);
    ctx.bezierCurveTo(p.size / 2, -p.size / 3, p.size / 2.4, p.size / 3, 0, p.size / 2);
    ctx.bezierCurveTo(-p.size / 2.4, p.size / 3, -p.size / 2, -p.size / 3, 0, -p.size / 2);
    ctx.fill();
    ctx.restore();
  }

  const FW_COLORS = [['#ff7eb6', '#ffd1e3'], ['#7ee8fa', '#e8fbff'], ['#ffd76e', '#fff3c4'], ['#b39dff', '#e6dcff'], ['#8affc1', '#e2fff0']];

  /* 烟花：升空 + 爆裂 */
  const rockets = [];
  function firework(x) {
    if (reduced) return;
    rockets.push({
      x: x != null ? x : W * (0.2 + Math.random() * 0.6),
      y: H + 10,
      vy: -(H * 0.011 + Math.random() * H * 0.004),
      targetY: H * (0.18 + Math.random() * 0.3),
      color: U.randItem(FW_COLORS)
    });
  }
  function explode(x, y, color) {
    const n = reduced ? 24 : 60 + U.rand(30);
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 1.2 + Math.random() * 3.4;
      fwParts.push({
        x, y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        life: 1, decay: 0.008 + Math.random() * 0.012,
        size: 1.2 + Math.random() * 2.2,
        color: Math.random() < 0.5 ? color[0] : color[1]
      });
    }
    window.SFX && window.SFX.firework && window.SFX.firework();
  }

  const fwParts = [];

  /* 纸屑 / 星光 */
  function confetti(x, y, n) {
    n = reduced ? Math.min(20, n) : n;
    for (let i = 0; i < n; i++) {
      if (parts.length > PARTICLE_CAP) break;
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const sp = 3 + Math.random() * 7;
      parts.push({
        kind: 'confetti',
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        g: 0.18, life: 1, decay: 0.008 + Math.random() * 0.008,
        w: 4 + Math.random() * 5, h: 7 + Math.random() * 7,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        color: U.randItem(['#ff7eb6', '#7ee8fa', '#ffd76e', '#b39dff', '#8affc1', '#ffffff'])
      });
    }
  }
  function spark(x, y, color) {
    for (let i = 0; i < (reduced ? 4 : 14); i++) {
      if (parts.length > PARTICLE_CAP) break;
      const ang = Math.random() * Math.PI * 2;
      const sp = 0.8 + Math.random() * 3;
      parts.push({
        kind: 'spark', x, y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        g: 0.05, life: 1, decay: 0.03 + Math.random() * 0.03,
        size: 1 + Math.random() * 2.4,
        color: color || '#ffe9a8'
      });
    }
  }

  function burstAtEl(elm, kind) {
    if (!elm) return;
    const r = elm.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (kind === 'confetti') confetti(x, y, 80);
    else spark(x, y);
  }

  let shakeUntil = 0;
  function shake() {
    if (reduced) return;
    shakeUntil = performance.now() + 280;
    document.body.classList.remove('fx-shake');
    void document.body.offsetWidth;
    document.body.classList.add('fx-shake');
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(50, now - last); last = now;

    ctx.clearRect(0, 0, W, H);
    // 樱花
    if (petals.length < PETAL_MAX && Math.random() < 0.05) petals.push(newPetal(true));
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.phase += 0.012 * dt / 16;
      p.x += (p.vx + Math.sin(p.phase) * p.sway * 0.4) * dt / 16;
      p.y += p.vy * dt / 16;
      p.rot += p.vr * dt / 16;
      if (p.y > H + 30 || p.x < -50) {
        if (petals.length > PETAL_MAX * 0.8) { petals.splice(i, 1); continue; }
        Object.assign(p, newPetal(true));
      }
      drawPetal(p);
    }

    // 通用粒子
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.g * dt / 16;
      p.x += p.vx * dt / 16;
      p.y += p.vy * dt / 16;
      p.life -= p.decay * dt / 16;
      if (p.kind === 'confetti') p.rot += p.vr * dt / 16;
      if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.kind === 'confetti') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // 烟花图层：先淡出上一帧，制造拖尾
    fwCtx.globalCompositeOperation = 'destination-out';
    fwCtx.fillStyle = 'rgba(0,0,0,0.16)';
    fwCtx.fillRect(0, 0, W, H);
    fwCtx.globalCompositeOperation = 'lighter';

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y += r.vy * dt / 16;
      fwCtx.fillStyle = r.color[0];
      fwCtx.beginPath(); fwCtx.arc(r.x, r.y, 2, 0, Math.PI * 2); fwCtx.fill();
      if (r.y <= r.targetY || r.vy >= -0.5) {
        rockets.splice(i, 1);
        explode(r.x, r.y, r.color);
      }
    }
    for (let i = fwParts.length - 1; i >= 0; i--) {
      const p = fwParts[i];
      p.vy += 0.045 * dt / 16;
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx * dt / 16; p.y += p.vy * dt / 16;
      p.life -= p.decay * dt / 16;
      if (p.life <= 0) { fwParts.splice(i, 1); continue; }
      fwCtx.globalAlpha = Math.max(0, p.life);
      fwCtx.fillStyle = p.color;
      fwCtx.beginPath(); fwCtx.arc(p.x, p.y, p.size * p.life + 0.4, 0, Math.PI * 2); fwCtx.fill();
      fwCtx.globalAlpha = 1;
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) last = performance.now();
  });

  /* 樱花暴风雪彩蛋 */
  function sakuraStorm() {
    if (reduced) return;
    for (let i = 0; i < 90; i++) setTimeout(() => {
      const p = newPetal(true);
      p.vy = 2 + Math.random() * 3; p.sway *= 2;
      petals.push(p);
    }, i * 26);
    setTimeout(() => { while (petals.length > PETAL_MAX) petals.shift(); }, 9000);
  }

  return {
    firework, confetti, spark, burstAtEl, shake, sakuraStorm,
    confettiBurst() {
      confetti(W * 0.12, H * 0.72, 60);
      confetti(W * 0.88, H * 0.72, 60);
      if (!reduced) setTimeout(() => confetti(W * 0.5, H * 0.3, 50), 250);
    },
    fireworksShow(n) {
      const c = n || 6;
      for (let i = 0; i < c; i++) setTimeout(() => firework(), i * 320);
    }
  };
})();
