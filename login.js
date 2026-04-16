document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorBox = document.getElementById("loginError");
    const submitBtn = form.querySelector('button[type="submit"]');
    const next = new URLSearchParams(window.location.search).get("next");
    const redirectPath = next === "checkout" ? "checkout.html" : "index.html";

    if (!emailInput || !passwordInput || !errorBox) return;

    if (window.ASAuth.isLoggedIn()) {
        window.location.href = redirectPath;
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

    function setSubmitting(isSubmitting) {
        if (!submitBtn) return;

        submitBtn.disabled = isSubmitting;
        submitBtn.setAttribute("aria-busy", String(isSubmitting));

        if (isSubmitting) {
            submitBtn.dataset.originalHtml = submitBtn.innerHTML;
            submitBtn.innerHTML =
                '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Logging in...';
        } else if (submitBtn.dataset.originalHtml) {
            submitBtn.innerHTML = submitBtn.dataset.originalHtml;
        }
    }

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!window.ASAuth) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            showError("Login service is unavailable. Please refresh and try again.");
        });
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearError();

        if (submitBtn && submitBtn.disabled) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showError("Please enter email and password.");
            return;
        }

        if (!validateEmail(email)) {
            showError("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            showError("Password must be at least 6 characters.");
            return;
        }

        try {
            setSubmitting(true);
            window.ASAuth.login(email);
            window.location.href = redirectPath;
        } catch (error) {
            setSubmitting(false);
            showError("Login failed. Please try again.");
        }
    });
});
