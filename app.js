document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Get language from localStorage
        const lang = localStorage.getItem("lang") || "en";

        // Fetch translations
        const response = await fetch(`data/translations/${lang}.json`);
        if (!response.ok) throw new Error("Failed to fetch translations");
        const texts = await response.json();

        // List of elements that should render as HTML (not plain text)
        const htmlElements = ["research_info", "user_choices", "risk_of_data_exposure", "user_login_protection"];

        // Tooltip elements mapping
        const tooltipMapping = {
            risk_of_data_exposure: "tooltip_risk_of_data_exposure",
            user_login_protection: "tooltip_user_login_protection"
        };

        // Ignore tooltips in the first loop (only update visible text)
        Object.keys(texts).forEach(id => {
            if (!Object.values(tooltipMapping).includes(id)) { 
                const element = document.getElementById(id);
                if (element) {
                    if (htmlElements.includes(id)) {
                        element.innerHTML = texts[id]; 
                    } else {
                        element.innerText = texts[id];
                    }
                }
            }
        });

        // Translate buttons
        const langSwitchButton = document.getElementById("langSwitch");
        if (langSwitchButton) {
            langSwitchButton.innerHTML = lang === "en" ? "🇪🇸 Español" : "🇬🇧 English";
            langSwitchButton.addEventListener("click", () => updateLanguage(lang === "en" ? "es" : "en"));
        }

        const openPopupButton = document.getElementById("openPopupButton");
        const instructionPopup = document.getElementById("instructionPopup");

        if (openPopupButton) {
            openPopupButton.innerHTML = lang === "en" ? "📖 Reopen Instructions" : "📖 Reabrir Instrucciones";
            openPopupButton.addEventListener("click", () => {
                if (instructionPopup) {
                    instructionPopup.classList.add("show");
                } else {
                    console.error("Popup element not found.");
                }
            });
        }

        // Handle popup close functionality
        const closePopupButton = document.getElementById("closePopup");
        if (closePopupButton) {
            closePopupButton.addEventListener("click", () => {
                if (instructionPopup) {
                    instructionPopup.classList.remove("show");
                    sessionStorage.setItem("popupClosed", "true");
                }
            });
        }

        // Show popup only if it hasn't been closed before
        if (!sessionStorage.getItem("popupClosed") && instructionPopup) {
            instructionPopup.classList.add("show");
        }

        // Handle language switching inside the popup
        const popupLanguageSelector = document.getElementById("popupLanguageSelector");
        if (popupLanguageSelector) {
            popupLanguageSelector.value = lang; // Set current language in selector

            popupLanguageSelector.addEventListener("change", (event) => {
                sessionStorage.setItem("popupOpen", "true"); // Keep popup open after reload
                updateLanguage(event.target.value);
            });
        }

        /**
        * Updates the language and reloads the page with the selected language.
        * Ensures the popup remains open if it was already open.
        * @param {string} newLang - The new language to set.
        */
        function updateLanguage(newLang) {
            console.log(`Changing language to: ${newLang}`);
            localStorage.setItem("lang", newLang);
            location.reload();
        }

        // Restore popup state after reload
        if (sessionStorage.getItem("popupOpen") === "true") {
            instructionPopup.classList.add("show");
            sessionStorage.removeItem("popupOpen"); // Clear state after reopening
        }

    } catch (error) {
        console.error("Error initializing app:", error);
    }
});
