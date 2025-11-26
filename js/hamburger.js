document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const links = document.querySelectorAll(".nav-links li");
    const header = document.querySelector("header");

    const toggleMenu = () => {
        const isActive = hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");

        if (isActive) {
            // 1. Calculate the width of the scrollbar dynamically
            // If page is non-scrollable, this returns 0
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            // 2. Only apply padding if there IS a scrollbar (width > 0)
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
                header.style.paddingRight = `${scrollbarWidth}px`;
            }
            
            // 3. Lock scroll
            document.body.style.overflow = "hidden";
        } else {
            // Reset everything
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            header.style.paddingRight = "";
        }
    };

    hamburger.addEventListener("click", toggleMenu);

    links.forEach(link => {
        link.addEventListener("click", () => {
            if (hamburger.classList.contains("active")) {
                toggleMenu();
            }
        });
    });
});