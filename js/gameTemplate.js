import Carousel from '/js/modules/carousel.js';
import UI from '/js/utils/UI.js';

document.addEventListener('DOMContentLoaded', async () => {
  
  // 1. Get ID
  const gameId = new URLSearchParams(window.location.search).get('id');
  if (!gameId) { document.body.innerHTML = "<p>Game not found.</p>"; return; }

  // 2. Fetch Data
  let game;
  try {
    const res = await fetch('/data/gamePages.json');
    if (!res.ok) throw new Error("Failed");
    const games = await res.json();
    game = games.find(g => g.id === gameId);
  } catch (err) { console.error(err); return; }

  if (!game) { document.body.innerHTML = "<p>Game not found.</p>"; return; }

  // 3. Hydrate UI (Replace Skeletons)
  document.title = game.title;
  
  UI.fill('#game-title', game.title);
  UI.fill('#release-date', game.releaseDate);
  UI.fill('#game-description', game.shortDescription);
  UI.fill('#game-long-description', game.longDescription);
  
  UI.fillImage('#game-banner', game.banner);

  // 4. Populate List
  UI.fillList('#tag-list', game.tags, (tagText) => {
    const span = document.createElement('span');
    span.textContent = tagText;
    return span;
  });

  // 5. Initialize Carousel
  UI.revealCarousel(); // Removes skeleton from wrapper
  const carousel = new Carousel('.carousel-container', game.screenshots || []);
  window._currentCarousel = carousel;

  // 6. Handle Links
  const setLink = (id, url) => {
    const el = document.querySelector(id);
    el.style.display = url ? 'inline-block' : 'none';
    el.href = url || '#';
  };
  setLink('#github-link', game.links?.github);
  setLink('#steam-link', game.links?.steam);
  setLink('#itch-link', game.links?.itch);

  // 7. WebGL Logic
  const webglContainer = document.querySelector('#webgl-container');
  const webglFrame = document.querySelector('#webgl-frame');
  document.querySelector('#play-button').addEventListener('click', () => {
    webglFrame.src = `${game.webglBuild}/index.html`;     
    webglContainer.scrollIntoView({ behavior: 'smooth' });
  });
});

// Fullscreen Logic
window.addEventListener('load', () => {
  const btn = document.getElementById('unity-fullscreen-btn');
  const frame = document.getElementById('webgl-frame'); 

  if (!btn || !frame) return;

  btn.addEventListener('click', () => {
    if (frame.requestFullscreen) frame.requestFullscreen();
    else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
    setTimeout(() => frame.focus(), 100);
  });
});