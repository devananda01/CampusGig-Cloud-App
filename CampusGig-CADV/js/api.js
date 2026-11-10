async function apiRequest(url, method = "GET", body = null) {
    const token = localStorage.getItem("accessToken");

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

const api = {
    get(url) {
        return apiRequest(url);
    },

    post(url, body) {
        return apiRequest(url, "POST", body);
    },

    put(url, body) {
        return apiRequest(url, "PUT", body);
    },

    delete(url) {
        return apiRequest(url, "DELETE");
    },
};
