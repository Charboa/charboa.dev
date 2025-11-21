import Carousel from '/js/modules/carousel.js';

document.addEventListener('DOMContentLoaded', async () => {
   
  // Get game ID from URL
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('id');

  if (!gameId) {
    document.body.innerHTML = "<p>Game not found.</p>";
    return;
  }

  // Fetch game data
  let games;
  try {
    const response = await fetch('/data/gamePages.json');
    if (!response.ok) throw new Error("Failed to fetch JSON");
    games = await response.json();
  } catch (err) {
    console.error(err);
    document.body.innerHTML = "<p>Failed to load game data.</p>";
    return;
  }

  const game = games.find(g => g.id === gameId);
  if (!game) {
    document.body.innerHTML = "<p>Game not found.</p>";
    return;
  }

  document.title = game.title;
  // Populate banner
  const bannerImg = document.querySelector('#game-banner');
  bannerImg.src = game.banner; 
  bannerImg.alt = game.title + " Banner";
  bannerImg.draggable = false;
  bannerImg.style.userSelect = 'none';
  // Populate hero info
  document.querySelector('#game-title').textContent = game.title;
  document.querySelector('#release-date').textContent = game.releaseDate;
  document.querySelector('#game-description').textContent = game.shortDescription;
  document.querySelector('#game-long-description').textContent = game.longDescription;

  // Populate tags
  const tagList = document.querySelector('#tag-list');
  tagList.innerHTML = '';
  if (game.tags) {
    game.tags.forEach(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      tagList.appendChild(span);
    });
  }

  // Create screenshot carousel
  const carousel = new Carousel('.carousel-container', game.screenshots || [], {
    autoplay: false,
    autoplayInterval: 4500,
    startIndex: 0,
  });

  // store it somewhere if you need to destroy later:
  window._currentCarousel = carousel;

  // Populate links
  const links = game.links || {};
  const githubEl = document.querySelector('#github-link');
  const steamEl = document.querySelector('#steam-link');
  const itchEl = document.querySelector('#itch-link');

  githubEl.style.display = links.github ? 'inline-block' : 'none';
  githubEl.href = links.github || '#';

  steamEl.style.display = links.steam ? 'inline-block' : 'none';
  steamEl.href = links.steam || '#';

  itchEl.style.display = links.itch ? 'inline-block' : 'none';
  itchEl.href = links.itch || '#';

  // WebGL frame toggle
  const webglContainer = document.querySelector('#webgl-container');
  const webglFrame = document.querySelector('#webgl-frame');
  document.querySelector('#play-button').addEventListener('click', () => {

    webglFrame.src = `${game.webglBuild}/index.html`;     
    webglContainer.scrollIntoView({ behavior: 'smooth' });
     
  });
});

// Fullscreen button
window.addEventListener('load', () => {
  const fullscreenBtn = document.getElementById('unity-fullscreen-btn');
  
  // Make sure this matches your element ID (e.g. 'unity-canvas' or your iframe ID)
  const gameElement = document.getElementById('webgl-frame'); 

  if (!fullscreenBtn || !gameElement) {
    console.warn('Fullscreen script error: Button or Game Element not found.');
    return;
  }

  fullscreenBtn.addEventListener('click', () => {
    // 1. Request Fullscreen
    if (gameElement.requestFullscreen) {
      gameElement.requestFullscreen();
    } else if (gameElement.webkitRequestFullscreen) { /* Safari/Chrome */
      gameElement.webkitRequestFullscreen();
    } else if (gameElement.msRequestFullscreen) { /* IE11 */
      gameElement.msRequestFullscreen();
    }

    setTimeout(() => {
      gameElement.focus();
    }, 100);
  });
});



