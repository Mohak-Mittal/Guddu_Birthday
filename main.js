/* main.js — Music + sparkle trail */

// ── Music ───────────────────────────────────────────────
const audio    = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let playing    = false;

audio.volume = 0.45;

// FORCE UNMUTE AND PLAY THE VERY SECOND PAGE LOADS
function forcePlayMusic() {
  // Unmute immediately
  audio.muted = false;

  // Try to play
  audio.play().then(() => {
    playing = true;
    musicBtn.textContent = '🎵';
    console.log('✓ MUSIC PLAYING NOW');
  }).catch(() => {
    console.log('Playing...');
  });
}

// Start the moment script loads (before page fully loads)
forcePlayMusic();

// Try again after tiny delay
setTimeout(forcePlayMusic, 50);
setTimeout(forcePlayMusic, 100);

// Also try when page fully loads
window.addEventListener('load', forcePlayMusic);
document.addEventListener('DOMContentLoaded', forcePlayMusic);

// If any click happens, ensure unmuted
document.addEventListener('click', () => {
  if (audio.muted) {
    audio.muted = false;
  }
});

function toggleMusic() {
  if (playing) {
    audio.pause();
    musicBtn.textContent = '🔇';
    playing = false;
  } else {
    audio.muted = false;
    audio.play().catch(() => {});
    musicBtn.textContent = '🎵';
    playing = true;
  }
}

// Attempt autoplay on first interaction
const startAudio = () => {
  if (!playing) {
    audio.muted = false;
    audio.play().then(() => {
      playing = true;
      musicBtn.textContent = '🎵';
    }).catch(() => {});
  }
  window.removeEventListener('touchend', startAudio);
  window.removeEventListener('click',    startAudio);
};
window.addEventListener('touchend', startAudio, { passive: true });
window.addEventListener('click',    startAudio);

// ── Sparkle cursor trail ─────────────────────────────────
const SPARKS = ['✨','🌟','⭐','🍭','💕','🎀','💫'];

const sparkStyle = document.createElement('style');
sparkStyle.textContent = `
  @keyframes sparkUp {
    0%   { opacity:1; transform:translateY(0) scale(1) rotate(0deg); }
    100% { opacity:0; transform:translateY(-38px) scale(.3) rotate(50deg); }
  }
  .spark {
    position:fixed;
    pointer-events:none;
    z-index:99999;
    animation: sparkUp .75s ease forwards;
    user-select:none;
    -webkit-user-select:none;
  }
`;
document.head.appendChild(sparkStyle);

function addSpark(x, y) {
  const el = document.createElement('div');
  el.className = 'spark';
  el.textContent = SPARKS[Math.floor(Math.random() * SPARKS.length)];
  el.style.left     = (x - 10) + 'px';
  el.style.top      = (y - 10) + 'px';
  el.style.fontSize = (Math.random() * 12 + 10) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 760);
}

// Mouse
document.addEventListener('mousemove', (e) => {
  if (Math.random() > 0.3) return;
  addSpark(e.clientX, e.clientY);
});

// Touch (mobile / Android)
document.addEventListener('touchmove', (e) => {
  if (Math.random() > 0.4) return;
  const t = e.touches[0];
  addSpark(t.clientX, t.clientY);
}, { passive: true });