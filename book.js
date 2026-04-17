/* book.js — Fixed page turning + Android performance */
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

  var step = 0, animating = false, cfFired = false;
  var MAX = 4;

  // Lock duration must be LONGER than CSS transition (950ms) to prevent skip
  var LOCK_MS = 1050;

  function paint(s) {
    scene.style.transform = s === 0 ? 'translateY(0)' : 'translateY(-100vh)';
    dots.forEach(function(d, i) { d.classList.toggle('active', i === s); });
    if (stepLbl) stepLbl.textContent = (s + 1) + ' / ' + (MAX + 1);

    if (s === 0) {
      book.classList.remove('risen');
      cover.classList.remove('open');
      pg1.classList.remove('show','turning');
      pg2.classList.remove('show','turning');
      pg3.classList.remove('show','turning');
      return;
    }

    book.classList.add('risen');

    if (s === 1) {
      cover.classList.remove('open');
      pg1.classList.remove('show','turning');
      pg2.classList.remove('show','turning');
      pg3.classList.remove('show','turning');

    } else if (s === 2) {
      cover.classList.add('open');
      pg1.classList.add('show');    pg1.classList.remove('turning');
      pg2.classList.remove('show'); pg2.classList.remove('turning');
      pg3.classList.remove('show'); pg3.classList.remove('turning');

    } else if (s === 3) {
      cover.classList.add('open');
      pg1.classList.remove('show'); pg1.classList.add('turning');
      pg2.classList.add('show');    pg2.classList.remove('turning');
      pg3.classList.remove('show'); pg3.classList.remove('turning');

    } else if (s === 4) {
      cover.classList.add('open');
      pg1.classList.remove('show'); pg1.classList.add('turning');
      pg2.classList.remove('show'); pg2.classList.add('turning');
      pg3.classList.add('show');    pg3.classList.remove('turning');
      if (!cfFired) { cfFired = true; setTimeout(confetti, 700); }
    }
  }

  function go(dir) {
    if (animating) return;
    var next = step + dir;
    if (next < 0 || next > MAX) return;
    animating = true;
    step = next;
    paint(step);
    if (navigator.vibrate) navigator.vibrate(18);
    // Lock for full transition duration to prevent double-fire
    setTimeout(function() { animating = false; }, LOCK_MS);
  }

  function confetti() {
    if (!cfZone) return;
    var cols = ['#ff6eb4','#ffe066','#6ee7c4','#c084fc','#ff9f51','#60c5fa','#ff5e7e'];
    // Fewer pieces on mobile for performance
    var count = window.innerWidth < 500 ? 28 : 50;
    for (var i = 0; i < count; i++) {
      (function() {
        var el = document.createElement('div');
        el.className = 'cf-p';
        var sz = 5 + Math.random() * 8;
        el.style.cssText =
          'left:' + (Math.random()*100) + '%;top:0;' +
          'width:' + sz + 'px;height:' + sz + 'px;' +
          'background:' + cols[Math.floor(Math.random()*cols.length)] + ';' +
          'border-radius:' + (Math.random()>.5?'50%':'3px') + ';' +
          'animation-duration:' + (.9+Math.random()*1.2) + 's;' +
          'animation-delay:' + (Math.random()*.5) + 's;';
        cfZone.appendChild(el);
        setTimeout(function(){ el.remove(); }, 2400);
      })();
    }
  }

  // ── Wheel ──────────────────────────────────────────────
  var wAcc = 0;
  window.addEventListener('wheel', function(e) {
    e.preventDefault();
    wAcc += e.deltaY;
    if (Math.abs(wAcc) >= 50) {
      go(wAcc > 0 ? 1 : -1);
      wAcc = 0;
    }
  }, { passive: false });

  // ── Touch — debounced properly ─────────────────────────
  var ty0 = null, tx0 = null;
  var touchLock = false;

  window.addEventListener('touchstart', function(e) {
    if (touchLock) return;
    ty0 = e.touches[0].clientY;
    tx0 = e.touches[0].clientX;
  }, { passive: true });

  window.addEventListener('touchend', function(e) {
    if (touchLock || ty0 === null) return;
    var dy = ty0 - e.changedTouches[0].clientY;
    var dx = Math.abs(tx0 - e.changedTouches[0].clientX);
    // Only trigger on vertical swipes (dy bigger than horizontal movement)
    if (Math.abs(dy) >= 40 && Math.abs(dy) > dx * 1.2) {
      touchLock = true;
      go(dy > 0 ? 1 : -1);
      setTimeout(function() { touchLock = false; }, LOCK_MS);
    }
    ty0 = null; tx0 = null;
  }, { passive: true });

  // ── Keyboard ────────────────────────────────────────────
  window.addEventListener('keydown', function(e) {
    if (e.key==='ArrowDown'||e.key==='PageDown'||e.key===' ') { e.preventDefault(); go(1); }
    if (e.key==='ArrowUp'  ||e.key==='PageUp')                { e.preventDefault(); go(-1); }
  });

  // ── Dots ─────────────────────────────────────────────────
  dots.forEach(function(d) {
    d.addEventListener('click', function() {
      var t2 = parseInt(d.dataset.step);
      if (animating || t2 === step) return;
      animating = true;
      step = t2; paint(step);
      if (navigator.vibrate) navigator.vibrate(18);
      setTimeout(function() { animating = false; }, LOCK_MS);
    });
  });

  paint(0);

})();