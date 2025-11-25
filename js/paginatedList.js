document.addEventListener("DOMContentLoaded", () => {
    const scripts = document.querySelectorAll('script[src*="paginatedList.js"]');

    scripts.forEach(script => {
        // --- 1. CONFIGURATION ---
        const dataUrl = script.getAttribute("data-json");
        const containerId = script.getAttribute("data-container") || "paginatedList-list";
        const paginationId = script.getAttribute("data-pagination") || "paginatedList-pagination";
        const searchId = script.getAttribute("data-search") || "paginatedList-search";
        const openInNewTab = script.getAttribute("data-newtab") === "true";
        const itemsPerPage = parseInt(script.getAttribute("data-items-per-page")) || 6;
        const showDescription = script.getAttribute("data-show-description") !== "false";
        
        // RESTORED: Dimensions logic
        const elementHeightAttr = script.getAttribute("data-element-height");
        const elementMargin = script.getAttribute("data-element-margin") || "0px";

        // RESTORED: Helper to parse px
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

        // RESTORED: Height Calculation Logic
        function getCardHeight(containerEl) {
            const containerHeight = containerEl.clientHeight || window.innerHeight;
            const marginPx = cssToPx(elementMargin);
            const totalGaps = Math.max(0, itemsPerPage - 1);
            const totalVerticalMargins = marginPx * totalGaps;
            const availableHeight = Math.max(0, containerHeight - totalVerticalMargins);
            const computedHeightPx = availableHeight / itemsPerPage;
            
            return elementHeightAttr && elementHeightAttr !== "auto"
                ? elementHeightAttr
                : `${computedHeightPx}px`;
        }

        // Helper: Ensure DOM elements exist
        const ensureElement = (id, tag, classes, insertFn) => {
            let el = document.getElementById(id);
            if (!el) {
                el = document.createElement(tag);
                el.id = id;
                classes.forEach(c => el.classList.add(c));
                insertFn(el);
            }
            return el;
        };

        // --- 2. BUILD STRUCTURE ---
        const searchInput = ensureElement(searchId, "input", ["paginatedList-header", "paginatedList-search"], (el) => {
            el.type = "text";
            el.placeholder = "Search...";
            script.parentNode.insertBefore(el, script);
        });

        const container = ensureElement(containerId, "div", ["paginatedList-container"], (el) => {
            script.parentNode.insertBefore(el, script);
        });

        const pagination = ensureElement(paginationId, "div", ["paginatedList-pagination"], (el) => {
            container.insertAdjacentElement("afterend", el);
        });

        // --- 3. RENDER SKELETONS (Immediate Feedback) ---
        function renderSkeletons() {
            container.innerHTML = "";
            // Calculate height immediately for skeletons
            const cardHeight = getCardHeight(container);

            for (let i = 0; i < itemsPerPage; i++) {
                const card = document.createElement("div");
                card.classList.add("paginatedList-element", "skeleton");
                
                // APPLY DYNAMIC HEIGHT & MARGIN TO SKELETONS
                card.style.height = cardHeight;
                if (i < itemsPerPage - 1) card.style.marginBottom = elementMargin;

                card.innerHTML = `
                    <div class="paginatedList-element-image skeleton"></div>
                    <div class="paginatedList-element-content">
                        <h2 class="skeleton">&nbsp;</h2>
                        <p class="skeleton">&nbsp;</p>
                        <p class="skeleton" style="width: 60%">&nbsp;</p>
                        <span class="skeleton">&nbsp;</span>
                    </div>
                `;
                container.appendChild(card);
            }
        }

        // Run immediately
        renderSkeletons();

        // --- 4. FETCH & HYDRATE ---
        let items = [];
        let filteredItems = [];
        let currentPage = 1;

        fetch(dataUrl)
            .then(res => res.json())
            .then(data => {
                items = data;
                filteredItems = data;
                renderPage(currentPage);
            })
            .catch(error => {
                console.error("PaginatedList: Failed to load data:", error);
                container.innerHTML = "<p style='text-align:center; color:var(--color-muted)'>Failed to load content.</p>";
            });

        // --- 5. RENDER REAL CONTENT ---
        function renderPage(page) {
            container.innerHTML = ""; 
            
            // Recalculate height in case window resized
            const cardHeight = getCardHeight(container);

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const visible = filteredItems.slice(start, end);

            visible.forEach((item, index) => {
                const card = document.createElement("a");
                card.classList.add("paginatedList-element");
                card.href = item.link;
                
                if (openInNewTab) {
                    card.target = "_blank";
                    card.rel = "noopener noreferrer";
                }

                // APPLY DYNAMIC HEIGHT & MARGIN
                card.style.height = cardHeight;
                if (index < visible.length - 1) {
                    card.style.marginBottom = elementMargin;
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

        function updatePaginationControls() {
            pagination.innerHTML = "";
            pagination.classList.add("paginatedList-pagination-controls");

            if (filteredItems.length <= itemsPerPage) return; 

            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

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

        function changePage(newPage) {
            currentPage = newPage;
            renderPage(currentPage);
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

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
    });
});