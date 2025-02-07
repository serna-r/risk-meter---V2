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

    if (!passwordInput || !passwordReuses) {
        console.warn("Risk Calculation elements not found. Skipping initialization.");
        return;
    }

    // Define thresholds for each risk type
    const topglobalriskvalue = 100;
    const topvalueRD = 20;
    const topvalueOtherRisks = 2;

    // Default values for risks (used when elements are missing in the DOM)
    const DEFAULT_DATA_EXPOSURE_RISK = 0;
    const DEFAULT_SERVICE_RISK = 0;
    const DEFAULT_USER_RISK = 2;

    // Function to calculate User Risk
    function calculateUserRisk(passwordScore, passwordReusesValue) {
        const adjustedReuses = [0, 0.25, 0.35, 0.5][Math.min(passwordReusesValue - 1, 3)];
        return (4 - passwordScore + adjustedReuses) * 2 / 4.5;
    }

    // Function to calculate Global Risk
    function calculateGlobalRisk(dataExposureRisk, serviceRisk, userRisk) {
        return dataExposureRisk * (1 + serviceRisk + userRisk);
    }

    // Function to update Risk Indicator colors with smooth RGB interpolation
    function updateRiskIndicatorColor(value, indicatorElement, riskType) {
        let thresholds;

        switch (riskType) {
            case 'dataExposure':
                thresholds = {
                    phase1: topvalueRD * 0.125,  // Green → Yellow
                    phase2: topvalueRD * 0.25,   // Yellow → Orange
                    phase3: topvalueRD * 0.5,    // Orange → Red
                };
                break;
            case 'serviceAuthentication':
            case 'userLogin':
                thresholds = {
                    phase1: topvalueOtherRisks * 0.125,
                    phase2: topvalueOtherRisks * 0.25,
                    phase3: topvalueOtherRisks * 0.5,
                };
                break;
            default:
                thresholds = {
                    phase1: 0.1,
                    phase2: 0.2,
                    phase3: 0.4,
                };
        }

        let red, green;

        if (value <= thresholds.phase1) {
            // Phase 1: Green (0,255,0) → Yellow (255,255,0)
            red = Math.floor((value / thresholds.phase1) * 255); // Increase red
            green = 255; // Keep green fully
        } else if (value <= thresholds.phase2) {
            // Phase 2: Yellow (255,255,0) → Orange (255,165,0)
            red = 255; // Stay fully red
            green = Math.max(165, Math.floor(255 - ((value - thresholds.phase1) / (thresholds.phase2 - thresholds.phase1)) * 90)); // Decrease green
        } else if (value <= thresholds.phase3) {
            // Phase 3: Orange (255,165,0) → Red (255,0,0)
            red = 255; // Stay fully red
            green = Math.max(0, Math.floor(165 - ((value - thresholds.phase2) / (thresholds.phase3 - thresholds.phase2)) * 165)); // Decrease green
        } else {
            // Beyond Phase 3: Fully Red (255,0,0)
            red = 255;
            green = 0;
        }

        const color = `rgb(${red}, ${green}, 0)`;

        // Apply color to the indicator
        indicatorElement.style.backgroundColor = color;
    }



    function calculateAndUpdateRisks() {
        
        // Function to reset the risk indicators
        function resetRiskIndicators() {
            if (dataExposureIndicator) dataExposureIndicator.style.backgroundColor = "grey";
            if (serviceRiskIndicator) serviceRiskIndicator.style.backgroundColor = "grey";
            if (userRiskIndicator) userRiskIndicator.style.backgroundColor = "grey";
        
            // Reset global risk bar
            const riskBar = document.getElementById("globalRiskBar");
            if (riskBar) {
                riskBar.style.width = "0%";
                riskBar.className = "risk-fill"; // Remove colors
            }
        
            console.log("Risk indicators reset.");
        }

        const password = passwordInput ? passwordInput.value : '';
        const passwordReusesValue = passwordReuses ? parseInt(passwordReuses.value) || 0 : 0;

        // Retrieve password validity status from sessionStorage
        const isPasswordValid = sessionStorage.getItem("passwordValid") === "true";
    
        // Get the password score
        const passwordScore = passwordInput ? zxcvbn(password).score : 0;
    
        // Calculate User Risk
        let userRisk = calculateUserRisk(passwordScore, passwordReusesValue);
        if (userRiskElement) {
            userRiskElement.textContent = userRisk.toFixed(2);
        }
    
        // Retrieve service data from sessionStorage
        const storedService = JSON.parse(sessionStorage.getItem('selectedService'));

        // Check if storedService is null or empty, and exit the function if so
        if (!storedService || Object.keys(storedService).length === 0) {
            console.warn("No service selected. Exiting function.");
            resetRiskIndicators();
            return;
        }

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

        // Check if password is valid
        if (!isPasswordValid) {
            // If password is invalid, force user risk to 2
            userRisk = DEFAULT_USER_RISK;
            // Keep indicator grey
            if (userRiskIndicator) {
                userRiskIndicator.style.backgroundColor = 'grey';
            }
        } else if (userRiskIndicator) {
            updateRiskIndicatorColor(userRisk, userRiskIndicator, 'userLogin');
        }
    
        // Calculate Global Risk
        const globalRisk = calculateGlobalRisk(riskOfDataExposure, serviceRisk, userRisk);
    
        // Update Global Risk display and color
        if(globalRiskElement){
            globalRiskElement.textContent = globalRisk.toFixed(2);
        }
        
        updateGlobalRiskBar(globalRisk);

        console.log('Dexp:', riskOfDataExposure)
        console.log('SR: ', serviceRisk)
        console.log('UR: ', userRisk)
        console.log('Global risk: ', globalRisk)


        function resetRiskIndicators() {
    if (riskOfDataExposureElement) riskOfDataExposureElement.textContent = "";
    if (serviceRiskElement) serviceRiskElement.textContent = "";
    if (userRiskElement) userRiskElement.textContent = "";
    if (globalRiskElement) globalRiskElement.textContent = "";

    if (dataExposureIndicator) dataExposureIndicator.style.backgroundColor = "grey";
    if (serviceRiskIndicator) serviceRiskIndicator.style.backgroundColor = "grey";
    if (userRiskIndicator) userRiskIndicator.style.backgroundColor = "grey";

    // Reset global risk bar
    const riskBar = document.getElementById("globalRiskBar");
    if (riskBar) {
        riskBar.style.width = "0%";
        riskBar.className = "risk-fill"; // Remove colors
    }

    console.log("Risk indicators reset.");
}
    }
    

    function updateGlobalRiskBar(globalRisk) {
        const riskBar = document.getElementById("globalRiskBar");
    
        // Ensure globalRisk stays within 0-100 range
        globalRisk = Math.max(0, Math.min(globalRisk, 100));
    
        // Define dynamic thresholds based on topglobalriskvalue
        const phase1 = topglobalriskvalue / 8;  // Green → Yellow
        const phase2 = topglobalriskvalue / 4;  // Yellow → Orange
        const phase3 = topglobalriskvalue / 2;  // Orange → Red
    
        let red, green;
        let widthPercentage;
    
        if (globalRisk <= phase1) {
            // Phase 1: Green (0,255,0) → Yellow (255,255,0)
            red = Math.min(255, Math.floor((globalRisk / phase1) * 255)); // Increase red
            green = 255; // Stay fully green
            widthPercentage = 25; // Set bar width to 25%
        } else if (globalRisk <= phase2) {
            // Phase 2: Yellow (255,255,0) → Orange (255,165,0)
            red = 255; // Stay fully red
            green = Math.max(165, Math.floor(255 - ((globalRisk - phase1) / (phase2 - phase1)) * 90)); // Decrease green to 165
            widthPercentage = 50; // Set bar width to 50%
        } else if (globalRisk <= phase3) {
            // Phase 3: Orange (255,165,0) → Red (255,0,0)
            red = 255; // Stay fully red
            green = Math.max(0, Math.floor(165 - ((globalRisk - phase2) / (phase3 - phase2)) * 165)); // Decrease green to 0
            widthPercentage = 75; // Set bar width to 75%
        } else {
            // Phase 4: 50%+ stays fully red (255,0,0)
            red = 255;
            green = 0;
            widthPercentage = 100; // Set bar width to 100%
        }
    
        const color = `rgb(${red}, ${green}, 0)`;
    
        // Apply styles to the bar
        riskBar.style.width = `${widthPercentage}%`; // Set width based on phase
        riskBar.style.backgroundColor = color;
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
