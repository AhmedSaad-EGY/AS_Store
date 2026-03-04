document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorBox = document.getElementById("loginError");
    const next = new URLSearchParams(window.location.search).get("next");

    if (!form || !emailInput || !passwordInput || !errorBox || !window.ASAuth) return;

    if (window.ASAuth.isLoggedIn()) {
        window.location.href = next === "checkout" ? "checkout.html" : "index.html";
        return;
    }

    function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.remove("d-none");
    }

    function clearError() {
        errorBox.textContent = "";
        errorBox.classList.add("d-none");
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearError();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showError("Please enter email and password.");
            return;
        }

        if (password.length < 6) {
            showError("Password must be at least 6 characters.");
            return;
        }

        window.ASAuth.login(email);
        window.location.href = next === "checkout" ? "checkout.html" : "index.html";
    });
});
