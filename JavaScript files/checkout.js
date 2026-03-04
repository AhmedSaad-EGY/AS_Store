document.addEventListener("DOMContentLoaded", function () {
    if (!window.ASAuth || !window.ASAuth.isLoggedIn()) {
        window.location.href = "login.html?next=checkout";
        return;
    }

    const user = window.ASAuth.getUser();
    const userText = document.getElementById("checkoutUser");
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const orderSuccess = document.getElementById("orderSuccess");

    if (userText && user) {
        userText.textContent = user.email;
    }

    if (placeOrderBtn && orderSuccess) {
        placeOrderBtn.addEventListener("click", function () {
            orderSuccess.classList.remove("d-none");
            placeOrderBtn.disabled = true;
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            window.ASAuth.logout();
            window.location.href = "login.html";
        });
    }
});
