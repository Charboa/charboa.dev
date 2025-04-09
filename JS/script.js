document.addEventListener('DOMContentLoaded', () => {
  const socialButtons = document.querySelectorAll('.social-button');

  socialButtons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const gradientX = (x / rect.width) * 100;
      const gradientY = (y / rect.height) * 100;

      button.style.setProperty('--gradient-x', `${gradientX}%`);
      button.style.setProperty('--gradient-y', `${gradientY}%`);
    });

    button.addEventListener('mouseleave', () => {
      button.style.setProperty('--gradient-x', '50%');
      button.style.setProperty('--gradient-y', '50%');
    });
  });
});


