// document.addEventListener("DOMContentLoaded", () => {
//     //fetch('https://raw.githubusercontent.com/charboa/charboa.dev/main/data/projects.json')
//     fetch('data/projects.json')

//         .then(res => res.json())
//         .then(data => {
//             const container = document.getElementById('project-list');

//             data.forEach(project => {
//                 const card = document.createElement('div');
//                 card.classList.add('project-card');

//                 card.innerHTML = `
//           <img src="${project.image}" alt="${project.title}" class="project-image">
//           <div class="project-content">
//             <h2>${project.title}</h2> 
//             <p>${project.description}</p>
//             <a href="${project.link}" target="_blank">View on GitHub</a>
//           </div>
//         `;

//                 container.appendChild(card);
//             });
//         })
//         .catch(error => {
//             console.error("Failed to load project data:", error);
//         });
// });

document.addEventListener("DOMContentLoaded", () => {
    fetch('data/games.json')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('games-list');

            data.forEach(game => {
                const card = document.createElement('div');
                card.classList.add('games-card');

                card.innerHTML = `
                    <img src="${game.image}" alt="${game.title}" class="games-image">
                    <div class="games-content">
                        <h2>${game.title}</h2> 
                        <p>${game.description}</p>
                        <a href="${game.link}" target="_blank">Play now!</a>
                    </div>
                `;

                container.appendChild(card);
            });

            document.dispatchEvent(new Event("cardsLoaded"));
        })
        .catch(error => {
            console.error("Failed to load project data:", error);
        });
});

document.dispatchEvent(new Event("cardsLoaded"));
console.log("cardsLoaded event dispatched.");


