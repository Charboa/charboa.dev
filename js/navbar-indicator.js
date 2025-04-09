document.addEventListener("DOMContentLoaded", function () {
  const indicator = document.querySelector(".nav-indicator");
  const links = document.querySelectorAll(".nav-links a");

  // Function to update the position of the indicator
  function updateIndicatorPosition() {
      const activeLink = document.querySelector(".nav-links .active"); // Get active link
      if (!activeLink) return;

      const rect = activeLink.getBoundingClientRect(); // Get position of the active link
      const navContainer = document.querySelector(".nav-container").getBoundingClientRect(); // Get nav container position

      // Update the indicator position based on the active link
      indicator.style.left = `${rect.left - navContainer.left}px`;
      indicator.style.width = `${rect.width}px`;
  }

  // Function to handle clicks and manually add the 'active' class
  links.forEach(link => {
      link.addEventListener("click", function () {
          // Remove 'active' class from all links
          links.forEach(link => link.classList.remove("active"));
          
          // Add 'active' class to the clicked link
          this.classList.add("active");

          // Update indicator position
          updateIndicatorPosition();
      });
  });

  // Set the initial active link based on the current URL
  function setInitialActiveLink() {
      const currentUrl = window.location.pathname;

      links.forEach(link => {
          if (link.getAttribute("href") === currentUrl) {
              link.classList.add("active"); // Add 'active' class to the matching link
          }
      });

      updateIndicatorPosition(); // Update indicator after page load
  }

  // Call the function to set the initial active link
  setInitialActiveLink();

  // Update the indicator position on window resize
  window.addEventListener("resize", updateIndicatorPosition);
});
