export default class Carousel {
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

    this.isDragging = false;
    this.startX = 0;
    this.dragThreshold = 50;

    this._bindMethods();
    this._populateTrack();
    this._renderThumbnails();

    // FIXED: wait for all images to load before setting initial position
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

  _bindMethods() {
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onTransitionEnd = this._onTransitionEnd.bind(this);
  }

  _populateTrack() {
    this.track.innerHTML = '';
    if (this.len === 0) return;

    // Clone last slide at start
    const lastClone = document.createElement('img');
    lastClone.src = this.images[this.len - 1];
    lastClone.draggable = false;
    lastClone.classList.add('clone');
    this.track.appendChild(lastClone);

    // Real slides
    this.images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.draggable = false;
      this.track.appendChild(img);
    });

    // Clone first slide at end
    const firstClone = document.createElement('img');
    firstClone.src = this.images[0];
    firstClone.draggable = false;
    firstClone.classList.add('clone');
    this.track.appendChild(firstClone);
  }

  _renderThumbnails() {
    this.thumbsContainer.innerHTML = '';
    this.images.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.draggable = false;
      img.classList.toggle('active', i === this.currentIndex);
      img.addEventListener('click', () => this._goTo(i));
      this.thumbsContainer.appendChild(img);
    });
  }

  _setInitialPosition() {
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    this.track.style.transition = 'none';
    this.track.style.transform = `translateX(-${(this.currentIndex + 1) * width}px)`;
  }

  _goTo(index, instant = false) {
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    const realIndex = index + 1;

    if (instant) this.track.style.transition = 'none';
    else this.track.style.transition = `transform ${this.options.transitionDuration}ms ease`;

    this.track.style.transform = `translateX(-${realIndex * width}px)`;
    this.currentIndex = ((index % this.len) + this.len) % this.len;

    Array.from(this.thumbsContainer.children).forEach((el, i) =>
      el.classList.toggle('active', i === this.currentIndex)
    );
  }

  next() { this._slide(1); }
  prev() { this._slide(-1); }

  _slide(delta) {
    this.currentIndex += delta;
    this._goTo(this.currentIndex);
    this.track.addEventListener('transitionend', this._onTransitionEnd, { once: true });
  }

  _onTransitionEnd() {
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;

    // seamless loop using clones
    if (this.currentIndex < 0) {
      this.currentIndex = this.len - 1;
      this._goTo(this.currentIndex, true);
    } else if (this.currentIndex >= this.len) {
      this.currentIndex = 0;
      this._goTo(this.currentIndex, true);
    }
  }

  _onPointerDown(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.track.style.transition = 'none';
  }

  _onPointerMove(e) {
    if (!this.isDragging) return;
    const deltaX = e.clientX - this.startX;
    const width = this.container.querySelector('.carousel-track-wrapper').offsetWidth;
    this.track.style.transform = `translateX(-${(this.currentIndex + 1) * width - deltaX}px)`;
  }

  _onPointerUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const delta = e.clientX - this.startX;
    if (Math.abs(delta) > this.dragThreshold) {
      delta > 0 ? this.prev() : this.next();
    } else {
      this._goTo(this.currentIndex);
    }
  }

  _attachEvents() {
    this.arrowLeft.addEventListener('click', this.prev);
    this.arrowRight.addEventListener('click', this.next);

    this.track.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);

    window.addEventListener('resize', () => this._setInitialPosition());
  }
}
