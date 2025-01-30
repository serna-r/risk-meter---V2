document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestions');
    const serviceCard = document.getElementById('serviceCard');
    const riskOfDataExposureElement = document.getElementById('riskOfDataExposure');
    const serviceRiskElement = document.getElementById('serviceRisk');
    const passwordCompositionReq = document.getElementById('passwordCompositionReq');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value;

        if (query.trim() === '') {
            suggestionsContainer.innerHTML = '';
            return;
        }

        fetch(`/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                suggestionsContainer.innerHTML = '';

                if (data.length === 0) {
                    suggestionsContainer.innerHTML = '<p>No services found</p>';
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
            .catch(error => console.error("Error fetching services:", error));
    });

    // Function to display service details in the card and update risk numbers
    function showServiceDetails(service) {
            // Function to map min mask shorthand to full words
        function formatMinMask(minMask) {
            const maskMap = {
                l: 'one lowercase character',
                u: 'one uppercase character',
                d: 'one decimal character',
                s: 'one special character'
            };

            // Map each character in minMask to its full word
            return minMask
                .split('') // Split the shorthand into individual characters
                .map(char => maskMap[char] || char) // Replace with full word or leave as is if not in the map
                .join(', '); // Join the full words with commas
        }

        // Format min mask using the helper function
        const formattedMinMask = formatMinMask(service['min mask']);

        serviceCard.innerHTML = `
            <h2>${service.Website}</h2>
            <p>Description: ${service.Type}.
            The service ${service['2fa'] == 1 ? "provides two-factor authentication." : "does not provide two-factor authentication."}
            </p>
        `;
        

        passwordCompositionReq.innerHTML = `
        <p>Minimum Length: you need at least ${service['min length']} characters</p>
        <p>Minimum characters: you need at least ${formattedMinMask}</p>
        `
        // <p>Blocklist policy: ${service['extra sec'] === 1 ? "Yes" : "No"}</p>
        // <p  class="explanation-text">The service has a blacklist for common passwords</p>
        

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
