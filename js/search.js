async function loadSearch(texts) {
    const searchInput = document.getElementById("searchInput");
    const suggestionsContainer = document.getElementById("suggestions");

    // Load Data from JSON
    const services = await fetch("data/services.json")
        .then(res => res.json())
        .catch(err => console.error("Failed to load services:", err));

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        suggestionsContainer.innerHTML = "";

        const results = services.filter(service => 
            service.Website.toLowerCase().includes(query)
        );

        if (results.length === 0) {
            suggestionsContainer.innerHTML = `<p>${texts.no_services_found}</p>`;
            return;
        }

        results.forEach(service => {
            const div = document.createElement("div");
            div.textContent = service.Website;
            div.classList.add("suggestion-item");
            div.addEventListener("click", () => {
                searchInput.value = service.Website;
                suggestionsContainer.innerHTML = "";
                showServiceDetails(service, texts);
            });
            suggestionsContainer.appendChild(div);
        });
    });
}
