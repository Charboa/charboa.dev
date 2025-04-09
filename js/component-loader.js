document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar", "./components/navbar.html");
  loadComponent("footer", "./components/footer.html");
});

function loadComponent(id, url) {
  const placeholder = document.getElementById(id);
  if (!placeholder) return;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Network error loading " + url);
      return response.text();
    })
    .then(htmlString => {
      const temp = document.createElement("div");
      temp.innerHTML = htmlString.trim();

      const loadedElement = temp.firstElementChild;

      if (loadedElement) {
        placeholder.replaceWith(loadedElement); // 🛠️ key fix: replace, not insert
      } else {
        console.warn(`No valid root element in ${url}`);
      }
    })
    .catch(err => {
      console.error("Component load failed:", err);
    });
}
