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
    const logoutConfirmOverlay = document.getElementById("logoutConfirmOverlay");
    const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
    const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

    function openLogoutConfirm() {
        if (!logoutConfirmOverlay) return;
        logoutConfirmOverlay.classList.remove("d-none");
    }

    function closeLogoutConfirm() {
        if (!logoutConfirmOverlay) return;
        logoutConfirmOverlay.classList.add("d-none");
    }

    if (userText && user) {
        userText.textContent = user.email;
    }

    if (placeOrderBtn && orderSuccess) {
        placeOrderBtn.addEventListener("click", function () {
            if (placeOrderBtn.disabled) return;

            localStorage.removeItem("as_store_cart");
            sessionStorage.removeItem("as_store_cart_before_login");
            orderSuccess.classList.remove("d-none");
            placeOrderBtn.disabled = true;
            placeOrderBtn.setAttribute("aria-busy", "true");

            window.setTimeout(function () {
                window.location.href = "./index.html#shop";
            }, 1400);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();
            openLogoutConfirm();
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener("click", function () {
            closeLogoutConfirm();
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener("click", function () {
            window.ASAuth.logout();
            window.location.href = "login.html";
        });
    }

    if (logoutConfirmOverlay) {
        logoutConfirmOverlay.addEventListener("click", function (event) {
            if (event.target === logoutConfirmOverlay) {
                closeLogoutConfirm();
            }
        });
    }
});
