document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestions');
    const serviceCard = document.getElementById('serviceCard');
    const riskOfDataExposureElement = document.getElementById('riskOfDataExposure');
    const serviceRiskElement = document.getElementById('serviceRisk');
    const passwordCompositionReq = document.getElementById('passwordCompositionReq');

    // Get the language parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || 'en'; // Default to English

    // Load translation JSON dynamically
    async function loadTranslation(lang) {
        try {
            const response = await fetch(`/static/json/translations/${lang}.json`);
            if (!response.ok) throw new Error("Translation file not found");
            return await response.json();
        } catch (error) {
            console.error("Error loading translation:", error);
            return {}; // Return empty object if translation fails
        }
    }

    // Load translations
    const texts = await loadTranslation(lang);

    // Set translated placeholder text for the search bar
    searchInput.setAttribute("placeholder", texts.search_service || "Search service...");

    searchInput.addEventListener('input', () => {
        const query = searchInput.value;

        if (query.trim() === '') {
            suggestionsContainer.innerHTML = '';
            return;
        }

        fetch(`/search?query=${encodeURIComponent(query)}&lang=${lang}`)
            .then(response => response.json())
            .then(data => {
                suggestionsContainer.innerHTML = '';

                if (data.length === 0) {
                    suggestionsContainer.innerHTML = `<p>${texts.no_services_found || "No services found"}</p>`;
                    return;
                }

                data.forEach(service => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'suggestion-item';
                    suggestion.textContent = service.Website;

                    // Add click event to select a service
                    suggestion.addEventListener('click', () => {
                        searchInput.value = service.Website; // Set input value
                        suggestionsContainer.innerHTML = ''; // Clear suggestions
                        showServiceDetails(service); // Show selected service details
                    });

                    suggestionsContainer.appendChild(suggestion);
                });
            })
            .catch(error => console.error(texts.error_fetching_services || "Error fetching services:", error));
    });

    // Function to display service details in the card and update risk numbers
    function showServiceDetails(service) {
        // Function to map min mask shorthand to full words
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

        // Format min mask using the helper function
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

        passwordCompositionReq.innerHTML = `
        
        `;

        // Update Risk of Data Exposure and Service Risk values in the DOM (if elements exist)
        if (riskOfDataExposureElement) {
            riskOfDataExposureElement.textContent = service['Dexp'].toFixed(2);
        }
        if (serviceRiskElement) {
            serviceRiskElement.textContent = service['Service Risk'].toFixed(2);
        }

        // Store service data in the session
        sessionStorage.setItem('selectedService', JSON.stringify(service));

        // Recalculate risks
        calculateAndUpdateRisks();
    }
});
