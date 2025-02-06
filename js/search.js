document.addEventListener('DOMContentLoaded', async () => {
    const dropdown = document.getElementById('serviceDropdown'); 
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

    try {
        const response = await fetch("data/services.json");
        if (!response.ok) throw new Error("Failed to load services.json");
        const allServices = await response.json();
        
        // Select services based on language
        const services = allServices[lang] || [];

        // Populate dropdown menu
        if (dropdown) {
            dropdown.innerHTML = `<option value="">${texts.select_service || "Select a service..."}</option>`;

            services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.Website;
                option.textContent = service.Website;
                dropdown.appendChild(option);
            });

            // Event Listener for dropdown change
            dropdown.addEventListener('change', () => {
                const selectedService = services.find(service => service.Website === dropdown.value);
                if (selectedService) {
                    showServiceDetails(selectedService, texts);
                }
            });
        }

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
                </p>
                <p class="service-info">${service.Type}</p>

                <p id="user-login-protection">
                    <strong>${texts.user_login_protection || "User Login Protection"}:</strong>
                </p>
                <p class="service-info">
                    <p id="minimumLength">${texts.min_length || "Minimum Length"}: ${texts.you_need_at_least || "You need at least"} ${service['min length']} ${texts.characters || "characters"}</p>
                    <p id="minimumCharacters">${texts.min_characters || "Minimum characters"}: ${texts.you_need_at_least || "You need at least"} ${formattedMinMask}</p>
                    ${service['2fa'] == 1 
                        ? (texts.tfa_yes || "Provides two-factor authentication") 
                        : (texts.tfa_no || "Does not provide two-factor authentication")}
                </p>
                <br>
            </div>
        `;

        if (riskOfDataExposureElement) {
            riskOfDataExposureElement.textContent = service['Dexp'].toFixed(2);
        }
        if (serviceRiskElement) {
            serviceRiskElement.textContent = service['Service Risk'].toFixed(2);
        }


        // Store the service in the session
        sessionStorage.setItem('selectedService', JSON.stringify(service));

        if (typeof calculateAndUpdateRisks === "function") {
            calculateAndUpdateRisks();
        } else {
            console.warn("calculateAndUpdateRisks function is missing.");
        }
    }
});
