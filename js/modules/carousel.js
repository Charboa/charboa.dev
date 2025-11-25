import Loader from '/js/utils/Loader.js';

export default class Carousel {
  constructor(container, images = [], options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) throw new Error('Carousel container not found');

    this.track = this.container.querySelector('.carousel-track');
    this.thumbsContainer = this.container.querySelector('.carousel-thumbnails');
    this.arrowLeft = this.container.querySelector('.carousel-arrow.left');
    this.arrowRight = this.container.querySelector('.carousel-arrow.right');

    this.images = images.slice();
    this.len = this.images.length;
    this.currentIndex = options.startIndex || 0;
    this.options = { transitionDuration: options.transitionDuration || 400 };

    // State
    this.isDragging = false;
    this.isDragLocked = false;
    this.startX = 0;
    this.startY = 0;
    this.snapThreshold = 50;
    this.dragStartThreshold = 5;

    // Thumb State
    this.isDraggingThumbs = false;
    this.hasDraggedThumbs = false;
    this.thumbStartX = 0;
    this.thumbStartY = 0;
    this.thumbScrollLeft = 0;
    this.thumbDragDistance = 0;
    this.thumbVelocity = 0;
    this.thumbLastX = 0;
    this.thumbDamping = 0.975;
    this.inertiaFrameId = null;

