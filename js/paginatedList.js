// paginatedList.js
document.addEventListener("DOMContentLoaded", () => {
    const scripts = document.querySelectorAll('script[src*="paginatedList.js"]');

    scripts.forEach(script => {
        // Read attributes from the script tag
        const dataUrl = script.getAttribute("data-json");
        const containerId = script.getAttribute("data-container") || "paginatedList-list";
        const paginationId = script.getAttribute("data-pagination") || "paginatedList-pagination";
        const searchId = script.getAttribute("data-search") || "paginatedList-search";
        const openInNewTab = script.getAttribute("data-newtab") === "true";
        const itemsPerPage = parseInt(script.getAttribute("data-items-per-page")) || "6";
        const showDescription = script.getAttribute("data-show-description") !== "false";

        const elementHeightAttr = script.getAttribute("data-element-height");
        const elementMargin = script.getAttribute("data-element-margin") || "0px";

        // Ensure container exists or create it
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement("div");
            container.id = containerId;
            container.classList.add("paginatedList-container");
            script.parentNode.insertBefore(container, script);
        }

        // Ensure pagination exists or create it
        let pagination = document.getElementById(paginationId);
        if (!pagination) {
            pagination = document.createElement("div");
            pagination.id = paginationId;
            pagination.classList.add("paginatedList-pagination");
            container.insertAdjacentElement("afterend", pagination);
        }

        // Ensure search input exists or create it
        let searchInput = document.getElementById(searchId);
        if (!searchInput) {
            searchInput = document.createElement("input");
            searchInput.id = searchId;
            searchInput.classList.add("paginatedList-header");
            searchInput.classList.add("paginatedList-search");
            searchInput.type = "text";
            searchInput.placeholder = "Search...";
            container.insertAdjacentElement("beforebegin", searchInput);
        }

        let items = [];
        let filteredItems = [];
        let currentPage = 1;

        function cssToPx(value) {
            const test = document.createElement("div");
            test.style.position = "absolute";
            test.style.visibility = "hidden";
            test.style.height = value;
            document.body.appendChild(test);
            const px = parseFloat(getComputedStyle(test).height) || 0;
            document.body.removeChild(test);
            return px;
        }

        // Fetch JSON data
        fetch(dataUrl)
            .then(res => res.json())
            .then(data => {
                items = data;
                filteredItems = data;
                renderPage(currentPage);
            })
            .catch(error => {
                console.error("PaginatedList: Failed to load data:", error);
                container.innerHTML = "<p>Failed to load content.</p>";
            });

        // Render current page
        function renderPage(page) {
            
            container.innerHTML = "";

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const visible = filteredItems.slice(start, end);

            const containerHeight = container.clientHeight || window.innerHeight;
            const marginPx = cssToPx(elementMargin);
            const totalGaps = Math.max(0, itemsPerPage - 1);
            const totalVerticalMargins = marginPx * totalGaps;
            const availableHeight = Math.max(0, containerHeight - totalVerticalMargins);
            const computedHeightPx = availableHeight / itemsPerPage;
            const cardHeight = elementHeightAttr && elementHeightAttr !== "auto"
                ? elementHeightAttr
                : `${computedHeightPx}px`;

            visible.forEach((item, index) => {
                const card = document.createElement("a");
                
                card.classList.add("paginatedList-element");
                card.href = item.link;

                if (openInNewTab) {
                    card.target = "_blank";
                    card.rel = "noopener noreferrer";
                }

                card.style.height = cardHeight;
                if (index < visible.length - 1) {
                    card.style.margin = `0 0 ${elementMargin} 0`;
                } else {
                    card.style.margin = `0 0 0 0`;
                }

                card.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" class="paginatedList-element-image" draggable="false">
                    <div class="paginatedList-element-content">
                        <h2>${item.title}</h2>
                        ${showDescription && item.description ? `<p>${item.description}</p>` : ""}
                        <span class="see-more">See more...</span>
                    </div>
                `;
                container.appendChild(card);
            });

            updatePaginationControls();
            document.dispatchEvent(new Event("cardsLoaded"));
        }

        // Pagination controls
        function updatePaginationControls() {
            pagination.innerHTML = "";
            pagination.classList.add("paginatedList-pagination-controls");

            const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

            const prevBtn = document.createElement("button");
            prevBtn.textContent = "Previous";
            prevBtn.disabled = currentPage === 1;
            prevBtn.onclick = () => changePage(currentPage - 1);

            const pageInfo = document.createElement("span");           
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

            const nextBtn = document.createElement("button");
            nextBtn.textContent = "Next";
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.onclick = () => changePage(currentPage + 1);

            pagination.append(prevBtn, pageInfo, nextBtn);
        }

        // Change page
        function changePage(newPage) {
            currentPage = newPage;
            renderPage(currentPage);
            //window.scrollTo({ top: 0, behavior: "smooth" });
        }

        // Search handler
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase().trim();
            filteredItems = query
                ? items.filter(item =>
                      (item.title && item.title.toLowerCase().includes(query)) ||
                      (item.description && item.description.toLowerCase().includes(query))
                  )
                : items;
            currentPage = 1;
            renderPage(currentPage);
        });

        console.log(`PaginatedList initialized for ${dataUrl}`);
    });
});
