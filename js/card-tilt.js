document.addEventListener("cardsLoaded", () => {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (event) => {
      const { width, height, left, top } = card.getBoundingClientRect();
      const mouseX = event.clientX - left;
      const mouseY = event.clientY - top;

      const centerX = width / 2;
      const centerY = height / 2;

      const rotateX = ((mouseY - centerY) / height) * 20;
      const rotateY = ((mouseX - centerX) / width) * -20;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      // Set radial shine position
      const shineX = (mouseX / width) * 100;
      const shineY = (mouseY / height) * 100;

      card.style.setProperty('--shine-x', `${shineX}%`);
      card.style.setProperty('--shine-y', `${shineY}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      card.style.setProperty('--shine-x', '50%');
      card.style.setProperty('--shine-y', '50%');
    });
  });
});
