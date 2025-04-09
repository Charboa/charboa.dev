document.addEventListener("cardsLoaded", () => {
    const cards = document.querySelectorAll('.project-card');
  
    cards.forEach(card => {
      card.addEventListener('mousemove', (event) => {
        const { width, height, left, top } = card.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
  
        const mouseX = event.clientX;
        const mouseY = event.clientY;
  
        // Calculate tilt angle (card rotation based on mouse position)
        const angleX = (mouseY - centerY) / height * 20;  // Adjust tilt range for X axis
        const angleY = (mouseX - centerX) / width * -20;  // Adjust tilt range for Y axis
  
        // Set the transform for the card (tilt based on mouse movement)
        card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
  
        // Now update the shine's position based on the tilt
        const shineX = angleX * 0.1; // Adjust shine effect speed for X axis
        const shineY = angleY * 0.1; // Adjust shine effect speed for Y axis
  
        // Set custom properties for shine effect
        card.style.setProperty('--shine-angle-x', `${shineX}deg`);
        card.style.setProperty('--shine-angle-y', `${shineY}deg`);
      });
  
      card.addEventListener('mouseleave', () => {
        card.style.transform = `rotateX(0deg) rotateY(0deg)`;  // Reset tilt on mouse leave
        card.style.setProperty('--shine-angle-x', `0deg`);  // Reset shine position
        card.style.setProperty('--shine-angle-y', `0deg`);  // Reset shine position
      });
    });
  });
  