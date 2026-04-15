/* book.js — Scroll hijack: scene moves, page stays fixed */
(function () {

  const scene      = document.getElementById('scene');
  const theBook    = document.getElementById('theBook');
  const bookCover  = document.getElementById('bookCover');
  const page1      = document.getElementById('page1');
  const page2      = document.getElementById('page2');
  const page3      = document.getElementById('page3');
  const dots       = document.querySelectorAll('.dot');
  const confZone   = document.getElementById('confettiZone');

  // Steps:
  // 0 = hero visible
  // 1 = slide1 up, book rises
  // 2 = cover opens, page1 shows
  // 3 = page1 turns, page2 shows
  // 4 = page2 turns, page3 shows + confetti

  let step = 0;
  const TOTAL_STEPS = 4;
  let animating = false;
  let confettiFired = false;

  // ── Apply state ─────────────────────────────────────
  function applyStep(s, dir) {
    // Move scene
    scene.style.transform = `translateY(${s === 0 ? '0' : '-100vh'})`;

    // Update dots
    dots.forEach((d, i) => d.classList.toggle('active', i === s));

    // Book visibility
    if (s === 0) {
      theBook.classList.remove('risen');
      bookCover.classList.remove('open');
      [page1, page2, page3].forEach(p => p.classList.remove('show','turning'));
      return;
    }

    // Book always risen for steps 1+
    theBook.classList.add('risen');

    if (s === 1) {
      // Book closed, just risen
      bookCover.classList.remove('open');
      [page1, page2, page3].forEach(p => p.classList.remove('show','turning'));

    } else if (s === 2) {
      // Cover open, page1 visible
      bookCover.classList.add('open');
      page1.classList.add('show');
      page1.classList.remove('turning');
      page2.classList.remove('show','turning');
      page3.classList.remove('show','turning');

    } else if (s === 3) {
      // Page1 turns, page2 visible
      bookCover.classList.add('open');
      page1.classList.remove('show');
      page1.classList.add('turning');
      page2.classList.add('show');
      page2.classList.remove('turning');
      page3.classList.remove('show','turning');

    } else if (s === 4) {
      // Page2 turns, page3 visible
      bookCover.classList.add('open');
      page1.classList.remove('show');
      page1.classList.add('turning');
      page2.classList.remove('show');
      page2.classList.add('turning');
      page3.classList.add('show');
      page3.classList.remove('turning');

      if (!confettiFired) {
        confettiFired = true;
        setTimeout(spawnConfetti, 600);
      }
    }
  }

  function go(dir) {
    if (animating) return;
    const next = step + dir;
    if (next < 0 || next > TOTAL_STEPS) return;
    animating = true;
    step = next;
    applyStep(step, dir);
    setTimeout(() => { animating = false; }, 780);
  }

  // ── Confetti ─────────────────────────────────────────
  function spawnConfetti() {
    if (!confZone) return;
    const colors = ['#ff6eb4','#ffe066','#6ee7c4','#c084fc','#ff9f51','#60c5fa','#ff5e7e'];
    for (let i = 0; i < 45; i++) {
      const el = document.createElement('div');
      el.className = 'cf-piece';
      const size = Math.random() * 8 + 5;
      el.style.cssText = `
        left: ${Math.random()*100}%;
        top: 0;
        width: ${size}px; height: ${size}px;
        background: ${colors[Math.floor(Math.random()*colors.length)]};
        border-radius: ${Math.random()>.5?'50%':'3px'};
        animation-duration: ${Math.random()*1.4+.9}s;
        animation-delay: ${Math.random()*.7}s;
      `;
      confZone.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }
  }

  // ── WHEEL ────────────────────────────────────────────
  let wheelAcc = 0;
  const WHEEL_THRESH = 60;

  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) >= WHEEL_THRESH) {
      go(wheelAcc > 0 ? 1 : -1);
      wheelAcc = 0;
    }
  }, { passive: false });

  // ── TOUCH ────────────────────────────────────────────
  let touchStartY = null;
  const TOUCH_THRESH = 45;

  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (touchStartY === null) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) >= TOUCH_THRESH) {
      go(dy > 0 ? 1 : -1);
    }
    touchStartY = null;
  }, { passive: true });

  // ── KEYBOARD ─────────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') go(1);
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   go(-1);
  });

  // ── DOT NAV ──────────────────────────────────────────
  dots.forEach(d => {
    d.addEventListener('click', () => {
      const target = parseInt(d.dataset.step);
      const dir = target > step ? 1 : -1;
      if (animating || target === step) return;
      animating = true;
      step = target;
      applyStep(step, dir);
      setTimeout(() => { animating = false; }, 780);
    });
  });

  // Init
  applyStep(0);

})();