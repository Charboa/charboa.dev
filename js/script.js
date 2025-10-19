window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.add("hidden");
  }
});

// Function to load the latest video
async function loadLatestVideo() {
    try {
        const response = await fetch("https://latest-youtube-video-367191311759.europe-west1.run.app");
        const data = await response.json();
        const videoId = data.videoId;

        const iframe = document.getElementById("latestVideo");
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    } catch (err) {
        console.error("Failed to load latest video:", err);
    }
}

// Call the function when page loads
document.addEventListener("DOMContentLoaded", loadLatestVideo);



