const applicationTableBody = document.getElementById("applicationTableBody");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const tableContainer = document.getElementById("tableContainer");

const withdrawModal = document.getElementById("withdrawModal");
const confirmWithdrawBtn = document.getElementById("confirmWithdrawBtn");
const cancelWithdrawBtn = document.getElementById("cancelWithdrawBtn");
const closeWithdrawBtn = document.getElementById("closeWithdrawBtn");
const editModal = document.getElementById("editModal");

const editApplicationMessage = document.getElementById("editApplicationMessage");
const editApplicationError = document.getElementById("editApplicationError");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeEditBtn = document.getElementById("closeEditBtn");

let selectedApplicationId = null;

document.addEventListener("DOMContentLoaded", loadApplications);

confirmWithdrawBtn.addEventListener("click", withdrawApplication);
cancelWithdrawBtn.addEventListener("click", closeWithdrawModal);
closeWithdrawBtn.addEventListener("click", closeWithdrawModal);

saveEditBtn.addEventListener("click", updateApplication);
cancelEditBtn.addEventListener("click", closeEditModal);
closeEditBtn.addEventListener("click", closeEditModal);

async function loadApplications() {
    loadingState.classList.remove("hidden");
    tableContainer.classList.add("hidden");
    emptyState.classList.add("hidden");

    applicationTableBody.innerHTML = "";

    try {
        const userId = getUserId();

        const applications = await api.get(`${API.USERS}/${userId}/applications`);

        await Promise.all(
            applications.map(async (application) => {
                try {
                    const task = await api.get(`${API.TASKS}/${application.task_id}`);

                    application.task_title = task.title;
                } catch (err) {
                    application.task_title = "Unknown Task";
                }
            }),
        );

        loadingState.classList.add("hidden");

        if (applications.length === 0) {
            emptyState.classList.remove("hidden");
            return;
        }

        tableContainer.classList.remove("hidden");

        displayApplications(applications);
    } catch (err) {
        loadingState.classList.add("hidden");

        emptyState.classList.remove("hidden");

        emptyState.querySelector("h3").textContent = "Unable to load applications";

        emptyState.querySelector("p").textContent = err.message;
    }
}

function displayApplications(applications) {
    applicationTableBody.innerHTML = "";

    applications.forEach((application) => {
        const row = createApplicationRow(application);

        applicationTableBody.appendChild(row);
    });
}

function createApplicationRow(application) {
    const row = document.createElement("tr");

    let actions = "";

    if (application.application_status === "Pending") {
        actions = `
            <button
                class="btn btn-outline btn-sm editBtn"
                data-id="${application.application_id}">
                Edit
            </button>

            <button
                class="btn btn-dark btn-sm withdrawBtn"
                data-id="${application.application_id}">
                Withdraw
            </button>
        `;
    } else {
        actions = `
            <button
                class="btn btn-outline btn-sm viewBtn"
                data-task="${application.task_id}">
                View Task
            </button>
        `;
    }

    row.innerHTML = `
        <td>${application.task_title}</td>

        <td>
            <span class="status-badge ${getStatusClass(application.application_status)}">
                ${application.application_status}
            </span>
        </td>

        <td>${formatDate(application.applied_at)}</td>

        <td class="action-buttons">
            ${actions}
        </td>
    `;

    const editBtn = row.querySelector(".editBtn");

    if (editBtn) {
        editBtn.addEventListener("click", () => {
            selectedApplicationId = application.application_id;

            editApplicationMessage.value = application.application_message;

            editModal.classList.remove("hidden");

            editModal.classList.add("is-open");
        });
    }

    const withdrawBtn = row.querySelector(".withdrawBtn");

    if (withdrawBtn) {
        withdrawBtn.addEventListener("click", () => {
            selectedApplicationId = application.application_id;

            withdrawModal.classList.remove("hidden");
            withdrawModal.classList.add("is-open");
        });
    }

    const viewBtn = row.querySelector(".viewBtn");

    if (viewBtn) {
        viewBtn.addEventListener("click", () => {
            localStorage.setItem("taskId", application.task_id);

            window.location.href = "task-details.html";
        });
    }

    return row;
}

async function withdrawApplication() {
    try {
        await api.delete(`${API.APPLICATIONS}/${selectedApplicationId}`);

        closeWithdrawModal();

        loadApplications();
    } catch (err) {
        showToast(err.message);
    }
}

function closeWithdrawModal() {
    withdrawModal.classList.remove("is-open");
    withdrawModal.classList.add("hidden");

    selectedApplicationId = null;
}
async function updateApplication() {
    editApplicationError.textContent = "";

    const message = editApplicationMessage.value.trim();

    if (message === "") {
        editApplicationError.textContent = "Application message is required.";

        return;
    }

    saveEditBtn.disabled = true;
    saveEditBtn.textContent = "Saving...";

    try {
        await api.put(`${API.APPLICATIONS}/${selectedApplicationId}`, {
            application_message: message,
        });

        closeEditModal();

        loadApplications();
    } catch (err) {
        showToast(err.message);
    } finally {
        saveEditBtn.disabled = false;
        saveEditBtn.textContent = "Save Changes";
    }
}
function closeEditModal() {
    editModal.classList.remove("is-open");

    editModal.classList.add("hidden");

    editApplicationMessage.value = "";

    editApplicationError.textContent = "";
}
function getStatusClass(status) {
    switch (status) {
        case "Pending":
            return "status-pending";

        case "Accepted":
            return "status-accepted";

        case "Rejected":
            return "status-rejected";

        default:
            return "";
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}
