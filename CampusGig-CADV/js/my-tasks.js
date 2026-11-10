const taskTableBody = document.getElementById("taskTableBody");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const closeDeleteBtn = document.getElementById("closeDeleteBtn");

let deleteTaskId = "";

document.addEventListener("DOMContentLoaded", loadTasks);

confirmDeleteBtn.addEventListener("click", deleteTask);
cancelDeleteBtn.addEventListener("click", closeDeleteModal);
closeDeleteBtn.addEventListener("click", closeDeleteModal);

deleteModal.addEventListener("click", function (e) {
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});
async function loadTasks() {
    loadingState.classList.remove("hidden");
    emptyState.classList.add("hidden");

    taskTableBody.innerHTML = "";

    try {
        const userId = getUserId();

        const tasks = await api.get(`${API.USERS}/${userId}/tasks`);
        await Promise.all(
            tasks.map(async (task) => {
                try {
                    const applications = await api.get(`${API.TASKS}/${task.task_id}/applications`);

                    task.applicantCount = applications.length;
                } catch {
                    task.applicantCount = 0;
                }
            }),
        );
        loadingState.classList.add("hidden");

        if (tasks.length === 0) {
            emptyState.classList.remove("hidden");
            return;
        }

        tasks.forEach(createRow);
    } catch (err) {
        loadingState.classList.add("hidden");

        emptyState.classList.remove("hidden");

        emptyState.querySelector("h3").textContent = "Unable to load tasks";

        emptyState.querySelector("p").textContent = err.message;
    }
}

function createRow(task) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <strong>${task.title}</strong><br>
            ${task.category}
        </td>

        <td>${task.task_status}</td>

        <td>
    <button
        class="btn btn-outline btn-sm applicantsBtn"
        data-id="${task.task_id}">
        ${task.applicantCount}
    </button>
</td>

        <td>$${task.budget}</td>

        <td>

            <button class="btn btn-outline btn-sm editBtn">
                Edit
            </button>

            <button class="btn btn-outline btn-sm deleteBtn">
                Delete
            </button>

        </td>
    `;

    row.querySelector(".editBtn").addEventListener("click", () => {
        localStorage.setItem("taskId", task.task_id);

        window.location.href = "create-task.html?mode=edit";
    });

    row.querySelector(".deleteBtn").addEventListener("click", () => {
        deleteTaskId = task.task_id;

        deleteModal.classList.add("is-open");
    });

    row.querySelector(".applicantsBtn").addEventListener("click", () => {
        localStorage.setItem("taskId", task.task_id);

        window.location.href = "task-applicants.html";
    });

    taskTableBody.appendChild(row);
}

async function deleteTask() {
    try {
        await api.delete(`${API.TASKS}/${deleteTaskId}`);

        closeDeleteModal();

        loadTasks();
    } catch (err) {
        showToast(err.message);
    }
}

function closeDeleteModal() {
    deleteModal.classList.remove("is-open");

    deleteTaskId = "";
}
