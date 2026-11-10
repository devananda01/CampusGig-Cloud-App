const form = document.getElementById("createTaskForm");
const createTaskBtn = document.getElementById("createTaskBtn");
const categorySelect = document.getElementById("category");
const otherCategoryGroup = document.getElementById("otherCategoryGroup");
const otherCategory = document.getElementById("otherCategory");
const params = new URLSearchParams(window.location.search);
const isEdit = params.get("mode") === "edit";

categorySelect.addEventListener("change", toggleOtherCategory);

form.addEventListener("submit", saveTask);

document.addEventListener("DOMContentLoaded", initializeForm);
async function saveTask(e) {
    e.preventDefault();

    if (isEdit) {
        await updateTask();
    } else {
        await createTask();
    }
}
async function createTask(e) {
    clearErrors();

    const title = document.getElementById("title").value.trim();
    let category = document.getElementById("category").value;

    if (category === "Other") {
        category = otherCategory.value.trim();
    }
    const budget = document.getElementById("budget").value;
    const location = document.getElementById("location").value.trim();
    const application_deadline = document.getElementById("applicationDeadline").value;
    document.getElementById("applicationDeadline").min = new Date().toISOString().split("T")[0];

    const durationValue = document.getElementById("durationValue").value;

    const durationUnit = document.getElementById("durationUnit").value;

    const estimated_duration = `${durationValue}${durationUnit}`;
    const description = document.getElementById("description").value.trim();

    if (!validateForm(title, category, budget, location, application_deadline, durationValue, description)) {
        return;
    }

    createTaskBtn.disabled = true;
    createTaskBtn.textContent = "Posting...";

    try {
        const result = await api.post(`${API.TASKS}`, {
            title,
            description,
            category,
            budget: Number(budget),
            location,
            estimated_duration,
            task_status: "Open",
            application_deadline: `${application_deadline}T23:59:00`,
        });

        showToast(result.message);

        window.location.href = "my-tasks.html";
    } catch (err) {
        showToast(err.message);
    } finally {
        createTaskBtn.disabled = false;
        createTaskBtn.textContent = "Post Task";
    }
}
async function updateTask() {
    clearErrors();

    const taskId = getTaskId();

    const title = document.getElementById("title").value.trim();

    let category = document.getElementById("category").value;

    if (category === "Other") {
        category = otherCategory.value.trim();
    }

    const budget = document.getElementById("budget").value;

    const location = document.getElementById("location").value.trim();

    const application_deadline = document.getElementById("applicationDeadline").value;
    document.getElementById("applicationDeadline").min = new Date().toISOString().split("T")[0];
    const durationValue = document.getElementById("durationValue").value;

    const durationUnit = document.getElementById("durationUnit").value;

    const estimated_duration = `${durationValue}${durationUnit}`;

    const description = document.getElementById("description").value.trim();

    if (!validateForm(title, category, budget, location, application_deadline, estimated_duration, description)) {
        return;
    }

    createTaskBtn.disabled = true;
    createTaskBtn.textContent = "Saving...";

    try {
        const result = await api.put(`${API.TASKS}/${taskId}`, {
            title,

            description,

            category,

            budget: Number(budget),

            location,

            estimated_duration,

            task_status: "Open",

            application_deadline: `${application_deadline}T23:59:00`,
        });

        showToast(result.message);

        window.location.href = "my-tasks.html";
    } catch (err) {
        showToast(err.message);
    } finally {
        createTaskBtn.disabled = false;
        createTaskBtn.textContent = "Save Changes";
    }
}
function validateForm(title, category, budget, location, application_deadline, durationValue, description) {
    let valid = true;

    if (title === "") {
        document.getElementById("titleError").textContent = "Title is required.";
        valid = false;
    }

    if (category === "") {
        document.getElementById("categoryError").textContent = "Please select a category.";
        valid = false;
    }
    if (category === "Other" && otherCategory.value.trim() === "") {
        document.getElementById("otherCategoryError").textContent = "Please enter a category.";

        valid = false;
    }

    if (budget === "" || Number(budget) <= 0) {
        document.getElementById("budgetError").textContent = "Enter a valid budget.";
        valid = false;
    }

    if (location === "") {
        document.getElementById("locationError").textContent = "Location is required.";
        valid = false;
    }

    if (durationValue === "" || Number(durationValue) <= 0) {
        document.getElementById("durationError").textContent = "Please enter a valid duration.";

        valid = false;
    }

    if (description === "") {
        document.getElementById("descriptionError").textContent = "Description is required.";
        valid = false;
    }

    return valid;
}
function toggleOtherCategory() {
    if (categorySelect.value === "Other") {
        otherCategoryGroup.classList.remove("hidden");
    } else {
        otherCategoryGroup.classList.add("hidden");
        otherCategory.value = "";
    }
}
async function initializeForm() {
    if (!isEdit) {
        return;
    }

    document.getElementById("pageTitle").textContent = "Edit Task";

    document.getElementById("pageSubtitle").textContent = "Update your task details below.";

    createTaskBtn.textContent = "Save Changes";

    await loadTask();
}
async function loadTask() {
    try {
        const taskId = getTaskId();

        const task = await api.get(`${API.TASKS}/${taskId}`);

        console.log(task);
        console.log(task.application_deadline);
        document.getElementById("title").value = task.title;

        document.getElementById("budget").value = task.budget;

        document.getElementById("location").value = task.location;

        const match = task.estimated_duration.match(/^(\d+)(min|hr|day)$/i);

        if (match) {
            document.getElementById("durationValue").value = match[1];
            document.getElementById("durationUnit").value = match[2];
        }

        document.getElementById("applicationDeadline").value = task.application_deadline.split("T")[0];

        document.getElementById("description").value = task.description;

        const categoryExists = [...categorySelect.options].some((option) => option.value === task.category);

        if (categoryExists) {
            categorySelect.value = task.category;

            otherCategoryGroup.classList.add("hidden");

            otherCategory.value = "";
        } else {
            categorySelect.value = "Other";

            otherCategoryGroup.classList.remove("hidden");

            otherCategory.value = task.category;
        }
    } catch (err) {
        showToast(err.message);

        window.location.href = "my-tasks.html";
    }
}
function clearErrors() {
    document.getElementById("titleError").textContent = "";
    document.getElementById("categoryError").textContent = "";
    document.getElementById("otherCategoryError").textContent = "";
    document.getElementById("budgetError").textContent = "";
    document.getElementById("locationError").textContent = "";
    document.getElementById("deadlineError").textContent = "";
    document.getElementById("durationError").textContent = "";
    document.getElementById("descriptionError").textContent = "";
}
