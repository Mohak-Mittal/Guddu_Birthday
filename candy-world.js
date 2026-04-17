/* candy-world.js — Performance-optimised for Android */
(function () {
  var canvas = document.getElementById('glowCanvas');
  var ctx    = canvas.getContext('2d');
  var isMobile = window.innerWidth < 768;
  var EMOJIS = ['🍭','🍬','🧁','🍩','🍪','✨','🌟','🎊','🎀','💫','🌸'];
  var W, H, animId, t = 0;
  var orbs = [], shooters = [];
  var nextShoot = 200;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    isMobile = W < 768;
  }

  function makeOrbs() {
    orbs = [];
    // Fewer orbs on mobile
    var n = isMobile ? Math.min(8, Math.floor(W/80)) : Math.min(18, Math.floor(W/52));
    for (var i = 0; i < n; i++) {
      var z = Math.random();
      orbs.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z: z,
        size: 10 + Math.random() * 20,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        vx: (Math.random()-.5) * .28,
        vy: (Math.random()-.5) * .18,
        spin: Math.random() * Math.PI * 2,
        spinV: (Math.random()-.5) * .014,
        wFreq: .012 + Math.random() * .018,
        wAmp: .25 + Math.random() * .45,
        wOff: Math.random() * Math.PI * 2
      });
    }
  }

  // Stars — pre-compute
  var stars = [];
  function makeStars() {
    stars = [];
    var n = isMobile ? 30 : 60;
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * .55,
        r: .5 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        speed: .003 + Math.random() * .007
      });
    }
  }

  function drawStars() {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = .3 + .65 * Math.abs(Math.sin(t * s.speed + s.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#fffef0';
      if (!isMobile) { ctx.shadowColor = '#ffe8c0'; ctx.shadowBlur = s.r * 4; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Aurora — skip on mobile to save GPU
  function drawAurora() {
    if (isMobile) return;
    var s = Math.sin(t * .0004), c = Math.cos(t * .0003);
    var g = ctx.createLinearGradient(0, H*.15, W, H*.42);
    g.addColorStop(0, 'rgba(0,255,200,' + (.05+.025*s) + ')');
    g.addColorStop(.4, 'rgba(255,100,240,' + (.06+.025*c) + ')');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(W*.5+s*50, H*.27+c*18, W*.62, H*.11, s*.12, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawOrbs() {
    for (var i = 0; i < orbs.length; i++) {
      var p = orbs[i];
      var depth = .35 + p.z * .65;
      var sz    = p.size * depth;
      var alpha = .25 + p.z * .45;

      p.x += p.vx * depth;
      p.y += p.vy * depth + Math.sin(t * p.wFreq + p.wOff) * p.wAmp;
      p.spin += p.spinV;

      if (p.x < -60)    p.x = W + 60;
      if (p.x > W+60)   p.x = -60;
      if (p.y < -60)    p.y = H + 60;
      if (p.y > H+60)   p.y = -60;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      if (!isMobile) { ctx.shadowColor = 'rgba(255,160,220,.6)'; ctx.shadowBlur = sz*.8; }
      ctx.font = sz + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }
  }

  // Shooting stars — desktop only
  function maybeShoot() {
    if (isMobile) return;
    if (t < nextShoot) return;
    nextShoot = t + 200 + Math.random() * 300;
    var ang = .3 + Math.random() * .5;
    shooters.push({
      x: Math.random() * W * .6,
      y: Math.random() * H * .3,
      vx: Math.cos(ang)*8, vy: Math.sin(ang)*8,
      life: 48, max: 48
    });
  }
  function drawShooters() {
    for (var i = shooters.length-1; i >= 0; i--) {
      var s = shooters[i];
      s.x += s.vx; s.y += s.vy; s.life--;
      if (s.life <= 0) { shooters.splice(i,1); continue; }
      var a = s.life / s.max;
      ctx.save();
      ctx.globalAlpha = a * .85;
      ctx.strokeStyle = '#fffef0';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#ffe8a0'; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx*5, s.y - s.vy*5);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Ground glow — lighter on mobile
  function drawGlow() {
    var a = isMobile ? .05 : (.07 + .03 * Math.sin(t*.001));
    var g = ctx.createLinearGradient(0, H*.78, 0, H);
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, 'rgba(200,60,160,' + a + ')');
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, H*.78, W, H*.22); ctx.restore();
  }

  // Main loop — skip frames on mobile
  var frameSkip = 0;
  function loop() {
    animId = requestAnimationFrame(loop);
    // On mobile, run at ~30fps instead of 60fps
    if (isMobile) {
      frameSkip++;
      if (frameSkip % 2 !== 0) return;
    }
    t++;
    ctx.clearRect(0, 0, W, H);
    drawAurora();
    drawStars();
    maybeShoot();
    drawShooters();
    drawOrbs();
    drawGlow();
  }

  // Candy rain — fewer on mobile
  function initRain() {
    var c = document.getElementById('candyRain');
    if (!c) return;
    var set = ['🍭','🍬','🎊','✨','🌟','🍩','🎀','💫','🌸'];
    var count = isMobile ? 10 : 20;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'candy-drop';
      el.textContent = set[Math.floor(Math.random()*set.length)];
      el.style.left     = (Math.random()*100) + '%';
      el.style.fontSize = (.8+Math.random()*.9) + 'rem';
      el.style.opacity  = (.2+Math.random()*.35).toString();
      el.style.animationDuration = (5+Math.random()*6) + 's';
      el.style.animationDelay    = (Math.random()*8) + 's';
      c.appendChild(el);
    }
  }

  window.addEventListener('resize', function() {
    cancelAnimationFrame(animId);
    resize(); makeStars(); makeOrbs(); loop();
  });

  window.addEventListener('load', function() {
    resize(); makeStars(); makeOrbs(); loop(); initRain();
  });
})();