import Loader from '/js/utils/loader.js';

export default class Carousel {
  // Sets up all elements, state variables, and binds methods.
  constructor(container, images = [], options = {}) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) throw new Error('Carousel container not found');

    this.track = this.container.querySelector('.carousel-track');
    this.thumbsContainer = this.container.querySelector('.carousel-thumbnails');
    this.arrowLeft = this.container.querySelector('.carousel-arrow.left');
    this.arrowRight = this.container.querySelector('.carousel-arrow.right');

    this.images = images.slice();
    this.len = this.images.length;
    this.currentIndex = options.startIndex || 0;

    this.options = {
      loop: options.loop ?? true,
      transitionDuration: options.transitionDuration || 400,
    };

    // Main carousel state
    this.isDragging = false;
    this.isDragLocked = false;
    this.startX = 0;
    this.startY = 0;
    this.snapThreshold = 50; // How far to swipe to change slides
    this.dragStartThreshold = 5; // How far to move before a drag starts

    // Thumbnail drag state
    this.isDraggingThumbs = false;
    this.hasDraggedThumbs = false;
    this.thumbStartX = 0;
    this.thumbStartY = 0;
    this.thumbScrollLeft = 0;
    this.thumbDragDistance = 0;

    // Inertia state
    this.thumbVelocity = 0;
    this.thumbLastX = 0;
    this.thumbDamping = 0.975;
    this.inertiaFrameId = null;

    this._bindMethods();
    this._populateTrack();
    this._renderThumbnails();

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

    this._attachEvents();
  }

  // Binds 'this' context to all event handlers.
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

  // Creates main slides and clones for seamless looping.
  _populateTrack() {
    this.track.innerHTML = '';
    if (this.len === 0) return;
    
     // Helper to use Loader
    const addSlide = (src, isClone = false) => {
      // Create image using Loader
      const img = Loader.createImage(src);
      
      // Set specific carousel properties
      img.draggable = false;
      if (isClone) img.classList.add('clone');
      
      this.track.appendChild(img);
    };

    // Clone last
    addSlide(this.images[this.len - 1], true);

    // Real slides
    this.images.forEach(src => addSlide(src));

    // Clone first
    addSlide(this.images[0], true);
  }

  // Creates thumbnails and handles click-vs-drag logic.
  _renderThumbnails() {
    this.thumbsContainer.innerHTML = '';
    this.images.forEach((src, i) => {
      // Create thumbnail using Loader
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
    
    const activeThumb = this.thumbsContainer.querySelector('.active');
    if (activeThumb) {
        activeThumb.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
  }

  // Instantly sets the carousel to the correct starting slide.
  _setInitialPosition() {
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    this.track.style.transition = 'none';
    this.track.style.transform = `translateX(-${(this.currentIndex + 1) * width}px)`;
  }

  // Moves to a specific slide and updates/scrolls thumbnails.
  _goTo(index, instant = false) {
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    const realIndex = index + 1;
    if (instant) this.track.style.transition = 'none';
    else this.track.style.transition = `transform ${this.options.transitionDuration}ms ease`;
    this.track.style.transform = `translateX(-${realIndex * width}px)`;
    this.currentIndex = ((index % this.len) + this.len) % this.len;
    Array.from(this.thumbsContainer.children).forEach((el, i) => {
      const isActive = i === this.currentIndex;
      el.classList.toggle('active', isActive);
      if (isActive) {
        el.scrollIntoView({
          behavior: 'smooth',
          inline: 'nearest',
          block: 'nearest',
        });
      }
    });
  }

  // Goes to the next slide.
  next() { this._slide(1); }

  // Goes to the previous slide.
  prev() { this._slide(-1); }

  // Core logic for slide transition.
  _slide(delta) {
    this.currentIndex += delta;
    this._goTo(this.currentIndex);
    this.track.addEventListener('transitionend', this._onTransitionEnd, { once: true });
  }

  // Resets to the real slide after a clone transition for looping.
  _onTransitionEnd() {
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    if (this.currentIndex < 0) {
      this.currentIndex = this.len - 1;
      this._goTo(this.currentIndex, true);
    } else if (this.currentIndex >= this.len) {
      this.currentIndex = 0;
      this._goTo(this.currentIndex, true);
    }
  }

  // Handles drag start on the main carousel.
  _onPointerDown(e) {
    this.isDragging = true;
    this.isDragLocked = false;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.track.style.transition = 'none';
  }

  // Handles drag move on the main carousel.
  _onPointerMove(e) {
    if (!this.isDragging) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    const deltaX = Math.abs(currentX - this.startX);
    const deltaY = Math.abs(currentY - this.startY);

    if (!this.isDragLocked) {
      // Wait until we've moved at least `dragStartThreshold` pixels
      if (deltaX < this.dragStartThreshold && deltaY < this.dragStartThreshold) {
        return; // Not moved enough yet.
      }

      // We've moved enough. Decide the axis.
      if (deltaX > deltaY) {
        // Horizontal swipe. Lock it.
        this.isDragLocked = true;
        this.startX = currentX; // Re-baseline to prevent jump
      } else {
        // Vertical swipe. Abort our drag.
        this.isDragging = false;
        return;
      }
    }

    // If we're here, we are in a locked horizontal drag.
    e.preventDefault(); // Stop the browser from scrolling.
    const dragAmount = currentX - this.startX;
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    this.track.style.transform = `translateX(-${(this.currentIndex + 1) * width - dragAmount}px)`;
  }

  // Handles drag end on the main carousel, snapping to a slide.
  _onPointerUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    if (this.isDragLocked) { 
      const delta = e.clientX - this.startX;
      if (Math.abs(delta) > this.snapThreshold) {
        delta > 0 ? this.prev() : this.next();
      } else {
        this._goTo(this.currentIndex);
      }
    } else {
      // It was just a tap, snap back
      this._goTo(this.currentIndex);
    }
    this.isDragLocked = false;
  }

  // Attaches all event listeners for carousel and thumbnails.
  _attachEvents() {
    this.arrowLeft.addEventListener('click', this.prev);
    this.arrowRight.addEventListener('click', this.next);

    // Main Carousel Events
    this.track.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp); // Catches browser cancels

    // Thumbnail Events
    this.thumbsContainer.addEventListener('pointerdown', this._onThumbsPointerDown);
    window.addEventListener('pointermove', this._onThumbsPointerMove);
    window.addEventListener('pointerup', this._onThumbsPointerUp);
    window.addEventListener('pointercancel', this._onThumbsPointerUp); // Catches browser cancels
    
    window.addEventListener('resize', () => this._setInitialPosition());
  }

  // Handles drag start on the thumbnail container.
  _onThumbsPointerDown(e) {
    // We only preventDefault on move, not down.
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

  // Handles drag move on thumbnails and calculates velocity.
  _onThumbsPointerMove(e) {
    if (!this.isDraggingThumbs) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    if (!this.hasDraggedThumbs) {
      const deltaX = Math.abs(currentX - this.thumbStartX);
      const deltaY = Math.abs(currentY - this.thumbStartY);

      if (deltaX < this.dragStartThreshold && deltaY < this.dragStartThreshold) {
        return; // Not moved enough.
      }

      if (deltaX > deltaY) {
        // Horizontal swipe. Lock it.
        this.hasDraggedThumbs = true;
        this.thumbStartX = currentX; // Re-baseline
        this.thumbScrollLeft = this.thumbsContainer.scrollLeft;
        this.thumbLastX = currentX;
      } else {
        // Vertical swipe. Abort.
        this.isDraggingThumbs = false;
        return;
      }
    }
    
    // If we're here, we are in a locked horizontal drag.
    e.preventDefault(); // Stop the browser from scrolling.
    const walk = currentX - this.thumbStartX;
    this.thumbsContainer.scrollLeft = this.thumbScrollLeft - walk;
    
    this.thumbVelocity = currentX - this.thumbLastX;
    this.thumbLastX = currentX;
  }

  // Handles drag end on thumbnails and starts inertia.
  _onThumbsPointerUp() {
    if (!this.isDraggingThumbs) return; 
    this.isDraggingThumbs = false;
    this.thumbsContainer.classList.remove('is-dragging');
    
    if (this.hasDraggedThumbs && Math.abs(this.thumbVelocity) > 1) {
      this.inertiaFrameId = requestAnimationFrame(this._inertiaLoop);
    }
  }

  // Applies momentum scrolling (inertia) using requestAnimationFrame.
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
}