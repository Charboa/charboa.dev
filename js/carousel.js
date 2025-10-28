// modules/carousel.js
export function createCarousel(container, images) {
  if (!container) {
    console.warn("Carousel container not found");
    return;
  }

  // --- Create base structure ---
  const track = document.createElement('div');
  track.classList.add('carousel-track');

  const leftArrow = document.createElement('button');
  leftArrow.classList.add('carousel-arrow', 'left');
  leftArrow.innerHTML = '&#10094;';

  const rightArrow = document.createElement('button');
  rightArrow.classList.add('carousel-arrow', 'right');
  rightArrow.innerHTML = '&#10095;';

  container.appendChild(track);
  container.appendChild(leftArrow);
  container.appendChild(rightArrow);

  // --- Populate images ---
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.draggable = false;
    track.appendChild(img);
  });

  // --- Core logic ---
  let currentIndex = 0;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  function setPositionByIndex() {
    currentTranslate = currentIndex * -container.clientWidth;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function nextSlide() {
    if (currentIndex < track.children.length - 1) {
      currentIndex++;
      setPositionByIndex();
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      setPositionByIndex();
    }
  }

  function dragStart(e) {
    isDragging = true;
    startPos = e.pageX || e.touches?.[0].clientX;
    track.classList.add('grabbing');
  }

  function dragEnd() {
    isDragging = false;
    track.classList.remove('grabbing');
    const movedBy = currentTranslate - prevTranslate;

    if (movedBy < -100 && currentIndex < track.children.length - 1) currentIndex++;
    if (movedBy > 100 && currentIndex > 0) currentIndex--;

    setPositionByIndex();
    prevTranslate = currentTranslate;
  }

  function dragMove(e) {
    if (!isDragging) return;
    const currentPosition = e.pageX || e.touches?.[0].clientX;
    currentTranslate = prevTranslate + currentPosition - startPos;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  // --- Event listeners ---
  rightArrow.addEventListener('click', nextSlide);
  leftArrow.addEventListener('click', prevSlide);

  track.addEventListener('mousedown', dragStart);
  track.addEventListener('mouseup', dragEnd);
  track.addEventListener('mouseleave', dragEnd);
  track.addEventListener('mousemove', dragMove);

  track.addEventListener('touchstart', dragStart);
  track.addEventListener('touchend', dragEnd);
  track.addEventListener('touchmove', dragMove);

  // --- Init ---
  setPositionByIndex();
}
