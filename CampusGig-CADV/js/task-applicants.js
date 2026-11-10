const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const taskContent = document.getElementById("taskContent");
const emptyState = document.getElementById("emptyState");

const applicantContainer = document.getElementById("applicantContainer");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskStatus = document.getElementById("taskStatus");
const pendingCount = document.getElementById("pendingCount");

const acceptModal = document.getElementById("acceptModal");
const rejectModal = document.getElementById("rejectModal");

const confirmAcceptBtn = document.getElementById("confirmAcceptBtn");
const cancelAcceptBtn = document.getElementById("cancelAcceptBtn");
const closeAcceptBtn = document.getElementById("closeAcceptBtn");

const confirmRejectBtn = document.getElementById("confirmRejectBtn");
const cancelRejectBtn = document.getElementById("cancelRejectBtn");
const closeRejectBtn = document.getElementById("closeRejectBtn");

let selectedApplicationId = null;

document.addEventListener("DOMContentLoaded", loadPage);

confirmAcceptBtn.addEventListener("click", () => {
    updateApplicationStatus("Accepted");
});

confirmRejectBtn.addEventListener("click", () => {
    updateApplicationStatus("Rejected");
});

cancelAcceptBtn.addEventListener("click", closeAcceptModal);
closeAcceptBtn.addEventListener("click", closeAcceptModal);

cancelRejectBtn.addEventListener("click", closeRejectModal);
closeRejectBtn.addEventListener("click", closeRejectModal);

async function loadPage() {
    loadingState.classList.remove("hidden");
    taskContent.classList.add("hidden");
    emptyState.classList.add("hidden");

    try {
        await loadTask();

        await loadApplicants();

        loadingState.classList.add("hidden");
        taskContent.classList.remove("hidden");
    } catch (err) {
        loadingState.classList.add("hidden");

        errorState.classList.remove("hidden");

        errorState.querySelector("p").textContent = err.message;
    }
}

async function loadTask() {
    const task = await api.get(`${API.TASKS}/${getTaskId()}`);

    taskTitle.textContent = task.title;

    taskDescription.textContent = task.description;

    taskStatus.textContent = task.task_status;
}

async function loadApplicants() {
    applicantContainer.innerHTML = "";

    const applications = await api.get(`${API.TASKS}/${getTaskId()}/applications`);

    if (applications.length === 0) {
        emptyState.classList.remove("hidden");

        return;
    }

    await Promise.all(
        applications.map(async (application) => {
            try {
                const user = await api.get(`${API.USERS}/${application.applicant_id}`);

                application.applicant_name = user.full_name;
            } catch {
                application.applicant_name = application.applicant_id;
            }
        }),
    );

    const pending = applications.filter((app) => app.application_status === "Pending").length;

    pendingCount.textContent = pending;

    displayApplicants(applications);
}

function displayApplicants(applications) {
    applicantContainer.innerHTML = "";

    applications.forEach((application) => {
        applicantContainer.appendChild(createApplicantCard(application));
    });
}

function createApplicantCard(application) {
    const article = document.createElement("article");

    article.className = "applicant-card";

    let actions = "";

    if (application.application_status === "Pending") {
        actions = `
            <button
                class="btn btn-dark btn-sm acceptBtn">

                Accept

            </button>

            <button
                class="btn btn-reject btn-sm rejectBtn">

                Reject

            </button>
        `;
    } else {
        actions = `
            <span class="status-badge ${getStatusClass(application.application_status)}">

                ${application.application_status}

            </span>
        `;
    }

    article.innerHTML = `

        <div class="applicant-info">

            <p class="applicant-name">

                ${application.applicant_name}

            </p>

            <p class="applicant-quote">

                "${application.application_message}"

            </p>

        </div>

        <div class="applicant-meta">

            <span class="meta-text-label">

                Applied

            </span>

            <span class="meta-text-value">

                ${formatDate(application.applied_at)}

            </span>

        </div>

        <div class="applicant-actions">

            ${actions}

        </div>

    `;

    const acceptBtn = article.querySelector(".acceptBtn");

    if (acceptBtn) {
        acceptBtn.addEventListener("click", () => {
            selectedApplicationId = application.application_id;

            acceptModal.classList.remove("hidden");

            acceptModal.classList.add("is-open");
        });
    }

    const rejectBtn = article.querySelector(".rejectBtn");

    if (rejectBtn) {
        rejectBtn.addEventListener("click", () => {
            selectedApplicationId = application.application_id;

            rejectModal.classList.remove("hidden");

            rejectModal.classList.add("is-open");
        });
    }

    return article;
}

async function updateApplicationStatus(status) {
    try {
        await api.put(`${API.APPLICATIONS}/${selectedApplicationId}/status`, {
            application_status: status,
        });

        showToast(`Applicant ${status.toLowerCase()} successfully.`);

        closeAcceptModal();
        closeRejectModal();

        loadApplicants();
    } catch (err) {
        showToast(err.message);
    }
}
function closeAcceptModal() {
    acceptModal.classList.remove("is-open");

    acceptModal.classList.add("hidden");

    selectedApplicationId = null;
}

function closeRejectModal() {
    rejectModal.classList.remove("is-open");

    rejectModal.classList.add("hidden");

    selectedApplicationId = null;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function getStatusClass(status) {
    switch (status) {
        case "Accepted":
            return "status-accepted";

        case "Rejected":
            return "status-rejected";

        case "Pending":
            return "status-pending";

        default:
            return "";
    }
}
