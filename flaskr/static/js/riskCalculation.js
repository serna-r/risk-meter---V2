document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password'); // Password input field
    const passwordScoreOutput = document.getElementById('passwordScore'); // Password score display
    const passwordReuses = document.getElementById('reuses'); // Password reuses dropdown
    const userRiskElement = document.getElementById('userRisk'); // User Risk display
    const riskOfDataExposureElement = document.getElementById('riskOfDataExposure'); // Data Exposure Risk
    const serviceRiskElement = document.getElementById('serviceRisk'); // Service Risk
    const globalRiskElement = document.getElementById('globalRisk'); // Global Risk display
    const globalRiskColor = document.getElementById('globalRiskColor'); // Color indicator for Global Risk
    const dataExposureIndicator = document.getElementById('riskOfDataExposureIndicator'); // Data Exposure Indicator
    const serviceRiskIndicator = document.getElementById('serviceRiskIndicator'); // Service Risk Indicator
    const userRiskIndicator = document.getElementById('userRiskIndicator'); // User Risk Indicator

    // Define thresholds for each risk type
    const topglobalriskvalue = 65;
    const topvalueRD = 13;
    const topvalueOtherRisks = 2;

    // Default values for risks (used when elements are missing in the DOM)
    const DEFAULT_DATA_EXPOSURE_RISK = 0;
    const DEFAULT_SERVICE_RISK = 0;
    const DEFAULT_USER_RISK = 0;

    // Function to calculate User Risk
    function calculateUserRisk(passwordScore, passwordReusesValue) {
        const adjustedReuses = passwordReusesValue > 3 ? 10 : passwordReusesValue;
        return ((4 - passwordScore) * adjustedReuses) / 20;
    }

    // Function to calculate Global Risk
    function calculateGlobalRisk(dataExposureRisk, serviceRisk, userRisk) {
        return dataExposureRisk * (1 + serviceRisk + userRisk);
    }

    // Function to update Risk Indicator colors based on thresholds
    function updateRiskIndicatorColor(value, indicatorElement, riskType) {
        let thresholds;

        switch (riskType) {
            case 'dataExposure':
                thresholds = {
                    green: topvalueRD * 0.25,
                    yellow: topvalueRD * 0.5,
                    orange: topvalueRD * 0.75,
                };
                break;
            case 'serviceAuthentication':
            case 'userLogin':
                thresholds = {
                    green: topvalueOtherRisks * 0.25,
                    yellow: topvalueOtherRisks * 0.5,
                    orange: topvalueOtherRisks * 0.75,
                };
                break;
            default:
                thresholds = { green: 1, yellow: 3, orange: 5 }; // Default thresholds
        }

        // Apply thresholds to determine color
        if (value < thresholds.green) {
            indicatorElement.style.backgroundColor = 'green';
        } else if (value < thresholds.yellow) {
            indicatorElement.style.backgroundColor = 'yellow';
        } else if (value < thresholds.orange) {
            indicatorElement.style.backgroundColor = 'orange';
        } else {
            indicatorElement.style.backgroundColor = 'red';
        }
    }

    function calculateAndUpdateRisks() {
        const password = passwordInput ? passwordInput.value : '';
        const passwordReusesValue = passwordReuses ? parseInt(passwordReuses.value) || 0 : 0;
    
        // Get the password score
        const passwordScore = passwordInput ? zxcvbn(password).score : 0;
    
        // Calculate User Risk
        const userRisk = calculateUserRisk(passwordScore, passwordReusesValue);
        if (userRiskElement) {
            userRiskElement.textContent = userRisk.toFixed(2);
        }
    
        // Retrieve service data from the session if necessary
        const storedService = JSON.parse(sessionStorage.getItem('selectedService')) || {};
        const riskOfDataExposure = riskOfDataExposureElement
            ? parseFloat(riskOfDataExposureElement.textContent)
            : storedService['Dexp'] || DEFAULT_DATA_EXPOSURE_RISK;
    
        const serviceRisk = serviceRiskElement
            ? parseFloat(serviceRiskElement.textContent)
            : storedService['Service Risk'] || DEFAULT_SERVICE_RISK;
    
        // Update indicators if DOM elements exist
        if (dataExposureIndicator) {
            updateRiskIndicatorColor(riskOfDataExposure, dataExposureIndicator, 'dataExposure');
        }
    
        if (serviceRiskIndicator) {
            updateRiskIndicatorColor(serviceRisk, serviceRiskIndicator, 'serviceAuthentication');
        }
    
        if (userRiskIndicator) {
            updateRiskIndicatorColor(userRisk, userRiskIndicator, 'userLogin');
        }
    
        // Calculate Global Risk
        const globalRisk = calculateGlobalRisk(riskOfDataExposure, serviceRisk, userRisk);
    
        // Update Global Risk display and color
        globalRiskElement.textContent = globalRisk.toFixed(2);
        updateGlobalRiskColor(globalRisk);

    }
    

    // Function to update the color of the Global Risk indicator
    function updateGlobalRiskColor(globalRisk) {
        const thresholds = {
            green: topglobalriskvalue * 0.25,
            yellow: topglobalriskvalue * 0.5,
            orange: topglobalriskvalue * 0.75,
        };

        if (globalRisk < thresholds.green) {
            globalRiskColor.style.backgroundColor = 'green';
        } else if (globalRisk < thresholds.yellow) {
            globalRiskColor.style.backgroundColor = 'yellow';
        } else if (globalRisk < thresholds.orange) {
            globalRiskColor.style.backgroundColor = 'orange';
        } else {
            globalRiskColor.style.backgroundColor = 'red';
        }
    }

    // Attach the function to the global scope
    window.calculateAndUpdateRisks = calculateAndUpdateRisks;

    // Event listener for password input changes
    passwordInput.addEventListener('input', () => {
        calculateAndUpdateRisks();
    });

    // Event listener for password reuses dropdown changes
    passwordReuses.addEventListener('change', () => {
        calculateAndUpdateRisks();
    });
});
