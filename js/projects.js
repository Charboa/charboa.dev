document.addEventListener("DOMContentLoaded", () => {
    fetch('https://charboa.github.io/charboa.dev/data/projects.json')

        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('project-list');

            data.forEach(project => {
                const card = document.createElement('div');
                card.classList.add('project-card');

                card.innerHTML = `
          <img src="${project.image}" alt="${project.title}" class="project-image">
          <div class="project-content">
            <h2>${project.title}</h2> 
            <p>${project.description}</p>
            <a href="${project.link}" target="_blank">View on GitHub</a>
          </div>
        `;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Failed to load project data:", error);
        });
});