    this._bindMethods();
    this._populateTrack();
    this._renderThumbnails();
    this._initLoadCheck();
    this._attachEvents();
  }

  _bindMethods() {
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onTransitionEnd = this._onTransitionEnd.bind(this);
    this._onThumbsPointerDown = this._onThumbsPointerDown.bind(this);
    this._onThumbsPointerMove = this._onThumbsPointerMove.bind(this);
    this._onThumbsPointerUp = this._onThumbsPointerUp.bind(this);
    this._inertiaLoop = this._inertiaLoop.bind(this);
  }

  _populateTrack() {
    this.track.innerHTML = '';
    if (this.len === 0) return;

    const addSlide = (src, isClone = false) => {
      // Use Loader to create the image with skeleton class
      const img = Loader.createImage(src);
      img.draggable = false;
      if (isClone) img.classList.add('clone');
      this.track.appendChild(img);
    };

    addSlide(this.images[this.len - 1], true);
    this.images.forEach(src => addSlide(src));
    addSlide(this.images[0], true);
  }

  _renderThumbnails() {
    this.thumbsContainer.innerHTML = '';
    this.images.forEach((src, i) => {
      const img = Loader.createImage(src);
      img.draggable = false;
      img.classList.toggle('active', i === this.currentIndex);
      
      img.addEventListener('click', (e) => {
        if (this.hasDraggedThumbs) {
          e.preventDefault();
          return;
        }
        this._goTo(i);
      });
      this.thumbsContainer.appendChild(img);
    });
    
    // Scroll active into view
    const activeThumb = this.thumbsContainer.querySelector('.active');
    if (activeThumb) activeThumb.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }

  _initLoadCheck() {
    const trackImages = this.track.querySelectorAll('img');
    let loadedCount = 0;
    trackImages.forEach(img => {
      if (img.complete) loadedCount++;
      else img.addEventListener('load', () => {
        loadedCount++;
        if (loadedCount === trackImages.length) this._setInitialPosition();
      });
    });
    if (loadedCount === trackImages.length) this._setInitialPosition();
  }

  _setInitialPosition() {
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    this.track.style.transition = 'none';
    this.track.style.transform = `translateX(-${(this.currentIndex + 1) * width}px)`;
  }

  _goTo(index, instant = false) {
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    const realIndex = index + 1;
    this.track.style.transition = instant ? 'none' : `transform ${this.options.transitionDuration}ms ease`;
    this.track.style.transform = `translateX(-${realIndex * width}px)`;
    this.currentIndex = ((index % this.len) + this.len) % this.len;
    
    Array.from(this.thumbsContainer.children).forEach((el, i) => {
      const isActive = i === this.currentIndex;
      el.classList.toggle('active', isActive);
      if (isActive) el.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    });
  }

  next() { this._slide(1); }
  prev() { this._slide(-1); }

  _slide(delta) {
    this.currentIndex += delta;
    this._goTo(this.currentIndex);
    this.track.addEventListener('transitionend', this._onTransitionEnd, { once: true });
  }

  _onTransitionEnd() {
    if (this.currentIndex < 0) {
      this.currentIndex = this.len - 1;
      this._goTo(this.currentIndex, true);
    } else if (this.currentIndex >= this.len) {
      this.currentIndex = 0;
      this._goTo(this.currentIndex, true);
    }
  }

  // --- Main Carousel Pointer Events ---
  _onPointerDown(e) {
    this.isDragging = true;
    this.isDragLocked = false;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.track.style.transition = 'none';
  }

  _onPointerMove(e) {
    if (!this.isDragging) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    const deltaX = Math.abs(currentX - this.startX);
    const deltaY = Math.abs(currentY - this.startY);

    if (!this.isDragLocked) {
      if (deltaX < this.dragStartThreshold && deltaY < this.dragStartThreshold) return;
      if (deltaX > deltaY) {
        this.isDragLocked = true;
        this.startX = currentX;
      } else {
        this.isDragging = false;
        return;
      }
    }

    e.preventDefault();
    const dragAmount = currentX - this.startX;
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    this.track.style.transform = `translateX(-${(this.currentIndex + 1) * width - dragAmount}px)`;
  }

  _onPointerUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.isDragLocked) { 
      const delta = e.clientX - this.startX;
      if (Math.abs(delta) > this.snapThreshold) delta > 0 ? this.prev() : this.next();
      else this._goTo(this.currentIndex);
    } else {
      this._goTo(this.currentIndex);
    }
    this.isDragLocked = false;
  }

  // --- Thumbnail Pointer Events ---
  _onThumbsPointerDown(e) {
    this.isDraggingThumbs = true;
    this.hasDraggedThumbs = false; 
    this.thumbStartX = e.clientX;
    this.thumbStartY = e.clientY;
    this.thumbScrollLeft = this.thumbsContainer.scrollLeft;
    this.thumbsContainer.classList.add('is-dragging');
    this.thumbVelocity = 0;
    this.thumbLastX = e.clientX;
    cancelAnimationFrame(this.inertiaFrameId);
    this.thumbDragDistance = 0;
  }

  _onThumbsPointerMove(e) {
    if (!this.isDraggingThumbs) return;
    const currentX = e.clientX;
    const currentY = e.clientY;

    if (!this.hasDraggedThumbs) {
      const deltaX = Math.abs(currentX - this.thumbStartX);
      const deltaY = Math.abs(currentY - this.thumbStartY);
      if (deltaX < this.dragStartThreshold && deltaY < this.dragStartThreshold) return;
      if (deltaX > deltaY) {
        this.hasDraggedThumbs = true;
        this.thumbStartX = currentX;
        this.thumbScrollLeft = this.thumbsContainer.scrollLeft;
        this.thumbLastX = currentX;
      } else {
        this.isDraggingThumbs = false;
        return;
      }
    }
    
    e.preventDefault();
    const walk = currentX - this.thumbStartX;
    this.thumbsContainer.scrollLeft = this.thumbScrollLeft - walk;
    this.thumbVelocity = currentX - this.thumbLastX;
    this.thumbLastX = currentX;
  }

  _onThumbsPointerUp() {
    if (!this.isDraggingThumbs) return; 
    this.isDraggingThumbs = false;
    this.thumbsContainer.classList.remove('is-dragging');
    if (this.hasDraggedThumbs && Math.abs(this.thumbVelocity) > 1) {
      this.inertiaFrameId = requestAnimationFrame(this._inertiaLoop);
    }
  }

  _inertiaLoop() {
    if (!this.thumbsContainer) return;
    this.thumbsContainer.scrollLeft -= this.thumbVelocity;
    this.thumbVelocity *= this.thumbDamping;
    if (Math.abs(this.thumbVelocity) > 0.5) {
      this.inertiaFrameId = requestAnimationFrame(this._inertiaLoop);
    } else {
      this.thumbVelocity = 0;
    }
  }

  _attachEvents() {
    this.arrowLeft.addEventListener('click', this.prev);
    this.arrowRight.addEventListener('click', this.next);
    
    this.track.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);

    this.thumbsContainer.addEventListener('pointerdown', this._onThumbsPointerDown);
    window.addEventListener('pointermove', this._onThumbsPointerMove);
    window.addEventListener('pointerup', this._onThumbsPointerUp);
    window.addEventListener('pointercancel', this._onThumbsPointerUp);
    
    window.addEventListener('resize', () => this._setInitialPosition());
  }
}