export default class Loader {
  
  /**
   * Creates a NEW <img> element with skeleton logic.
   * Returns the DOM element so you can append it.
   */
  static createImage(src, className = '', alt = '') {
    const img = document.createElement('img');
    if (className) img.className = className;
    img.alt = alt;
    
    // Add skeleton immediately
    img.classList.add('skeleton');

    // Define finish handler
    const finish = () => img.classList.remove('skeleton');

    img.onload = finish;
    img.onerror = finish;
    
    // Set src last
    img.src = src;
    
    return img;
  }

  /**
   * Loads a source into an EXISTING <img> element.
   */
  static loadImage(imgElement, src) {
    if (!imgElement) return;

    imgElement.classList.add('skeleton');
    
    const finish = () => imgElement.classList.remove('skeleton');

    imgElement.onload = finish;
    imgElement.onerror = finish;
    
    imgElement.src = src;
  }

  /**
   * Wraps a container in skeleton state while waiting for a Promise.
   */
  static async task(container, promise) {
    if (!container) return await promise;
    
    container.classList.add('skeleton');
    try {
      return await promise;
    } finally {
      container.classList.remove('skeleton');
    }
  }
}