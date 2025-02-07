document.addEventListener('DOMContentLoaded', async () => {
    const passwordInput = document.getElementById('password');
    const passwordScoreOutput = document.getElementById('passwordScore');

    // Initialize validity to false
    sessionStorage.setItem("passwordValid", "false");

    if (!passwordInput || !passwordScoreOutput) {
        console.warn("Password strength elements not found.");
        return;
    }

    // Get the language parameter from the URL or localStorage (fallback to English)
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || localStorage.getItem('lang') || 'en';

    // Load translation JSON dynamically
    async function loadTranslation(lang) {
        try {
            const response = await fetch(`data/translations/${lang}.json`);
            if (!response.ok) throw new Error("Translation file not found");
            return await response.json();
        } catch (error) {
            console.error("Error loading translation:", error);
            return {}; // Return empty object if translation fails
        }
    }

    // Load translations before setting up event listener
    const texts = await loadTranslation(lang);

    if (Object.keys(texts).length === 0) {
        console.warn("Translations not loaded, using default English values.");
    }

    // Function to check if password meets service policies
    function meetsPasswordPolicies(password) {
        const storedService = JSON.parse(sessionStorage.getItem('selectedService'));

        if (!storedService) {
            console.warn("No service selected. Password policies cannot be enforced.");
            return true; // Allow passwords if no service is selected
        }

        const { "min length": minLength, "min mask": minMask, "2fa": requires2FA } = storedService;
        let issues = [];

        // Check minimum length
        if (password.length < minLength) {
            issues.push(`${texts["min_length"] || "Minimum Length"}: ${texts["you_need_at_least"] || "You need at least"} ${minLength} ${texts["characters"] || "characters"}`);
        }

        // Check character composition
        const checks = {
            l: /[a-z]/.test(password), // Lowercase
            u: /[A-Z]/.test(password), // Uppercase
            d: /\d/.test(password),    // Digit
            s: /[\W_]/.test(password)  // Special Character
        };

        for (const charType of minMask.split('')) {
            if (!checks[charType]) {
                let charTypeText = {
                    l: texts["lowercase_character"] || "one lowercase character",
                    u: texts["uppercase_character"] || "one uppercase character",
                    d: texts["decimal_character"] || "one decimal character",
                    s: texts["special_character"] || "one special character"
                };
                issues.push(`${texts["min_characters"] || "Minimum characters"}: ${texts["you_need_at_least"] || "You need at least"} ${charTypeText[charType]}`);
            }
        }

        return issues.length ? issues : true;
    }

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const result = zxcvbn(password);
        const score = result.score;

        // Ensure translations exist, otherwise fallback to English
        const descriptions = [
            texts["veryWeak"] || "Very Weak",
            texts["weak"] || "Weak",
            texts["fair"] || "Fair",
            texts["strong"] || "Strong",
            texts["veryStrong"] || "Very Strong"
        ];

        const suggestions = [
            texts["suggestionScore0"] || "Your password is too weak. Use a mix of uppercase, lowercase, numbers, and symbols. Avoid common words.",
            texts["suggestionScore1"] || "Your password is weak. Consider adding more characters and making it less predictable.",
            texts["suggestionScore2"] || "Your password is decent, but adding length and special characters can improve security.",
            texts["suggestionScore3"] || "Good password! However, using a passphrase or adding more randomness would enhance security.",
            texts["suggestionScore4"] || "Great password! You are following best security practices."
        ];

        // Check if password meets service policies
        const policyCheck = meetsPasswordPolicies(password);

        // Store the validity status in sessionStorage

        sessionStorage.setItem("passwordValid", policyCheck === true);
        console.log(`Is password valid?: ${policyCheck === true}`);

        // Reset policy colors
        const minLengthElement = document.getElementById("minimumLength");
        const minCharactersElement = document.getElementById("minimumCharacters");

        if (minLengthElement) minLengthElement.style.color = "";
        if (minCharactersElement) minCharactersElement.style.color = "";

        if (policyCheck !== true) {
            // Flags to track fulfilled policies
            let minLengthFulfilled = true;
            let minCharactersFulfilled = true;

            // Highlight unmet policies in red
            policyCheck.forEach((issue) => {
                if (issue.includes(texts["min_length"] || "Minimum Length") && minLengthElement) {
                    minLengthElement.style.color = "red";
                    minLengthFulfilled = false;
                }

                if (issue.includes(texts["min_characters"] || "Minimum characters") && minCharactersElement) {
                    minCharactersElement.style.color = "red";
                    minCharactersFulfilled = false;
                }
            });

            // If min length is met, turn it green
            if (minLengthFulfilled && minLengthElement) {
                minLengthElement.style.color = "green";
            }

            // If min characters is met, turn it green
            if (minCharactersFulfilled && minCharactersElement) {
                minCharactersElement.style.color = "green";
            }

            // Display policy violations without showing strength suggestions
            passwordScoreOutput.innerHTML = `
                <strong style="color:red;">${texts["password_policy_violation"] || "Your password does not meet the service's security requirements:"}</strong><br>
            `;
            return; // Stop execution to prevent showing strength and suggestions
        }

        // Reset colors if policies are met
        if (minLengthElement) minLengthElement.style.color = "green";
        if (minCharactersElement) minCharactersElement.style.color = "green"

        let finalFeedback = suggestions[score];

        // Update score output with translated text
        passwordScoreOutput.innerHTML = `
            <strong>${texts["score"] || "Score"}: ${score} (${descriptions[score]})</strong><br><br>
            ${texts["suggestions"] || "Suggestions"}: ${finalFeedback}
        `;

        // Update risks
        calculateAndUpdateRisks();
    });
});
