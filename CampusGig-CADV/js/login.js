const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", loginUser);

async function loginUser(e) {
    e.preventDefault();

    loginError.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const result = await api.post(`${API.USERS}/login`, {
            email,
            password,
        });

        saveLogin(result);

        window.location.href = "applicant-dashboard.html";
    } catch (err) {
        loginError.textContent = err.message;
    }
}
