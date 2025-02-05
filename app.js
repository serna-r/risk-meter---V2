document.addEventListener("DOMContentLoaded", async () => {
    const mainContent = document.getElementById("main-content");

    if (!mainContent) {
        console.error("Main content container not found.");
        return;
    }

    // Get language setting
    const lang = localStorage.getItem("lang") || "en";

    // Fetch translations
    const texts = await fetch(`data/translations/${lang}.json`)
        .then(res => res.json())
        .catch(err => {
            console.error("Failed to load translations:", err);
            return {};
        });

    if (!texts.title) {
        console.error("Translation data missing or corrupted.");
        return;
    }

    // Generate the page content dynamically
    mainContent.innerHTML = `
        <h1>${texts.title}</h1>

        <!-- Instruction Popup -->
        <div id="instructionPopup" class="popup-overlay">
            <div class="popup-content">
                <h2>${texts.popup_title}</h2>
                <p>${texts.popup_description}</p>
                <ol>
                    <li><strong>${texts.popup_step1}</strong></li>
                    <li><strong>${texts.popup_step2}</strong></li>
                    <li><strong>${texts.popup_step3}</strong></li>
                    <li><strong>${texts.popup_step4}</strong></li>
                </ol>
                <label for="popupLanguageSelector">${texts.reopen_instructions}</label>
                <br>
                <select id="popupLanguageSelector">
                    <option value="en" ${lang === "en" ? "selected" : ""}>English</option>
                    <option value="es" ${lang === "es" ? "selected" : ""}>Español</option>
                </select>
                <button id="closePopup">${texts.popup_button}</button>
            </div>
        </div>

        <div class="research-info">
            <p>${texts.research_info}</p>
        </div>

        <div class="container">
            <div class="search-bar">
                <input type="text" placeholder="${texts.search_service}" id="searchInput">
                <div id="suggestions" class="suggestions-list"></div>
            </div>

            <div class="row">
                <div class="column">
                    <div class="card service-card" id="serviceCard">
                        <h2 id="service-title">${texts.service}</h2>
                        <div id="details">
                            <p>${texts.select_service}</p>
                            <p id="risk-data-exp">
                                <strong>${texts.risk_of_data_exposure}</strong>  
                                <span class="tooltip-icon" data-tooltip="${texts.tooltip_risk_of_data_exposure}">?</span>
                            </p>
                            <p id="user-login-protection">
                                <strong>${texts.user_login_protection}</strong>  
                                <span class="tooltip-icon" data-tooltip="${texts.tooltip_user_login_protection}">?</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="column">
                    <div class="card user-card" id="userCard">
                        <h2>${texts.user_choices}  
                            <span class="tooltip-icon" data-tooltip="${texts.tooltip_user_choices}">?</span>
                        </h2>
                        <label for="password">${texts.enter_password}</label>
                        <input type="text" id="password" placeholder="${texts.enter_password_placeholder}">
                        <p id="passwordCompositionReq"></p>
                        <p id="passwordScore"></p>

                        <label for="reuses">${texts.chosen_password_uses}</label>
                        <select id="reuses">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="10">${texts.more_than_3}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="column">
                    <div class="card risk-indicators">
                        <h2>${texts.risk_indicators}</h2>
                        <div class="indicator-item">
                            <span>${texts.risk_of_data_exposure}</span>
                            <div class="indicator" id="riskOfDataExposureIndicator"></div>
                        </div>
                        <div class="indicator-item">
                            <span>${texts.user_login_protection}</span>
                            <div class="indicator" id="serviceRiskIndicator"></div>                       
                        </div>
                        <div class="indicator-item">
                            <span>${texts.user_choices}</span>
                            <div class="indicator" id="userRiskIndicator"></div>
                        </div>
                    </div>
                </div>

                <div class="column">
                    <div class="card global-risk">
                        <h3>${texts.global_risk}</h3>
                        <div class="global-risk-container">
                            <div class="global-risk-bar">
                                <div class="risk-fill" id="globalRiskBar"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="column">
                    <div class="card legend">
                        <h2>${texts.risk_legend}</h2>
                        <div class="legend-item">
                            <span class="legend-circle" style="background-color: green;"></span> ${texts.legend_very_small}
                        </div>
                        <div class="legend-item">
                            <span class="legend-circle" style="background-color: yellow;"></span> ${texts.legend_small}
                        </div>
                        <div class="legend-item">
                            <span class="legend-circle" style="background-color: orange;"></span> ${texts.legend_big}
                        </div>
                        <div class="legend-item">
                            <span class="legend-circle" style="background-color: red;"></span> ${texts.legend_very_big}
                        </div>
                    </div>
                </div>
            </div>

            <div class="data-privacy-notice">
                <p>${texts.data_privacy_notice}</p>
            </div>
        </div>
    `;

    // Event listener for language switcher
    document.getElementById("popupLanguageSelector").addEventListener("change", (event) => {
        localStorage.setItem("lang", event.target.value);
        location.reload();
    });

    document.getElementById("closePopup").addEventListener("click", () => {
        document.getElementById("instructionPopup").classList.remove("show");
        sessionStorage.setItem("popupClosed", "true");
    });

    // Show popup if not closed before
    if (!sessionStorage.getItem("popupClosed")) {
        document.getElementById("instructionPopup").classList.add("show");
    }

    // Initialize search and password strength checker
    loadSearch(texts);
});
