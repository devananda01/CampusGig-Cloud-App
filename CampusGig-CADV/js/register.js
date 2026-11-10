const registerForm = document.getElementById("registerForm");

const fullnameError = document.getElementById("fullnameError");
const emailError = document.getElementById("emailError");
const courseError = document.getElementById("courseError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const registerError = document.getElementById("registerError");

registerForm.addEventListener("submit", registerUser);

async function registerUser(e) {
    e.preventDefault();

    clearErrors();

    const full_name = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const bio = document.getElementById("bio").value.trim();
    const course = document.getElementById("course").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!validateRegisterForm(full_name, email, course, password, confirmPassword)) {
        return;
    }

    try {
        const result = await api.post(`${API.USERS}/register`, {
            full_name,
            email,
            bio,
            course,
            password,
        });

        showToast(result.message);

        window.location.href = "login.html";
    } catch (err) {
        registerError.textContent = err.message;
    }
}

function validateRegisterForm(full_name, email, course, password, confirmPassword) {
    let valid = true;

    if (full_name === "") {
        fullnameError.textContent = "Full name is required.";
        valid = false;
    }

    const emailPattern = /^[A-Za-z0-9._%+-]+@(gmail\.com|student\.tp\.edu\.sg)$/;

    if (!emailPattern.test(email)) {
        emailError.textContent = "Use a Gmail or TP student email.";
        valid = false;
    }

    if (course === "") {
        courseError.textContent = "Please select a course.";
        valid = false;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{6,}$/;

    if (!passwordPattern.test(password)) {
        passwordError.textContent =
            "Password must be at least 6 characters and contain an uppercase letter, lowercase letter, number and special character.";
        valid = false;
    }

    if (password !== confirmPassword) {
        confirmPasswordError.textContent = "Passwords do not match.";
        valid = false;
    }

    return valid;
}

function clearErrors() {
    fullnameError.textContent = "";
    emailError.textContent = "";
    courseError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    registerError.textContent = "";
}
