// ---------- Authentication ----------

function isLoggedIn() {
    return localStorage.getItem("accessToken") !== null;
}

function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

function getUserId() {
    return localStorage.getItem("userId");
}

function getTaskId() {
    return localStorage.getItem("taskId");
}

function getCurrentRole() {
    return localStorage.getItem("role") || "Applicant";
}

function setCurrentRole(role) {
    localStorage.setItem("role", role);
}

function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    window.location.href = "login.html";
}

// ---------- Components ----------

async function loadComponent(elementId, file) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    const response = await fetch(file);

    element.innerHTML = await response.text();
}

async function initializePage() {
    await loadComponent("navbar", "components/navbar.html");

    await loadComponent("sidebarContainer", "components/sidebar.html");

    initializeNavbar();

    initializeRoleSwitch();

    initializeSidebar();

    await loadNavbarProfileImage();
}

// ---------- Navbar ----------

function initializeNavbar() {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.querySelector("#sidebarContainer .sidebar");

    if (!menuBtn || !sidebar) {
        return;
    }

    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("show");
    });

    sidebar.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
        if (sidebar.classList.contains("show") && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.remove("show");
        }
    });
}
// ------------ Sidebar ----------

function initializeSidebar() {
    const sidebarMenu = document.getElementById("sidebarMenu");

    if (!sidebarMenu) return;

    if (getCurrentRole() === "Applicant") {
        sidebarMenu.innerHTML = `
            <div class="sidebar-section-title">APPLICANT</div>

            <a href="applicant-dashboard.html" class="sidebar-link ">
                <span class="material-symbols-outlined">dashboard</span>
                <span>Browse Tasks</span>
            </a>

            <a href="my-applications.html" class="sidebar-link ">
                <span class="material-symbols-outlined">assignment</span>
                <span>My Applications</span>
            </a>

            <a href="profile.html" class="sidebar-link ">
                <span class="material-symbols-outlined">person</span>
                <span>Profile</span>
            </a>

            <hr class="sidebar-divider">

            <button id="logoutBtn" class="sidebar-link logout-btn btn-dark btn" type="button">
                <span class="material-symbols-outlined">logout</span>
                <span>Logout</span>
            </button>
        `;
    } else {
        sidebarMenu.innerHTML = `
            <div class="sidebar-section-title">POSTER</div>

            <a href="my-tasks.html" class="sidebar-link">
                <span class="material-symbols-outlined">work</span>
                <span>My Tasks</span>
            </a>

            <a href="create-task.html" class="sidebar-link sidebar-link-primary">
                <span class="material-symbols-outlined">add_circle</span>
                <span>Create Task</span>
            </a>

            <a href="profile.html" class="sidebar-link">
                <span class="material-symbols-outlined">person</span>
                <span>Profile</span>
            </a>

            <hr class="sidebar-divider">

            <button id="logoutBtn" class="sidebar-link logout-btn btn-dark" type="button">
                <span class="material-symbols-outlined">logout</span>
                <span>Logout</span>
            </button>
        `;
    }

    initializeLogout();
}
// ---------- Role Switch ----------

function initializeRoleSwitch() {
    const switchBtn = document.getElementById("switchRoleBtn");

    if (!switchBtn) {
        return;
    }

    switchBtn.textContent = getCurrentRole() === "Applicant" ? "Switch to Poster" : "Switch to Applicant";

    switchBtn.addEventListener("click", switchRole);
}

function switchRole() {
    if (getCurrentRole() === "Applicant") {
        setCurrentRole("Poster");
        window.location.href = "my-tasks.html";
    } else {
        setCurrentRole("Applicant");
        window.location.href = "applicant-dashboard.html";
    }
}

// ---------- Logout ----------

function initializeLogout() {
    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) {
        return;
    }

    logoutBtn.addEventListener("click", logout);
}
async function loadNavbarProfileImage() {
    const profileImage = document.getElementById("navbarProfileImage");
    const profileIcon = document.getElementById("navbarProfileIcon");

    if (!profileImage || !profileIcon || !isLoggedIn()) {
        return;
    }

    try {
        const user = await api.get(`${API.USERS}/${getUserId()}`);

        if (!user.profile_image) {
            return;
        }

        if (user.profile_image) {
            profileImage.src = API.PROFILE_IMAGES + user.profile_image;

            profileImage.classList.remove("hidden");

            profileIcon.classList.add("hidden"); // <-- This hides the icon
        } else {
            profileImage.classList.add("hidden");

            profileIcon.classList.remove("hidden");
        }
    } catch (err) {
        console.error(err);
    }
}
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
