/* book.js — 5-step scroll hijack */
(function () {

  const scene   = document.getElementById('scene');
  const book    = document.getElementById('theBook');
  const cover   = document.getElementById('bcover');
  const pg1     = document.getElementById('pg1');
  const pg2     = document.getElementById('pg2');
  const pg3     = document.getElementById('pg3');
  const dots    = document.querySelectorAll('.ndot');
  const stepLbl = document.getElementById('stepLabel');
  const cfZone  = document.getElementById('cfZone');

  let step = 0, animating = false, cfFired = false;
  const MAX = 4;

  /* ── State machine ──────────────────────────────────── */
  function paint(s) {
    // Scene position - go down ONCE to step 1, then stay fixed
    scene.style.transform = s === 0 ? 'translateY(0)' : 'translateY(-100vh)';

    // Dots
    dots.forEach((d, i) => d.classList.toggle('active', i === s));

    // Step label
    stepLbl.textContent = `${s + 1} / ${MAX + 1}`;

    // Book states
    if (s === 0) {
      book.classList.remove('risen');
      cover.classList.remove('open');
      [pg1, pg2, pg3].forEach(p => p.classList.remove('show','turning'));
      return;
    }
    book.classList.add('risen');

    if (s === 1) {
      // Book risen, cover closed
      cover.classList.remove('open');
      [pg1, pg2, pg3].forEach(p => p.classList.remove('show','turning'));

    } else if (s === 2) {
      cover.classList.add('open');
      pg1.classList.add('show'); pg1.classList.remove('turning');
      pg2.classList.remove('show','turning');
      pg3.classList.remove('show','turning');

    } else if (s === 3) {
      cover.classList.add('open');
      pg1.classList.remove('show'); pg1.classList.add('turning');
      pg2.classList.add('show');    pg2.classList.remove('turning');
      pg3.classList.remove('show','turning');

    } else if (s === 4) {
      cover.classList.add('open');
      pg1.classList.add('turning');
      pg2.classList.remove('show'); pg2.classList.add('turning');
      pg3.classList.add('show');    pg3.classList.remove('turning');
      if (!cfFired) { cfFired = true; setTimeout(confetti, 650); }
    }
  }

  function go(dir) {
    if (animating) return;
    const next = step + dir;
    if (next < 0 || next > MAX) return;
    animating = true;
    step = next;
    paint(step);
    // Haptic feedback on Android
    if (navigator.vibrate) navigator.vibrate(18);
    setTimeout(() => { animating = false; }, 820);
  }

  /* ── Confetti ───────────────────────────────────────── */
  function confetti() {
    if (!cfZone) return;
    const cols = ['#ff6eb4','#ffe066','#6ee7c4','#c084fc','#ff9f51','#60c5fa','#ff5e7e','#fff'];
    for (let i = 0; i < 55; i++) {
      const el = document.createElement('div');
      el.className = 'cf-p';
      const sz = 5 + Math.random() * 9;
      el.style.cssText = `
        left:${Math.random()*100}%; top:0;
        width:${sz}px; height:${sz}px;
        background:${cols[Math.floor(Math.random()*cols.length)]};
        border-radius:${Math.random()>.5?'50%':'3px'};
        animation-duration:${.9+Math.random()*1.4}s;
        animation-delay:${Math.random()*.6}s;
      `;
      cfZone.appendChild(el);
      setTimeout(() => el.remove(), 2600);
    }
  }

  /* ── Wheel ──────────────────────────────────────────── */
  let wAcc = 0;
  window.addEventListener('wheel', e => {
    e.preventDefault();
    wAcc += e.deltaY;
    if (Math.abs(wAcc) >= 55) { go(wAcc > 0 ? 1 : -1); wAcc = 0; }
  }, { passive: false });

  /* ── Touch ──────────────────────────────────────────── */
  let ty0 = null;
  window.addEventListener('touchstart', e => { ty0 = e.touches[0].clientY; }, { passive:true });
  window.addEventListener('touchend',   e => {
    if (ty0 === null) return;
    const dy = ty0 - e.changedTouches[0].clientY;
    if (Math.abs(dy) >= 42) go(dy > 0 ? 1 : -1);
    ty0 = null;
  }, { passive:true });

  /* ── Keyboard ───────────────────────────────────────── */
  window.addEventListener('keydown', e => {
    if (e.key==='ArrowDown'||e.key==='PageDown'||e.key===' ') { e.preventDefault(); go(1); }
    if (e.key==='ArrowUp'  ||e.key==='PageUp')                { e.preventDefault(); go(-1); }
  });

  /* ── Dot clicks ─────────────────────────────────────── */
  dots.forEach(d => d.addEventListener('click', () => {
    const t2 = parseInt(d.dataset.step);
    if (animating || t2 === step) return;
    animating = true;
    step = t2; paint(step);
    if (navigator.vibrate) navigator.vibrate(18);
    setTimeout(() => { animating = false; }, 820);
  }));

  /* ── Init ───────────────────────────────────────────── */
  paint(0);

})();