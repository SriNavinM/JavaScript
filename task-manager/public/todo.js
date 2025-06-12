class Task {
    constructor(title, description, dueDate, completed = false, completedAt = null) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.completed = completed;
        this.completedAt = completedAt;
    }

    markCompleted() {
        this.completed = true;
        this.completedAt = new Date().toISOString();
    }

    display(index) {
        const due = new Date(this.dueDate).toLocaleString();
        const completedInfo = this.completedAt
            ? `<br/><small>at ${new Date(this.completedAt).toLocaleString()}</small>`
            : "";
        return `
            <tr class="task ${this.completed ? "completed" : ""}">
                <td>${this.title}</td>
                <td>${this.description}</td>
                <td>${due}</td>
                <td id="${this.completed ? "completed" : "pending"}">${this.completed ? "Completed" + completedInfo : "Pending"}</td>
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
        fetch('/api/tasks')
            .then(response => response.json())
            .then(data => {
                this.taskList = data.map(x => new Task(x.title, x.description, x.dueDate, x.completed, x.completedAt));
                this.update();
            })
            .catch(err => console.error("Failed to load tasks", err));
    }

    async addTask(title, description, dueDate) {
        if (this.taskList.some(task => task.title.toLowerCase() === title.toLowerCase())) {
            const error = document.getElementById("err-msg");
            error.textContent = "Task with this title already exists!";
            error.style.display = "block";
            return false;
        }
        const newTask = { title, description, dueDate, completed: false };

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newTask)
            });

            if (!response.ok) {
                throw new Error("Failed to save task");
            }

            this.taskList.push(new Task(title, description, dueDate, false));
            return true;
        } catch (err) {
            console.error(err);
            const error = document.getElementById("err-msg");
            error.textContent = "Error saving task!";
            error.style.display = "block";
            return false;
        }
        return true;
    }

    async completeTask(index) {
        const task = this.taskList[index];
        try {
            const response = await fetch(`/api/tasks/${index}`, {
                method: 'PATCH',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ completed: true })
            });

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            task.markCompleted();
            this.update();
        }
        catch (err) {
            console.error(err);
        }
    }

    async deleteTask(index) {
        try {
            const response = await fetch(`/api/tasks/${index}`, {
                method: 'DELETE'
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

        try {
            const response = await fetch(`/api/tasks/${index}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, description: newDesc, dueDate: newDueDate })
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

function completeTask(index) {
    handler.completeTask(index);
}

function deleteTask(index) {
    handler.deleteTask(index);
    handler.update();
}

let currentUpdateIndex = null;

function openModal(isEdit = false, index = null) {
    const modalTitle = document.getElementById("modalTitle");
    currentUpdateIndex = index;

    if (isEdit) {
        const task = handler.taskList[index];
        document.getElementById("title").value = task.title;
        document.getElementById("desc").value = task.description;
        document.getElementById("dueDate").value = task.dueDate;
        modalTitle.textContent = "Update Task";
    }
    else {
        document.getElementById("title").value = "";
        document.getElementById("desc").value = "";
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
    const desc = document.getElementById("desc").value.trim();
    const dueDate = document.getElementById("dueDate").value;

    if (title === "") {
        const error = document.getElementById("err-msg");
        error.textContent = "Title is required";
        error.style.display = "block";
        return;
    }

    if (currentUpdateIndex == null) {
        const flag = await handler.addTask(title, desc, dueDate);
        if (!flag) return;
    }
    else {
        const flag = await handler.updateTask(currentUpdateIndex, title, desc, dueDate);
        if (!flag) return;
    }

    handler.update();
    closeModal();
}

function applyFilter() {
    handler.update();
}

window.onload = () => {
    handler.update();
};