(function () {
    const AUTH_USER_KEY = "as_store_user";

    function getUser() {
        const rawUser = localStorage.getItem(AUTH_USER_KEY);
        if (!rawUser) return null;

        try {
            return JSON.parse(rawUser);
        } catch (error) {
            localStorage.removeItem(AUTH_USER_KEY);
            return null;
        }
    }

    function login(email) {
        const user = {
            email: email.trim().toLowerCase(),
            loggedInAt: new Date().toISOString()
        };
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        return user;
    }

    function logout() {
        localStorage.removeItem(AUTH_USER_KEY);
    }

    function isLoggedIn() {
        return !!getUser();
    }

    window.ASAuth = {
        getUser,
        login,
        logout,
        isLoggedIn
    };
})();
