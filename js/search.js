document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestions');
    const serviceCard = document.getElementById('serviceCard');
    const riskOfDataExposureElement = document.getElementById('riskOfDataExposure');
    const serviceRiskElement = document.getElementById('serviceRisk');
    const passwordCompositionReq = document.getElementById('passwordCompositionReq');

    // Get language from localStorage (fallback to English)
    const lang = localStorage.getItem('lang') || 'en';

    // Load translation JSON dynamically
    async function loadTranslation(lang) {
        try {
            const response = await fetch(`data/translations/${lang}.json`);
            if (!response.ok) throw new Error("Translation file not found");
            return await response.json();
        } catch (error) {
            console.error("Error loading translation:", error);
            return {}; 
        }
    }

    // Load translations
    const texts = await loadTranslation(lang);
    
    // Set translated placeholder text for the search bar
    if (searchInput) {
        searchInput.setAttribute("placeholder", texts.search_service || "Search service...");
    }

    try {
        const response = await fetch("data/services.json");
        if (!response.ok) throw new Error("Failed to load services.json");
        const services = await response.json();

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            suggestionsContainer.innerHTML = "";

            if (query.length === 0) return;

            const results = services.filter(service =>
                service.Website.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                suggestionsContainer.innerHTML = `<p>${texts.no_services_found || "No services found"}</p>`;
                return;
            }

            results.forEach(service => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.textContent = service.Website;

                suggestion.addEventListener('click', () => {
                    searchInput.value = service.Website;
                    suggestionsContainer.innerHTML = "";
                    showServiceDetails(service, texts);
                });

                suggestionsContainer.appendChild(suggestion);
            });
        });

    } catch (error) {
        console.error("Error loading services:", error);
    }

    function showServiceDetails(service, texts) {
        function formatMinMask(minMask) {
            const maskMap = {
                l: texts.lowercase_character || 'one lowercase character',
                u: texts.uppercase_character || 'one uppercase character',
                d: texts.decimal_character || 'one decimal character',
                s: texts.special_character || 'one special character'
            };

            return minMask
                .split('')
                .map(char => maskMap[char] || char)
                .join(', ');
        }

        const formattedMinMask = formatMinMask(service['min mask']);

        serviceCard.innerHTML = `
            <h2 id="service-title">${service.Website}</h2>
            <div id="details">
                <p id="risk-data-exp">
                    <strong>${texts.risk_of_data_exposure || "Risk of Data Exposure"}:</strong>  
                    <span class="tooltip-icon" data-tooltip="${texts.tooltip_risk_of_data_exposure || "The risk of your private data being leaked on the internet"}">?</span>
                </p>
                <p class="service-info">${service.Type}</p>

                <p id="user-login-protection">
                    <strong>${texts.user_login_protection || "User Login Protection"}:</strong> 
                    <span class="tooltip-icon" data-tooltip="${texts.tooltip_user_login_protection || "The protection provided by the service"}">?</span>
                </p>
                <p class="service-info">
                    <p>${texts.min_length || "Minimum Length"}: ${texts.you_need_at_least || "You need at least"} ${service['min length']} ${texts.characters || "characters"}</p>
                    <p>${texts.min_characters || "Minimum characters"}: ${texts.you_need_at_least || "You need at least"} ${formattedMinMask}</p>
                    ${service['2fa'] == 1 
                        ? (texts.tfa_yes || "Provides two-factor authentication") 
                        : (texts.tfa_no || "Does not provide two-factor authentication")}
                </p>
            </div>
        `;

        if (riskOfDataExposureElement) {
            riskOfDataExposureElement.textContent = service['Dexp'].toFixed(2);
        }
        if (serviceRiskElement) {
            serviceRiskElement.textContent = service['Service Risk'].toFixed(2);
        }

        sessionStorage.setItem('selectedService', JSON.stringify(service));

        if (typeof calculateAndUpdateRisks === "function") {
            calculateAndUpdateRisks();
        } else {
            console.warn("calculateAndUpdateRisks function is missing.");
        }
    }
});
