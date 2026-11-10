const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const taskContent = document.getElementById("taskContent");

const applicationForm = document.getElementById("applicationForm");
const applicationMessage = document.getElementById("applicationMessage");
const applicationError = document.getElementById("applicationError");
const submitApplicationBtn = document.getElementById("submitApplicationBtn");

let hasApplied = false;
document.addEventListener("DOMContentLoaded", initializePage);

applicationForm.addEventListener("submit", submitApplication);
async function initializePage() {
    await loadTask();

    await checkApplicationStatus();
}

async function loadTask() {
    loadingState.classList.remove("hidden");
    errorState.classList.add("hidden");
    taskContent.classList.add("hidden");

    try {
        const taskId = getTaskId();

        const task = await api.get(`${API.TASKS}/${taskId}`);

        document.getElementById("taskCategory").textContent = task.category;
        document.getElementById("taskBudget").textContent = `$${task.budget}`;
        document.getElementById("taskTitle").textContent = task.title;
        document.getElementById("taskLocation").textContent = task.location;
        document.getElementById("taskDuration").textContent = task.estimated_duration;
        document.getElementById("taskDeadline").textContent = formatDate(task.application_deadline);
        document.getElementById("taskStatus").textContent = task.task_status;
        document.getElementById("taskDescription").textContent = task.description;

        if (task.task_status !== "Open") {
            submitApplicationBtn.disabled = true;
            submitApplicationBtn.textContent = "Task Closed";
            submitApplicationBtn.classList.remove("btn-dark");
            submitApplicationBtn.classList.add("btn-disabled");
            applicationMessage.disabled = true;
        }

        loadingState.classList.add("hidden");
        taskContent.classList.remove("hidden");
    } catch (err) {
        loadingState.classList.add("hidden");

        errorState.classList.remove("hidden");

        errorState.querySelector("p").textContent = err.message;
    }
}

async function submitApplication(e) {
    e.preventDefault();

    document.getElementById("applicationError").textContent = "";

    const message = applicationMessage.value.trim();

    if (message === "") {
        document.getElementById("applicationError").textContent = "Please enter an application message.";

        return;
    }
    if (hasApplied) {
        return;
    }

    submitApplicationBtn.disabled = true;
    submitApplicationBtn.textContent = "Submitting...";

    try {
        const result = await api.post(`${API.APPLICATIONS}`, {
            task_id: getTaskId(),

            application_message: message,
        });

        showToast(result.message);

        window.location.href = "my-applications.html";
    } catch (err) {
        showToast(err.message);
    } finally {
        submitApplicationBtn.disabled = false;
        submitApplicationBtn.textContent = "Submit Application";
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}
async function checkApplicationStatus() {
    try {
        const userId = getUserId();

        const applications = await api.get(`${API.USERS}/${userId}/applications`);

        hasApplied = applications.some((application) => application.task_id === getTaskId());

        if (hasApplied) {
            applicationMessage.disabled = true;
            document.getElementById("alreadyAppliedMessage").classList.remove("hidden");

            submitApplicationBtn.disabled = true;
            submitApplicationBtn.textContent = "Already Applied";
            submitApplicationBtn.classList.remove("btn-dark");
            submitApplicationBtn.classList.add("btn-disabled");
        }
    } catch (err) {
        console.error(err);
    }
}
