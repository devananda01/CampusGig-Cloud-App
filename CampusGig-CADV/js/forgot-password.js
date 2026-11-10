const forgotPasswordForm = document.getElementById("forgotPasswordForm");

const emailError = document.getElementById("emailError");
const verificationError = document.getElementById("verificationError");
const forgotPasswordError = document.getElementById("forgotPasswordError");

const verificationModal = document.getElementById("verificationModal");
const continueBtn = document.getElementById("continueBtn");
const resendBtn = document.getElementById("resendBtn");

forgotPasswordForm.addEventListener("submit", forgotPassword);
continueBtn.addEventListener("click", continueReset);
resendBtn.addEventListener("click", resendCode);

async function forgotPassword(e) {
    e.preventDefault();

    clearErrors();

    const email = document.getElementById("email").value.trim();

    if (!validateEmail(email)) {
        return;
    }

    try {
        await api.post(`${API.USERS}/forgot-password`, {
            email,
        });

        localStorage.setItem("resetEmail", email);

        verificationModal.classList.add("show");
        verificationModal.classList.remove("hidden");
    } catch (err) {
        forgotPasswordError.textContent = err.message;
    }
}

async function continueReset() {
    verificationError.textContent = "";

    const code = document.getElementById("verificationCode").value.trim();

    if (code === "") {
        verificationError.textContent = "Please enter the verification code.";
        return;
    }

    continueBtn.disabled = true;
    continueBtn.textContent = "Please wait...";

    localStorage.setItem("resetCode", code);

    window.location.href = "reset-password.html";
}

async function resendCode() {
    const email = localStorage.getItem("resetEmail");

    try {
        await api.post(`${API.USERS}/forgot-password`, {
            email,
        });

        forgotPasswordError.textContent = "Verification code has been resent.";
    } catch (err) {
        forgotPasswordError.textContent = err.message;
    }
}

function validateEmail(email) {
    const emailPattern = /^[A-Za-z0-9._%+-]+@(gmail\.com|student\.tp\.edu\.sg)$/;

    if (!emailPattern.test(email)) {
        emailError.textContent = "Use a Gmail or TP student email.";
        return false;
    }

    return true;
}

function clearErrors() {
    emailError.textContent = "";
    verificationError.textContent = "";
    forgotPasswordError.textContent = "";
}
