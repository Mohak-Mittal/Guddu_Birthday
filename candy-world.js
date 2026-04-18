/* candy-world.js — Aggressive mobile optimisation */
(function () {
  var canvas = document.getElementById('glowCanvas');
  var ctx    = canvas.getContext('2d');
  var W, H, animId, t = 0, running = false;

  var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
                 || window.innerWidth < 768;

  // On mobile: stop canvas entirely while envelope is showing
  // Resume only after envelope is dismissed (window._envDone = true)
  var envDone = !document.getElementById('envOverlay'); // if no overlay, start immediately

  var EMOJIS = ['🍭','🍬','🍩','✨','🌟','🎊','🎀','💫'];
  var orbs = [], stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    isMobile = W < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function makeOrbs() {
    orbs = [];
    // Mobile: only 5 orbs, very slow movement
    var n = isMobile ? 5 : 14;
    for (var i = 0; i < n; i++) {
      orbs.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z: Math.random(),
        size: isMobile ? (12 + Math.random()*10) : (10 + Math.random()*20),
        emoji: EMOJIS[Math.floor(Math.random()*EMOJIS.length)],
        vx: (Math.random()-.5) * (isMobile ? .15 : .28),
        vy: (Math.random()-.5) * (isMobile ? .10 : .18),
        spin: Math.random() * Math.PI * 2,
        spinV: (Math.random()-.5) * (isMobile ? .006 : .014),
        wFreq: .008 + Math.random()*.012,
        wAmp: .15 + Math.random()*.3,
        wOff: Math.random() * Math.PI * 2
      });
    }
  }

  function makeStars() {
    stars = [];
    var n = isMobile ? 18 : 55;
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * .5,
        r: .4 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: .002 + Math.random() * .006
      });
    }
  }

  function drawStars() {
    // On mobile: batch all stars in one path, no save/restore per star
    ctx.fillStyle = '#fffef0';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = .25 + .6 * Math.abs(Math.sin(t * s.speed + s.phase));
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawOrbs() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < orbs.length; i++) {
      var p = orbs[i];
      var depth = .4 + p.z * .6;
      var sz    = p.size * depth;
      var alpha = .22 + p.z * .4;

      p.x += p.vx * depth;
      p.y += p.vy * depth + Math.sin(t * p.wFreq + p.wOff) * p.wAmp;
      p.spin += p.spinV;

      if (p.x < -50) p.x = W+50;
      if (p.x > W+50) p.x = -50;
      if (p.y < -50) p.y = H+50;
      if (p.y > H+50) p.y = -50;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      // No shadowBlur on mobile — kills GPU
      ctx.font = sz + 'px serif';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }
  }

  // Mobile loop: ~20fps (every 3rd frame) — smooth but cheap
  // Desktop loop: full 60fps
  var fCount = 0;
  var SKIP = isMobile ? 3 : 1;

  function loop() {
    animId = requestAnimationFrame(loop);

    // Wait for envelope to close before starting on mobile
    if (isMobile && !window._envDone) return;

    fCount++;
    if (fCount % SKIP !== 0) return;

    t++;
    ctx.clearRect(0, 0, W, H);

    if (!isMobile) {
      // Desktop: aurora glow
      var s = Math.sin(t*.0004), c = Math.cos(t*.0003);
      var g = ctx.createLinearGradient(0, H*.15, W, H*.42);
      g.addColorStop(0, 'rgba(0,255,200,'+ (.05+.02*s) +')');
      g.addColorStop(.4, 'rgba(255,100,240,'+ (.06+.02*c) +')');
      g.addColorStop(1, 'transparent');
      ctx.save(); ctx.fillStyle=g;
      ctx.beginPath();
      ctx.ellipse(W*.5, H*.27, W*.6, H*.1, 0, 0, Math.PI*2);
      ctx.fill(); ctx.restore();
    }

    drawStars();
    drawOrbs();

    // Subtle ground glow
    if (!isMobile) {
      var gg = ctx.createLinearGradient(0, H*.8, 0, H);
      gg.addColorStop(0, 'transparent');
      gg.addColorStop(1, 'rgba(200,60,160,.07)');
      ctx.save(); ctx.fillStyle=gg; ctx.fillRect(0,H*.8,W,H*.2); ctx.restore();
    }
  }

  function initRain() {
    var c = document.getElementById('candyRain');
    if (!c) return;
    var set = ['🍭','🍬','✨','🌟','🍩','🎀','💫'];
    var count = isMobile ? 8 : 18;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'candy-drop';
      el.textContent = set[Math.floor(Math.random()*set.length)];
      el.style.left   = (Math.random()*100) + '%';
      el.style.fontSize = (.75+Math.random()*.8) + 'rem';
      el.style.opacity  = (.15+Math.random()*.3).toString();
      el.style.animationDuration = (6+Math.random()*7) + 's';
      el.style.animationDelay    = (Math.random()*10) + 's';
      c.appendChild(el);
    }
  }

  window.addEventListener('resize', function() {
    cancelAnimationFrame(animId);
    resize(); makeStars(); makeOrbs(); SKIP = isMobile ? 3 : 1; loop();
  });

  window.addEventListener('load', function() {
    resize(); makeStars(); makeOrbs();
    SKIP = isMobile ? 3 : 1;
    // Desktop: start immediately. Mobile: loop starts but skips frames until envDone
    if (!isMobile) window._envDone = true;
    loop();
    initRain();
  });
})();