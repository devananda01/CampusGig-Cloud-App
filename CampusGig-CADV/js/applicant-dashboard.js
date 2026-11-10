const taskContainer = document.getElementById("taskContainer");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const filterContainer = document.getElementById("filterContainer");

let allTasks = [];

searchForm.addEventListener("submit", searchTasks);
document.addEventListener("DOMContentLoaded", loadTasks);

async function loadTasks() {
    loadingState.classList.remove("hidden");
    emptyState.classList.add("hidden");

    taskContainer.innerHTML = "";

    try {
        allTasks = await api.get(`${API.TASKS}`);
        await Promise.all(
            allTasks.map(async (task) => {
                try {
                    const user = await api.get(`${API.USERS}/${task.user_id}`);

                    task.poster_name = user.full_name;
                } catch {
                    task.poster_name = "Unknown User";
                }
            }),
        );

        loadingState.classList.add("hidden");

        if (allTasks.length === 0) {
            emptyState.classList.remove("hidden");

            return;
        }
        generateFilters(allTasks);

        displayTasks(allTasks);
    } catch (err) {
        loadingState.classList.add("hidden");

        emptyState.classList.remove("hidden");

        emptyState.querySelector("h3").textContent = "Unable to load tasks";

        emptyState.querySelector("p").textContent = err.message;
    }
}

function displayTasks(tasks) {
    taskContainer.innerHTML = "";

    tasks.forEach((task) => {
        const card = createTaskCard(task);

        taskContainer.appendChild(card);
    });
}

function createTaskCard(task) {
    const article = document.createElement("article");

    article.className = "gig-card";

    article.innerHTML = `

        <div class="gig-card-top">

            <span class="tag">

                ${task.category}

            </span>

            <span class="gig-budget">

                $${task.budget}

            </span>

        </div>

        <h3 class="gig-title">

            ${task.title}

        </h3>

        <p class="gig-desc">

            ${truncateText(task.description)}

        </p>
        <p class="gig-poster">
    Posted by <strong>${task.poster_name}</strong>
</p>

        <hr class="gig-divider">

        <div class="gig-card-bottom">

            <div class="gig-meta">

                ${task.location}<br>

                Deadline:
                ${formatDate(task.application_deadline)}

            </div>

            <button
                class="btn btn-dark btn-sm viewDetailsBtn"
                data-id="${task.task_id}">

                View Details

            </button>

        </div>

    `;

    article.querySelector(".viewDetailsBtn").addEventListener("click", () => {
        localStorage.setItem("taskId", task.task_id);

        window.location.href = "task-details.html";
    });

    return article;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}
function truncateText(text, length = 120) {
    if (text.length <= length) {
        return text;
    }

    return text.substring(0, length) + "...";
}
async function searchTasks(e) {
    e.preventDefault();

    const keyword = searchInput.value.trim();

    if (keyword === "") {
        loadTasks();
        return;
    }

    loadingState.classList.remove("hidden");
    emptyState.classList.add("hidden");

    taskContainer.innerHTML = "";

    try {
        const tasks = await api.get(`${API.TASKS}/search?keyword=${encodeURIComponent(keyword)}`);

        loadingState.classList.add("hidden");

        if (tasks.length === 0) {
            emptyState.classList.remove("hidden");

            return;
        }
        document.querySelector(".filter-bar").classList.add("hidden");
        displayTasks(tasks);
    } catch (err) {
        loadingState.classList.add("hidden");

        emptyState.classList.remove("hidden");

        emptyState.querySelector("h3").textContent = "No matching tasks";

        emptyState.querySelector("p").textContent = err.message;
    }
}
function generateFilters(tasks) {
    filterContainer.innerHTML = "";

    // All Categories button
    const allButton = document.createElement("button");

    allButton.type = "button";
    allButton.className = "filter-pill active";
    allButton.textContent = "All Categories";

    allButton.addEventListener("click", function () {
        setActiveFilter(this);

        displayTasks(allTasks);
    });

    filterContainer.appendChild(allButton);

    // Unique categories
    const categories = [...new Set(tasks.map((task) => task.category))];

    categories.sort();

    categories.forEach((category) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "filter-pill";

        button.textContent = category;

        button.addEventListener("click", function () {
            setActiveFilter(this);

            filterTasks(category);
        });

        filterContainer.appendChild(button);
    });
}
function filterTasks(category) {
    const filteredTasks = allTasks.filter((task) => task.category === category);

    displayTasks(filteredTasks);
}
function setActiveFilter(activeButton) {
    const buttons = filterContainer.querySelectorAll(".filter-pill");

    buttons.forEach((button) => {
        button.classList.remove("active");
    });

    activeButton.classList.add("active");
}
