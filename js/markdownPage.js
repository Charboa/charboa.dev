// /js/markdownPage.js

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const mdPath = params.get("md");
  const container = document.getElementById("markdown-content");

  if (!mdPath) {
    container.innerHTML = "<p>⚠️ No markdown file specified.</p>";
    return;
  }

  try {
    const response = await fetch(mdPath);
    if (!response.ok) throw new Error(`Failed to load ${mdPath}`);

    const markdown = await response.text();
    const html = marked.parse(markdown);

    container.innerHTML = html;

  } catch (err) {
    container.innerHTML = `<p>❌ Error loading markdown: ${err.message}</p>`;
  }
});
