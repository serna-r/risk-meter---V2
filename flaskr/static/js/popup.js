document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("instructionPopup");
    const closePopupButton = document.getElementById("closePopup");
    const openPopupButton = document.getElementById("openPopupButton");
    const popupLanguageSelector = document.getElementById("popupLanguageSelector");
    const langSwitchButton = document.getElementById("langSwitch");

    // Show the popup only if it hasn't been closed before
    if (!sessionStorage.getItem("popupClosed")) {
        popup.classList.add("show");
    }

    // Close popup
    closePopupButton.addEventListener("click", function () {
        popup.classList.remove("show");
        sessionStorage.setItem("popupClosed", "true");
    });

    // Reopen popup when clicking the "Reopen Instructions" button
    openPopupButton.addEventListener("click", function () {
        popup.classList.add("show");
    });

    // Handle language switching inside the popup
    popupLanguageSelector.addEventListener("change", function () {
        updateLanguage(this.value);
    });

    // Handle language switching from the main button
    langSwitchButton.addEventListener("click", function () {
        const currentLang = new URLSearchParams(window.location.search).get("lang") || "en";
        const newLang = currentLang === "en" ? "es" : "en";
        updateLanguage(newLang);
    });

    function updateLanguage(newLang) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("lang", newLang);
        window.location.search = urlParams.toString();
    }

    // Sync popup selector with current language
    const currentLang = new URLSearchParams(window.location.search).get("lang") || "en";
    popupLanguageSelector.value = currentLang;
});
