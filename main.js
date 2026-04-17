/* main.js — Music + magic sparkle trail */

/* ── Music ─────────────────────────────────────────────── */
const audio    = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const musicIco = document.getElementById('musicIcon');
let playing    = false;

audio.volume = 0.45;

function toggleMusic() {
  if (playing) {
    audio.pause();
    musicIco.textContent = '🔇';
    musicBtn.style.boxShadow = '';
    playing = false;
  } else {
    audio.play().catch(() => {});
    musicIco.textContent = '🎵';
    musicBtn.style.boxShadow = '0 4px 24px rgba(255,110,180,.7), 0 0 40px rgba(255,224,102,.4), inset 0 1px 0 rgba(255,255,255,.3)';
    playing = true;
  }
}

const startAudio = () => {
  if (!playing) {
    audio.play().then(() => {
      playing = true;
      musicIco.textContent = '🎵';
    }).catch(() => {});
  }
  window.removeEventListener('touchend', startAudio);
  window.removeEventListener('click',    startAudio);
};
window.addEventListener('touchend', startAudio, { passive:true });
window.addEventListener('click',    startAudio);

/* ── Sparkle trail ─────────────────────────────────────── */
const SPARKS  = ['✨','🌟','⭐','🍭','💕','🎀','💫','🌸'];
const COLORS  = ['#ff6eb4','#ffe066','#6ee7c4','#c084fc','#ff9f51','#60c5fa'];

const sStyle = document.createElement('style');
sStyle.textContent = `
  @keyframes sparkRise {
    0%   { opacity:1; transform:translateY(0) scale(1) rotate(0deg); }
    100% { opacity:0; transform:translateY(-42px) scale(.25) rotate(55deg); }
  }
  .sp {
    position:fixed; pointer-events:none; z-index:99999;
    animation:sparkRise .72s ease forwards;
    user-select:none; -webkit-user-select:none;
    line-height:1;
  }
  @keyframes trailDot {
    0%   { opacity:.85; transform:scale(1); }
    100% { opacity:0;   transform:scale(.1); }
  }
  .trdot {
    position:fixed; pointer-events:none; z-index:99998;
    border-radius:50%; animation:trailDot .55s ease forwards;
  }
`;
document.head.appendChild(sStyle);

let lastX = -999, lastY = -999;

function addSpark(x, y) {
  // Emoji spark
  if (Math.random() < .35) {
    const el = document.createElement('div');
    el.className = 'sp';
    el.textContent = SPARKS[Math.floor(Math.random() * SPARKS.length)];
    el.style.left     = (x - 10) + 'px';
    el.style.top      = (y - 10) + 'px';
    el.style.fontSize = (9 + Math.random() * 13) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 730);
  }

  // Colored dot trail
  if (Math.hypot(x - lastX, y - lastY) > 8) {
    lastX = x; lastY = y;
    const dot = document.createElement('div');
    dot.className = 'trdot';
    const sz = 4 + Math.random() * 7;
    dot.style.cssText = `
      left:${x - sz/2}px; top:${y - sz/2}px;
      width:${sz}px; height:${sz}px;
      background:${COLORS[Math.floor(Math.random()*COLORS.length)]};
      box-shadow:0 0 8px ${COLORS[Math.floor(Math.random()*COLORS.length)]};
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 560);
  }
}

document.addEventListener('mousemove', e => addSpark(e.clientX, e.clientY));
document.addEventListener('touchmove',  e => {
  const t = e.touches[0];
  addSpark(t.clientX, t.clientY);
}, { passive:true });