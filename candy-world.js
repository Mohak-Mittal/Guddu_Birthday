/* candy-world.js — Glow canvas + particle system */
(function () {
  const canvas = document.getElementById('glowCanvas');
  const ctx    = canvas.getContext('2d');
  const EMOJIS = ['🍭','🍬','🧁','🍫','🍩','🍪','✨','🌟','🎊','🎀','💫','🌸','💝'];
  let W, H, animId, t = 0;
  const orbs = [], sparks = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // ── Floating glowing orbs ──────────────────────────────────
  function makeOrb() {
    const z = Math.random();
    orbs.push({
      x: Math.random() * W,
      y: Math.random() * H,
      z,
      size: 10 + Math.random() * 24,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      vx: (Math.random() - .5) * .32,
      vy: (Math.random() - .5) * .22,
      spin: Math.random() * Math.PI * 2,
      spinV: (Math.random() - .5) * .016,
      wFreq: .015 + Math.random() * .02,
      wAmp: .3 + Math.random() * .5,
      wOff: Math.random() * Math.PI * 2,
    });
  }

  function initOrbs() {
    orbs.length = 0;
    const n = Math.min(Math.floor(W / 52), 20);
    for (let i = 0; i < n; i++) makeOrb();
  }

  // ── Aurora shimmer layer ───────────────────────────────────
  function drawAurora() {
    const s = Math.sin(t * .0004);
    const c = Math.cos(t * .0003);

    const g1 = ctx.createLinearGradient(0, H * .15, W, H * .45);
    g1.addColorStop(0, `rgba(0,255,200,${.06 + .03 * s})`);
    g1.addColorStop(.4, `rgba(255,100,240,${.07 + .03 * c})`);
    g1.addColorStop(1, 'transparent');

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.ellipse(W * .5 + s * 60, H * .28 + c * 20, W * .65, H * .12, s * .15, 0, Math.PI * 2);
    ctx.fill();

    const g2 = ctx.createLinearGradient(W * .2, H * .3, W * .8, H * .5);
    g2.addColorStop(0, `rgba(255,220,80,${.04 + .02 * c})`);
    g2.addColorStop(.5, `rgba(80,180,255,${.05 + .02 * s})`);
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.ellipse(W * .48 + c * 50, H * .38 + s * 15, W * .55, H * .09, -s * .1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Shooting stars ─────────────────────────────────────────
  let nextShoot = 120;
  function maybeShoot() {
    if (t < nextShoot) return;
    nextShoot = t + 180 + Math.random() * 300;
    const x0 = Math.random() * W * .6;
    const y0 = Math.random() * H * .3;
    const ang = .3 + Math.random() * .5;
    sparks.push({ x:x0, y:y0, vx: Math.cos(ang)*8, vy: Math.sin(ang)*8, life:50, maxLife:50 });
  }

  function drawSparks() {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.life--;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      const a = s.life / s.maxLife;
      ctx.save();
      ctx.globalAlpha = a * .9;
      ctx.strokeStyle = '#fffef0';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffe8a0';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * 5, s.y - s.vy * 5);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Star twinkle overlay ───────────────────────────────────
  const STARS = [];
  function initStars() {
    STARS.length = 0;
    for (let i = 0; i < 60; i++) {
      STARS.push({
        x: Math.random() * W,
        y: Math.random() * H * .55,
        r: .5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        speed: .003 + Math.random() * .008,
      });
    }
  }

  function drawStars() {
    for (const s of STARS) {
      const a = .3 + .7 * Math.abs(Math.sin(t * s.speed + s.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#fffef0';
      ctx.shadowColor = '#ffe8c0';
      ctx.shadowBlur = s.r * 5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── Emoji orbs ─────────────────────────────────────────────
  function drawOrbs() {
    orbs.sort((a, b) => a.z - b.z);
    for (const p of orbs) {
      const depth = .35 + p.z * .65;
      const sz    = p.size * depth;
      const alpha = .28 + p.z * .5;

      p.x += p.vx * depth;
      p.y += p.vy * depth + Math.sin(t * p.wFreq + p.wOff) * p.wAmp;
      p.spin += p.spinV;

      if (p.x < -70)    p.x = W + 70;
      if (p.x > W + 70) p.x = -70;
      if (p.y < -70)    p.y = H + 70;
      if (p.y > H + 70) p.y = -70;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.shadowColor = 'rgba(255,160,220,.7)';
      ctx.shadowBlur  = sz * .9;
      ctx.font        = `${sz}px serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }
  }

  // ── Ground glow pulse ──────────────────────────────────────
  function drawGroundGlow() {
    const a = .08 + .04 * Math.sin(t * .001);
    const g = ctx.createLinearGradient(0, H * .75, 0, H);
    g.addColorStop(0, 'transparent');
    g.addColorStop(.5, `rgba(220,80,180,${a})`);
    g.addColorStop(1, `rgba(180,40,140,${a * 1.5})`);
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, H * .75, W, H * .25); ctx.restore();
  }

  // ── Main loop ──────────────────────────────────────────────
  function loop() {
    t++;
    ctx.clearRect(0, 0, W, H);
    drawAurora();
    drawStars();
    maybeShoot();
    drawSparks();
    drawOrbs();
    drawGroundGlow();
    animId = requestAnimationFrame(loop);
  }

  // ── Candy rain ─────────────────────────────────────────────
  function initRain() {
    const c   = document.getElementById('candyRain');
    if (!c) return;
    const set = ['🍭','🍬','🎊','✨','🌟','🍩','🎀','💫','🌸','💝','⭐'];
    for (let i = 0; i < 22; i++) {
      const el = document.createElement('div');
      el.className = 'candy-drop';
      el.textContent = set[Math.floor(Math.random() * set.length)];
      el.style.left     = Math.random() * 100 + '%';
      el.style.fontSize = (.8 + Math.random() * 1.1) + 'rem';
      el.style.opacity  = (.25 + Math.random() * .45).toString();
      el.style.animationDuration  = (4 + Math.random() * 6) + 's';
      el.style.animationDelay     = (Math.random() * 8) + 's';
      c.appendChild(el);
    }
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize(); initStars(); initOrbs(); loop();
  });

  window.addEventListener('load', () => {
    resize(); initStars(); initOrbs(); loop(); initRain();
  });
})();