(() => {
  const hideLoader = () => {
    const loader = document.getElementById("pageLoader");
    if (!loader) return;

    // 1. Fade out
    loader.classList.add("hidden");

    // 2. Remove from DOM after transition
    setTimeout(() => {
      loader.remove();
    }, 600); 
  };

  // The "Goldilocks" Promise:
  // Wait for HTML structure AND Fonts to be ready.
  Promise.all([
    // Wait for fonts to load (Prevents font jumping)
    document.fonts.ready,
    // Wait for HTML to parse (Ensures elements exist)
    new Promise(resolve => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", resolve);
      } else {
        resolve();
      }
    })
  ]).then(hideLoader);

  // Safety Net: If fonts hang forever, force hide after 3 seconds
  setTimeout(hideLoader, 3000);
})();