/* envelope.js — iOS Safari fix + Android optimised */
(function () {

  var overlay  = document.getElementById('envOverlay');
  var envelope = document.getElementById('envelope');
  var audio    = document.getElementById('bgMusic');

  if (!overlay || !envelope) return;

  var opened = false;

  function burstHearts(cx, cy) {
    var items = ['💕','✨','🌸','⭐','🎀','💫','🎊','💖'];
    for (var i = 0; i < 14; i++) {
      var el = document.createElement('div');
      el.className = 'burst-heart';
      var angle = (i / 14) * Math.PI * 2;
      var dist  = 50 + Math.random() * 90;
      var tx = 'translate(' + (Math.cos(angle)*dist) + 'px,' + (Math.sin(angle)*dist-50) + 'px)';
      var rot = ((Math.random()-.5)*110) + 'deg';
      el.style.cssText =
        'left:'+(cx-12)+'px;top:'+(cy-12)+'px;' +
        '--tx:'+tx+';--rot:'+rot+';' +
        'animation-duration:'+(.75+Math.random()*.45)+'s;' +
        'animation-delay:'+(Math.random()*.08)+'s;';
      el.textContent = items[Math.floor(Math.random()*items.length)];
      document.body.appendChild(el);
      setTimeout(function(){ el.remove(); }, 1400);
    }
  }

  function openEnvelope(e) {
    if (opened) return;
    opened = true;

    e.preventDefault();
    e.stopPropagation();

    var cx = (e.changedTouches && e.changedTouches.length)
      ? e.changedTouches[0].clientX : (e.clientX || window.innerWidth/2);
    var cy = (e.changedTouches && e.changedTouches.length)
      ? e.changedTouches[0].clientY : (e.clientY || window.innerHeight/2);

    burstHearts(cx, cy);
    if (navigator.vibrate) navigator.vibrate([25,15,25]);

    // ── iOS Safari fix ──────────────────────────────────────
    // Rules:
    // 1. Do NOT set audio.volume before .play() — iOS ignores play() if you do
    // 2. Call .play() with NO awaits/promises in between — must be synchronous
    // 3. Fade volume AFTER play resolves
    if (audio) {
      audio.volume = 1; // set full volume first (iOS requires this)
      var playResult = audio.play();
      if (playResult !== undefined) {
        playResult.then(function() {
          // Fade down to comfortable level after playing starts
          var vol = 1;
          var fade = setInterval(function() {
            vol = Math.max(vol - 0.05, 0.45);
            audio.volume = vol;
            if (vol <= 0.45) clearInterval(fade);
          }, 40);
        }).catch(function(err) {
          // Still blocked — try one more time after a tiny delay
          // This sometimes works on older iOS
          setTimeout(function() { audio.play().catch(function(){}); }, 100);
        });
      }
    }

    // Animate overlay away
    overlay.classList.add('opening');
    setTimeout(function() {
      overlay.classList.add('gone');
      setTimeout(function() {
        overlay.style.display = 'none';
        var ico = document.getElementById('musicIcon');
        if (ico) ico.textContent = '🎵';
        // Signal canvas to resume (was paused while envelope was open)
        window._envDone = true;
      }, 650);
    }, 800);
  }

  // touchend is the correct event for iOS audio unlock
  envelope.addEventListener('touchend', openEnvelope, { passive: false });
  envelope.addEventListener('click',    openEnvelope, false);

})();