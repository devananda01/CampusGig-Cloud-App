const resetPasswordForm = document.getElementById("resetPasswordForm");

const resetFormSection = document.getElementById("resetFormSection");
const successSection = document.getElementById("successSection");

const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const resetPasswordError = document.getElementById("resetPasswordError");

resetPasswordForm.addEventListener("submit", resetPassword);

async function resetPassword(e) {
    e.preventDefault();

    clearErrors();

    const email = localStorage.getItem("resetEmail");
    const code = localStorage.getItem("resetCode");

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!validatePassword(newPassword)) {
        passwordError.textContent =
            "Password must be at least 6 characters and contain an uppercase letter, lowercase letter, number and special character.";
        return;
    }

    if (newPassword !== confirmPassword) {
        confirmPasswordError.textContent = "Passwords do not match.";
        return;
    }

    try {
        await api.post(`${API.USERS}/reset-password`, {
            email,
            code,
            newPassword,
        });

        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetCode");

        resetFormSection.classList.add("hidden");
        successSection.classList.remove("hidden");
    } catch (err) {
        resetPasswordError.textContent = err.message;
    }
}

function validatePassword(password) {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{6,}$/;

    return passwordPattern.test(password);
}

function clearErrors() {
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    resetPasswordError.textContent = "";
}
