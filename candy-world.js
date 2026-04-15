/* candy-world.js — animated canvas overlay (particles only, bg is SVG) */
(function () {
  const canvas = document.getElementById('candyCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, animId;

  const EMOJIS = ['🍭','🍬','🧁','🍫','🍩','🍪','✨','🌟','🎊','🎀','💫'];
  const particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initParticles() {
    particles.length = 0;
    const n = Math.min(Math.floor(W / 55), 18);
    for (let i = 0; i < n; i++) {
      spawn();
    }
  }

  function spawn() {
    const z = Math.random();
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      z,
      size: (Math.random() * 22 + 10),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25,
      spin: Math.random() * Math.PI * 2,
      spinV: (Math.random() - 0.5) * 0.018,
      wobble: Math.random() * 0.025 + 0.008,
      wPhase: Math.random() * Math.PI * 2,
    });
  }

  let t = 0;
  function loop() {
    t++;
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      const depth = 0.35 + p.z * 0.65;
      const sz    = p.size * depth;
      const alpha = 0.3 + p.z * 0.55;

      p.x += p.vx * depth;
      p.y += p.vy * depth + Math.sin(t * p.wobble + p.wPhase) * 0.4;
      p.spin += p.spinV;

      if (p.x < -60)    p.x = W + 60;
      if (p.x > W + 60) p.x = -60;
      if (p.y < -60)    p.y = H + 60;
      if (p.y > H + 60) p.y = -60;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.shadowColor = 'rgba(255,200,255,0.5)';
      ctx.shadowBlur  = sz * 0.7;
      ctx.font        = `${sz}px serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }

    animId = requestAnimationFrame(loop);
  }

  function initCandyRain() {
    const container = document.getElementById('candyRain');
    if (!container) return;
    const drops = ['🍭','🍬','🎊','✨','🌟','🍩','🎀','💫'];
    for (let i = 0; i < 20; i++) {
      const el = document.createElement('div');
      el.className = 'candy-drop';
      el.textContent = drops[Math.floor(Math.random() * drops.length)];
      el.style.left     = Math.random() * 100 + '%';
      el.style.fontSize = (Math.random() * 1 + 0.8) + 'rem';
      el.style.opacity  = (Math.random() * 0.45 + 0.3).toString();
      el.style.animationDuration  = (Math.random() * 5 + 4) + 's';
      el.style.animationDelay     = (Math.random() * 7) + 's';
      container.appendChild(el);
    }
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    initParticles();
    loop();
  });

  window.addEventListener('load', () => {
    resize();
    initParticles();
    loop();
    initCandyRain();
  });
})();