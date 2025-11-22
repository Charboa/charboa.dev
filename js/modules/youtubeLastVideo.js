import Loader from '/js/utils/loader.js';

async function loadLatestVideo() {
    // Select the wrapper container to apply the skeleton effect
    const iframe = document.getElementById("latestVideo");
    const container = iframe.parentElement; 

    try {
        // Loader.task adds .skeleton, waits for fetch, then removes .skeleton
        const response = await Loader.task(container, fetch("https://latest-youtube-video-367191311759.europe-west1.run.app"));
        
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        
        // Only set src after data arrives
        iframe.src = `https://www.youtube.com/embed/${data.videoId}?autoplay=1&mute=1&loop=1&playlist=${data.videoId}`;
    } catch (err) {
        console.error("Failed to load latest video:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadLatestVideo);