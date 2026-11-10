function parseJwt(token) {
    try {
        const base64 = token.split(".")[1];

        return JSON.parse(atob(base64));
    } catch (e) {
        console.error("Failed to parse JWT:", e);
        return {};
    }
}

function saveLogin(data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("idToken", data.idToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    const payload = parseJwt(data.idToken);

    if (payload) {
        localStorage.setItem("userId", payload.sub);
    }
    localStorage.setItem("role", "Applicant");
}
