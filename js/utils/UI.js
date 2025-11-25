import Loader from './loader.js';

export default class UI {
  
  // ... (fill and fillList methods remain the same) ...

  static fill(selector, text) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.textContent = text;
    el.classList.remove('skeleton', 'sk-title', 'sk-text', 'sk-chip', 'skeleton-banner');
    el.style.width = '';
    el.style.height = '';
  }

  /**
   * UPDATED: Removes forced aspect-ratio on load
   */
  static fillImage(selector, src) {
    const el = document.querySelector(selector);
    if (!el) return;

    // 1. Ensure skeleton is active
    el.classList.add('skeleton');

    // 2. Define cleanup function
    const finish = () => {
      el.classList.remove('skeleton', 'skeleton-banner');
      
      // --- THE FIX ---
      // This removes the inline 'style="aspect-ratio: 16/9"' 
      // allowing the image to snap to its natural dimensions.
      el.style.aspectRatio = ''; 
    };

    el.onload = finish;
    el.onerror = finish;

    // 3. Load image
    el.src = src;
  }

  static fillList(selector, dataArray, createItemFn) {
    // ... (unchanged) ...
    const container = document.querySelector(selector);
    if (!container || !dataArray) return;
    container.innerHTML = ''; 
    dataArray.forEach(item => {
      const element = createItemFn(item);
      container.appendChild(element);
    });
  }

  static revealCarousel() {
    const wrapper = document.querySelector('.carousel-track-wrapper');
    if (wrapper) {
        wrapper.classList.remove('skeleton', 'skeleton-carousel');
        wrapper.style.aspectRatio = '';
    }
  }
}