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
                    suggestionsContainer.innerHTML = '<p>No se encontraron servicios</p>';
                    return;
                }

                data.forEach(service => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'suggestion-item';
                    suggestion.textContent = service.Website;

                    // Agregar evento de clic para seleccionar un servicio
                    suggestion.addEventListener('click', () => {
                        searchInput.value = service.Website; // Establecer valor de entrada
                        suggestionsContainer.innerHTML = ''; // Limpiar sugerencias
                        showServiceDetails(service); // Mostrar detalles del servicio seleccionado
                    });

                    suggestionsContainer.appendChild(suggestion);
                });
            })
            .catch(error => console.error("Error al obtener servicios:", error));
    });

    // Función para mostrar detalles del servicio en la tarjeta y actualizar los valores de riesgo
    function showServiceDetails(service) {
            // Función para mapear el formato de máscara mínima a palabras completas
        function formatMinMask(minMask) {
            const maskMap = {
                l: 'una letra minúscula',
                u: 'una letra mayúscula',
                d: 'un número decimal',
                s: 'un carácter especial'
            };

            // Mapear cada carácter de minMask a su palabra completa
            return minMask
                .split('') // Dividir la máscara en caracteres individuales
                .map(char => maskMap[char] || char) // Reemplazar con la palabra completa o dejarlo igual si no está en el mapa
                .join(', '); // Unir las palabras completas con comas
        }

        // Formatear la máscara mínima usando la función auxiliar
        const formattedMinMask = formatMinMask(service['min mask']);

        serviceCard.innerHTML = `
        <h2 id="service-title">${service.Website}</h2>
            <div id="details">
                <p id="risk-data-exp">
                    <strong>Riesgo de exposición de datos:</strong>  
                    <span class="tooltip-icon" data-tooltip="El riesgo de que sus datos privados sean filtrados en internet">?</span>
                </p>
                <p class="service-info">${service.Type}</p>

                <p id="user-login-protection">
                    <strong>Protección de inicio de sesión:</strong> 
                    <span class="tooltip-icon" data-tooltip="La protección proporcionada por el servicio">?</span>
                </p>
                <p class="service-info">El servicio ${service['2fa'] == 1 ? "proporciona autenticación de dos factores." : "no proporciona autenticación de dos factores."}</p>
            </div>
        `;

        passwordCompositionReq.innerHTML = `
        <p>Longitud mínima: necesitas al menos ${service['min length']} caracteres</p>
        <p>Caracteres mínimos: necesitas al menos ${formattedMinMask}</p>
        `;

        // <p>Política de lista de bloqueo: ${service['extra sec'] === 1 ? "Sí" : "No"}</p>
        // <p  class="explanation-text">El servicio tiene una lista negra para contraseñas comunes</p>
        
        // Actualizar los valores de Riesgo de Exposición de Datos y Riesgo del Servicio en el DOM (si existen los elementos)
        if (riskOfDataExposureElement) {
            riskOfDataExposureElement.textContent = service['Dexp'].toFixed(2);
        }
        if (serviceRiskElement) {
            serviceRiskElement.textContent = service['Service Risk'].toFixed(2);
        }

        // Almacenar datos del servicio en la sesión
        sessionStorage.setItem('selectedService', JSON.stringify(service));

        // Recalcular riesgos
        calculateAndUpdateRisks();
    }
});
