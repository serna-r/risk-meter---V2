document.addEventListener('DOMContentLoaded', async () => {
    const passwordInput = document.getElementById('password');
    const passwordScoreOutput = document.getElementById('passwordScore');

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

        const finalFeedback = suggestions[score];

        // Update score output with translated text
        passwordScoreOutput.innerHTML = `
            <strong>${texts["score"] || "Score"}: ${score} (${descriptions[score]})</strong><br><br>
            ${texts["suggestions"] || "Suggestions"}: ${finalFeedback}
        `;
    });
});
