/* envelope.js — Wax seal interaction & music unlock */
(function () {

  const overlay  = document.getElementById('envOverlay');
  const seal     = document.getElementById('waxSeal');
  const envelope = document.getElementById('envelope');
  const audio    = document.getElementById('bgMusic');

  if (!overlay || !seal) return;

  function burstHearts(cx, cy) {
    const items = ['💕','✨','🌸','⭐','🎀','💫','🎊','💖'];
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('div');
      el.className = 'burst-heart';
      const angle = (i / 18) * Math.PI * 2;
      const dist  = 60 + Math.random() * 120;
      const tx    = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist - 60}px)`;
      const rot   = (Math.random() - .5) * 120 + 'deg';
      el.style.cssText = `
        left:${cx - 12}px; top:${cy - 12}px;
        --tx:${tx}; --rot:${rot};
        animation-duration:${.8 + Math.random() * .6}s;
        animation-delay:${Math.random() * .15}s;
      `;
      el.textContent = items[Math.floor(Math.random() * items.length)];
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }
  }

  function openEnvelope(e) {
    // Get tap/click position for heart burst
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;

    // Burst hearts
    burstHearts(cx, cy);

    // Haptic
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

    // Start music — THIS IS THE USER GESTURE so it works on all browsers!
    if (audio) {
      audio.volume = 0;
      audio.play().then(() => {
        // Fade in music gently
        let vol = 0;
        const fade = setInterval(() => {
          vol = Math.min(vol + .04, .45);
          audio.volume = vol;
          if (vol >= .45) clearInterval(fade);
        }, 80);
      }).catch(() => {});
    }

    // Trigger opening animation
    overlay.classList.add('opening');

    // After animation, hide overlay
    setTimeout(() => {
      overlay.classList.add('gone');
      setTimeout(() => {
        overlay.style.display = 'none';
        // Update music button state
        const ico = document.getElementById('musicIcon');
        if (ico) ico.textContent = '🎵';
      }, 700);
    }, 820);

    seal.removeEventListener('click',      openEnvelope);
    seal.removeEventListener('touchstart', openEnvelope);
    envelope.removeEventListener('click',      openEnvelope);
    envelope.removeEventListener('touchstart', openEnvelope);
  }

  seal.addEventListener('click',      openEnvelope);
  seal.addEventListener('touchstart', openEnvelope, { passive: true });
  envelope.addEventListener('click',      openEnvelope);
  envelope.addEventListener('touchstart', openEnvelope, { passive: true });

})();