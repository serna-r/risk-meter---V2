document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const passwordScoreOutput = document.getElementById('passwordScore');

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const result = zxcvbn(password); // Use zxcvbn.js for password strength
        const score = result.score;

        // Map score to descriptive text
        const descriptions = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
        const feedback = result.feedback.suggestions.join(', ') || 'Good password!';

        // Update score output
        passwordScoreOutput.innerHTML = `
            <strong>Score: ${score} (${descriptions[score]})</strong><br>
            Suggestions: ${feedback}
        `;
    });
});
