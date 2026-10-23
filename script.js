// ==========================================
// CAMPUSSWAP - MAIN JAVASCRIPT
// ==========================================


// ==========================================
// PASSWORD VISIBILITY TOGGLE
// ==========================================

const toggleBtn = document.getElementById("toggle-password");
const pwdInput = document.getElementById("password");

// Make sure these elements exist.
// This prevents errors on pages where
// the login form is not present.

if (toggleBtn && pwdInput) {

    toggleBtn.addEventListener("click", () => {

        const isPassword = pwdInput.type === "password";

        if (isPassword) {

            // Show password
            pwdInput.type = "text";

            toggleBtn.className =
                "fa-regular fa-eye-slash password-toggle";

        } else {

            // Hide password
            pwdInput.type = "password";

            toggleBtn.className =
                "fa-regular fa-eye password-toggle";
        }

    });

}


// ==========================================
// LOGIN FORM
// ==========================================

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!email || !password) {
            showToast("Please enter your email and password.", "error");
            return;
        }

        try {
            const user = await CampusSwapAPI.login(email, password);

            showToast(`Welcome back, ${user.name}!`, "success");

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 700);
        } catch (error) {
            showToast(error.message || "Login failed. Please try again.", "error");
        }
    });

}


// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword =
    document.getElementById("forgot-password");

if (forgotPassword) {

    forgotPassword.addEventListener("click", (event) => {

        // Prevent "#" navigation
        event.preventDefault();

        triggerReset();

    });

}


// ==========================================
// PASSWORD RESET MESSAGE
// ==========================================

function triggerReset() {

    showToast(
        "Password reset is not available in the current backend.",
        "error"
    );

}


// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToast(message, type = "success") {

    const toast =
        document.getElementById("toast");

    const icon =
        document.getElementById("toast-icon");

    const messageBox =
        document.getElementById("toast-msg");


    // If toast doesn't exist,
    // stop here.

    if (!toast || !icon || !messageBox) {
        return;
    }


    // ==================================
    // SET MESSAGE
    // ==================================

    messageBox.textContent = message;


    // ==================================
    // SET TOAST TYPE
    // ==================================

    toast.className =
        `toast-box show ${type}`;


    // ==================================
    // SET ICON
    // ==================================

    if (type === "success") {

        icon.className =
            "fa-solid fa-circle-check";

    } else {

        icon.className =
            "fa-solid fa-circle-xmark";
    }


    // ==================================
    // HIDE TOAST
    // ==================================

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}