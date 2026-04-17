/* envelope.js — Fixed touch target + music unlock */
(function () {

  const overlay  = document.getElementById('envOverlay');
  const envelope = document.getElementById('envelope');
  const audio    = document.getElementById('bgMusic');

  if (!overlay || !envelope) return;

  let opened = false;

  function burstHearts(cx, cy) {
    const items = ['💕','✨','🌸','⭐','🎀','💫','🎊','💖'];
    for (let i = 0; i < 16; i++) {
      const el = document.createElement('div');
      el.className = 'burst-heart';
      const angle = (i / 16) * Math.PI * 2;
      const dist  = 55 + Math.random() * 100;
      const tx    = 'translate(' + (Math.cos(angle)*dist) + 'px, ' + (Math.sin(angle)*dist - 55) + 'px)';
      const rot   = ((Math.random() - .5) * 120) + 'deg';
      el.style.cssText =
        'left:' + (cx-12) + 'px; top:' + (cy-12) + 'px;' +
        '--tx:' + tx + '; --rot:' + rot + ';' +
        'animation-duration:' + (.8 + Math.random()*.5) + 's;' +
        'animation-delay:' + (Math.random()*.1) + 's;';
      el.textContent = items[Math.floor(Math.random() * items.length)];
      document.body.appendChild(el);
      setTimeout(function(){ el.remove(); }, 1500);
    }
  }

  function openEnvelope(e) {
    if (opened) return;
    opened = true;

    e.preventDefault();
    e.stopPropagation();

    var cx, cy;
    if (e.changedTouches && e.changedTouches.length) {
      cx = e.changedTouches[0].clientX;
      cy = e.changedTouches[0].clientY;
    } else {
      cx = e.clientX || window.innerWidth / 2;
      cy = e.clientY || window.innerHeight / 2;
    }

    burstHearts(cx, cy);
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

    // Play music synchronously inside touch event handler
    if (audio) {
      audio.volume = 0.45;
      audio.play().then(function() {
        audio.volume = 0;
        var vol = 0;
        var fade = setInterval(function() {
          vol = Math.min(vol + 0.03, 0.45);
          audio.volume = vol;
          if (vol >= 0.45) clearInterval(fade);
        }, 60);
      }).catch(function() {
        audio.volume = 0.45;
      });
    }

    overlay.classList.add('opening');
    setTimeout(function() {
      overlay.classList.add('gone');
      setTimeout(function() {
        overlay.style.display = 'none';
        var ico = document.getElementById('musicIcon');
        if (ico) ico.textContent = '🎵';
      }, 650);
    }, 800);
  }

  // Use touchend (not touchstart) — more reliable for audio on mobile
  envelope.addEventListener('touchend', openEnvelope, { passive: false });
  envelope.addEventListener('click',    openEnvelope, false);

})();