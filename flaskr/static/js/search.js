document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestions');
    const serviceCard = document.getElementById('serviceCard');

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

    // Function to display service details in the card
    function showServiceDetails(service) {
        serviceCard.innerHTML = `
            <h2>${service.Website}</h2>
            <p>Type: ${service.Type}</p>
            <p>Min Length: ${service['min length']}</p>
            <p>Extra Security: ${service['extra sec']}</p>
            <p>2FA: ${service['2fa']}</p>
            <!-- Add other fields as needed -->
        `;
    }
});
