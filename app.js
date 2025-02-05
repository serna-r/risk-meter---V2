document.addEventListener("DOMContentLoaded", async () => {
    const mainContent = document.getElementById("main-content");

    // Cargar traducciones dinámicamente
    const lang = localStorage.getItem("lang") || "en";
    const texts = await fetch(`data/translations/${lang}.json`).then(res => res.json());

    mainContent.innerHTML = `
        <h1>${texts.title}</h1>
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="${texts.search_service}">
            <div id="suggestions" class="suggestions-list"></div>
        </div>
        <div class="container">
            <div class="card" id="passwordStrength">
                <h2>${texts.user_choices}</h2>
                <input type="password" id="password" placeholder="${texts.enter_password_placeholder}">
                <p id="passwordScore"></p>
            </div>
            <div class="card" id="riskIndicators">
                <h3>${texts.risk_indicators}</h3>
                <div class="indicator">${texts.risk_of_data_exposure}: <span id="riskOfDataExposure"></span></div>
                <div class="indicator">${texts.user_login_protection}: <span id="serviceRisk"></span></div>
                <div class="indicator">${texts.user_choices}: <span id="userRisk"></span></div>
            </div>
        </div>
    `;

    document.getElementById("langSwitch").addEventListener("click", () => {
        const newLang = lang === "en" ? "es" : "en";
        localStorage.setItem("lang", newLang);
        location.reload();
    });

    // Cargar funcionalidad de búsqueda
    loadSearch(texts);
});
