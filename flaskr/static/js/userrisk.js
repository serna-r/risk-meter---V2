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
    function updateRiskIndicatorColor(value, indicatorElement) {
        if (value < 1) {
            indicatorElement.style.backgroundColor = 'green';
        } else if (value < 3) {
            indicatorElement.style.backgroundColor = 'orange';
        } else {
            indicatorElement.style.backgroundColor = 'red';
        }
    }

    // Function to recalculate and update all risks dynamically
    function calculateAndUpdateRisks() {
        const password = passwordInput.value;
        const passwordReusesValue = parseInt(passwordReuses.value) || 0;

        // Get the password score
        const passwordScore = zxcvbn(password).score;

        // Calculate User Risk
        const userRisk = calculateUserRisk(passwordScore, passwordReusesValue);
        userRiskElement.textContent = userRisk.toFixed(2);
        updateRiskIndicatorColor(userRisk, userRiskIndicator);

        // Get other risks from the DOM
        const riskOfDataExposure = parseFloat(riskOfDataExposureElement.textContent) || 0;
        const serviceRisk = parseFloat(serviceRiskElement.textContent) || 0;

        // Update Data Exposure and Service Risk indicators
        updateRiskIndicatorColor(riskOfDataExposure, dataExposureIndicator);
        updateRiskIndicatorColor(serviceRisk, serviceRiskIndicator);

        // Calculate Global Risk
        const globalRisk = calculateGlobalRisk(riskOfDataExposure, serviceRisk, userRisk);
        globalRiskElement.textContent = globalRisk.toFixed(2);
        updateGlobalRiskColor(globalRisk);
    }

    // Function to update the color of the Global Risk indicator
    function updateGlobalRiskColor(globalRisk) {
        if (globalRisk < 1) {
            globalRiskColor.style.backgroundColor = 'green';
        } else if (globalRisk < 2) {
            globalRiskColor.style.backgroundColor = 'yellow';
        } else if (globalRisk < 3) {
            globalRiskColor.style.backgroundColor = 'orange';
        } else {
            globalRiskColor.style.backgroundColor = 'red';
        }
    }

    // Event listener for password input changes
    passwordInput.addEventListener('input', () => {
        calculateAndUpdateRisks();
    });

    // Event listener for password reuses dropdown changes
    passwordReuses.addEventListener('change', () => {
        calculateAndUpdateRisks();
    });
});
