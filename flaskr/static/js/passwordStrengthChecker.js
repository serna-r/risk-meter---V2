document.addEventListener('DOMContentLoaded', async () => {
    const passwordInput = document.getElementById('password');
    const passwordScoreOutput = document.getElementById('passwordScore');

    // Get the language parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || 'en'; // Default to English

    // Load translation JSON dynamically
    async function loadTranslation(lang) {
        try {
            const response = await fetch(`/static/json/translations/${lang}.json`);
            if (!response.ok) throw new Error("Translation file not found");
            return await response.json();
        } catch (error) {
            console.error("Error loading translation:", error);
            return {}; // Return empty object if translation fails
        }
    }

    // Load translations
    const texts = await loadTranslation(lang);

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const result = zxcvbn(password);
        const score = result.score;

        // Get strength descriptions from translations
        const descriptions = [
            texts["veryWeak"] || "Very Weak",
            texts["weak"] || "Weak",
            texts["fair"] || "Fair",
            texts["strong"] || "Strong",
            texts["veryStrong"] || "Very Strong"
        ];

        // Get suggestions based on score
        const suggestions = [
            texts["suggestionScore0"] || "Your password is too weak. Use a mix of uppercase, lowercase, numbers, and symbols. Avoid common words.",
            texts["suggestionScore1"] || "Your password is weak. Consider adding more characters and making it less predictable.",
            texts["suggestionScore2"] || "Your password is decent, but adding length and special characters can improve security.",
            texts["suggestionScore3"] || "Good password! However, using a passphrase or adding more randomness would enhance security.",
            texts["suggestionScore4"] || "Great password! You are following best security practices."
        ];

        // Fallback if there is additional feedback from zxcvbn
        const finalFeedback = suggestions[score];

        // Update score output with translated text
        passwordScoreOutput.innerHTML = `
            <strong>${texts["score"] || "Score"}: ${score} (${descriptions[score]})</strong><br>
            ${texts["suggestions"] || "Suggestions"}: ${finalFeedback}
        `;
    });
});
