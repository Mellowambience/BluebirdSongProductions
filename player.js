// ============================================================
// BLUEBIRD SONG PRODUCTIONS — Ambient Radio Player
// Binaural beat background via YouTube IFrame API
// ============================================================

// Curated binaural / lo-fi ambient YouTube IDs
const TRACKS = [
  { id: '5qap5aO4i9A', title: 'Binaural Beats · Focus' },
  { id: 'WPni755-Krg', title: 'Binaural Beats · Deep Work' },
  { id: 'DWcJFNfaw9c', title: 'Theta Waves · Creativity' },
  { id: 'lE6RYpe9IT0', title: 'Alpha Waves · Calm' },
];

let trackIndex = 0;
let player = null;
let isPlaying = false;
let ytReady = false;

const toggle   = document.getElementById('apToggle');
const iframe   = document.getElementById('ytAmbient');
const titleEl  = document.getElementById('apTitle');
const volumeEl = document.getElementById('apVolume');
const vizEl    = document.getElementById('apViz');
const iconPlay  = toggle.querySelector('.icon-play');
const iconPause = toggle.querySelector('.icon-pause');

// Load YT IFrame API
window.onYouTubeIframeAPIReady = function () {
  ytReady = true;
  player = new YT.Player('ytAmbient', {
    events: {
      onReady: onPlayerReady,
      onStateChange: onStateChange,
    },
  });
};

function loadYTApi() {
  if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
}

function onPlayerReady(e) {
  e.target.setVolume(parseInt(volumeEl.value, 10));
}

function onStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) {
    nextTrack();
  }
}

function setTrack(idx) {
  trackIndex = idx % TRACKS.length;
  const t = TRACKS[trackIndex];
  titleEl.textContent = t.title;
  if (player && ytReady) {
    player.loadVideoById(t.id);
    if (!isPlaying) player.pauseVideo();
  } else {
    iframe.src = `https://www.youtube.com/embed/${t.id}?autoplay=0&controls=0&loop=1&playlist=${t.id}&enablejsapi=1`;
  }
}

function nextTrack() {
  setTrack(trackIndex + 1);
  if (isPlaying && player) player.playVideo();
}

function setPlayState(playing) {
  isPlaying = playing;
  iconPlay.style.display  = playing ? 'none' : 'block';
  iconPause.style.display = playing ? 'block' : 'none';
  vizEl.classList.toggle('playing', playing);
  toggle.setAttribute('aria-label', playing ? 'Pause ambient audio' : 'Play ambient audio');
}

toggle.addEventListener('click', () => {
  if (!ytReady) {
    loadYTApi();
    // wait for API then auto-play
    const waitPlay = setInterval(() => {
      if (ytReady && player) {
        clearInterval(waitPlay);
        player.playVideo();
        setPlayState(true);
      }
    }, 200);
    return;
  }
  if (isPlaying) {
    player.pauseVideo();
    setPlayState(false);
  } else {
    player.playVideo();
    setPlayState(true);
  }
});

volumeEl.addEventListener('input', () => {
  if (player && ytReady) player.setVolume(parseInt(volumeEl.value, 10));
});

// Lazy-load API on first interaction anywhere on page
document.addEventListener('pointerdown', loadYTApi, { once: true });
