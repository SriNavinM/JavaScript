class Task {
    constructor(id, title, description, dueDate, completed = false, completed_at = null) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.completed = completed;
        this.completed_at = completed_at;
    }

    display(index) {
        const dueDateObj = new Date(this.dueDate);
        const due = isNaN(dueDateObj) ? "Invalid Date" : dueDateObj.toLocaleString();

        const completedInfo = this.completed_at
            ? `<br/><small>at ${new Date(this.completed_at).toLocaleString()}</small>`
            : "";

        return `
        <tr class="task ${this.completed ? "completed" : ""}">
            <td>${this.title}</td>
            <td>${this.description}</td>
            <td>${due}</td>
            <td id="${this.completed ? "completed" : "pending"}">
                ${this.completed ? "Completed" + completedInfo : "Pending"}
            </td>

            <td>
                ${!this.completed ? `<button onclick="completeTask(${index})">Done</button>` : ""}
                ${!this.completed ? `<button onclick="editTask(${index})">Update</button>` : ""}
                <button onclick="deleteTask(${index})">Delete</button>
            </td>
        </tr>
    `;
    }

}

class TaskManager {
    constructor() {
        this.taskList = [];
    }

    async load() {
        const user_id = localStorage.getItem("user_id");
        try {
            const response = await fetch(`/api/tasks?user_id=${user_id}`);
            const data = await response.json();
            this.taskList = data.map(x =>
                new Task(x.id, x.title, x.description, x.due_date, x.completed, x.completed_at)
            );
            this.update();
        } catch (err) {
            console.error("Failed to load tasks", err);
        }
    }

    async addTask(title, description, dueDate) {
        if (this.taskList.some(task => task.title.toLowerCase() === title.toLowerCase())) {
            const error = document.getElementById("err-msg");
            error.textContent = "Task with this title already exists!";
            error.style.display = "block";
            return false;
        }
        const user_id = localStorage.getItem("user_id");
        const newTask = { title, description, dueDate, user_id };

        try {
            const response = await fetch(`/api/tasks?user_id=${user_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newTask)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error("Failed to save task");
            }

            this.taskList.push(
                new Task(
                    data.id,
                    data.title,
                    data.description,
                    data.due_date,
                    data.completed,
                    data.completed_at || null
                )
            );
            return true;
        } catch (err) {
            console.error(err);
            const error = document.getElementById("err-msg");
            error.textContent = "Error saving task!";
            error.style.display = "block";
            return false;
        }
    }

    async completeTask(index) {
        const task = this.taskList[index];
        const user_id = localStorage.getItem("user_id");
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ completed: true, user_id })
            });

            const data = await response.json();
            task.completedAt = data.completed_at;

            if (!response.ok) {
                throw new Error("Failed to update task");
            }
            this.update();
        }
        catch (err) {
            console.error(err);
        }
    }

    async deleteTask(index) {
        const user_id = localStorage.getItem("user_id");
        try {
            const response = await fetch(`/api/tasks/${this.taskList[index].id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id })
            });
            if (!response.ok) {
                throw new Error("Failed to delete task");
            }

            this.taskList.splice(index, 1);
            this.update();
        } catch (err) {
            console.error(err);
        }
    }

    update() {
        const filter = document.getElementById("statusFilter")?.value || "all";
        const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
        const sortField = document.getElementById("sortField")?.value || "dueDate";
        const sortOrder = document.getElementById("sortOrder")?.value || "asc";

        const filteredTasks = this.taskList
            .map((task, originalIndex) => ({ task, originalIndex }))
            .filter(({ task }) => {
                const matchStatus =
                    filter === "all" || (filter === "pending" && !task.completed) || (filter === "completed" && task.completed);
                const matchSearch = task.title.toLowerCase().includes(search);
                return matchStatus && matchSearch;
            })
            .sort((a, b) => {
                let valA, valB;

                if (sortField === "status") {
                    valA = a.task.completed ? 1 : 0;
                    valB = b.task.completed ? 1 : 0;
                } else {
                    valA = a.task[sortField];
                    valB = b.task[sortField];

                    if (sortField === "dueDate") {
                        valA = new Date(valA);
                        valB = new Date(valB);
                    } else if (typeof valA === "string" && typeof valB === "string") {
                        valA = valA.toLowerCase();
                        valB = valB.toLowerCase();
                    }
                }

                if (valA < valB) return sortOrder === "asc" ? -1 : 1;
                if (valA > valB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });

        document.getElementById("tableBody").innerHTML = filteredTasks
            .map(({ task, originalIndex }) => task.display(originalIndex))
            .join("");
    }

    async updateTask(index, newTitle, newDesc, newDueDate) {
        if (this.taskList.some((task, i) => i !== index && task.title.toLowerCase() === newTitle.toLowerCase())) {
            const error = document.getElementById("err-msg");
            error.textContent = "Task with this title already exists!";
            error.style.display = "block";
            return false;
        }

        const user_id = localStorage.getItem("user_id");
        try {
            const response = await fetch(`/api/tasks/${this.taskList[index].id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, description: newDesc, dueDate: newDueDate, user_id })
            });

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            this.taskList[index].title = newTitle;
            this.taskList[index].description = newDesc;
            this.taskList[index].dueDate = newDueDate;
            this.update();
            return true;
        }
        catch (err) {
            console.error(err);
        }
    }
}

const handler = new TaskManager();
handler.load();

function completeTask(index) {
    handler.completeTask(index);
}

function deleteTask(index) {
    handler.deleteTask(index);
    handler.update();
}

let currentUpdateIndex = null;

function formatToDatetimeLocal(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function openModal(isEdit = false, index = null) {
    const modalTitle = document.getElementById("modalTitle");
    currentUpdateIndex = index;

    if (isEdit) {
        const task = handler.taskList[index];
        document.getElementById("title").value = task.title;
        document.getElementById("description").value = task.description;
        document.getElementById("dueDate").value = formatToDatetimeLocal(task.dueDate);
        modalTitle.textContent = "Update Task";
    }
    else {
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        document.getElementById("dueDate").value = "";
        modalTitle.textContent = "Add Task";
    }

    document.getElementById("updateModal").style.display = "block";
}

function addTask() {
    openModal();
}

function editTask(index) {
    openModal(true, index);
}

function closeModal() {
    document.getElementById("updateModal").style.display = "none";
    document.getElementById("err-msg").style.display = "none";
    currentUpdateIndex = null;
}

async function saveTask() {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("dueDate").value;

    if (title === "" || dueDate === "") {
        const error = document.getElementById("err-msg");
        error.textContent = "Title and Due Date are required";
        error.style.display = "block";
        return;
    }

    if (currentUpdateIndex == null) {
        const flag = await handler.addTask(title, description, dueDate);
        if (!flag) return;
    }
    else {
        const flag = await handler.updateTask(currentUpdateIndex, title, description, dueDate);
        if (!flag) return;
    }

    handler.update();
    closeModal();
}

function applyFilter() {
    handler.update();
}

function logout() {
    window.location.href = "/";
}

window.onload = () => {
    handler.update();
};