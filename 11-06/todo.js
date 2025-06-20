class Task {
    constructor(title, description, dueDate, completed = false) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.completed = completed;
    }

    markCompleted() {
        this.completed = true;
    }

    display(index) {
        return `
            <tr class="task ${this.completed ? "completed" : ""}">
                <td>${this.title}</td>
                <td>${this.description}</td>
                <td>${this.dueDate}</td>
                <td id="${this.completed ? "completed" : "pending"}">${this.completed ? "Completed" : "Pending"}</td>
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
        fetch("/api/tasks")
            .then(response => response.json())
            .then(data => {
                this.taskList = data.map(x => new Task(x.title, x.description, x.dueDate, x.completed));
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

    completeTask(index) {
        this.taskList[index].markCompleted();
        this.update();
    }

    deleteTask(index) {
        this.taskList.splice(index, 1);
    }

    update() {
        const filter = document.getElementById("statusFilter")?.value || "all";
        const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
        const filteredTasks = this.taskList
            .map((task, originalIndex) => ({ task, originalIndex }))
            .filter(({ task }) => {
                const matchStatus = filter === "all" || (filter === "pending" && !task.completed) || (filter === "completed" && task.completed);
                const matchSearch = task.title.toLowerCase().includes(search);

                return (matchSearch && matchStatus);
            })
            .sort((a, b) => {
                return a.task.completed - b.task.completed;
            })



        document.getElementById("tableBody").innerHTML = filteredTasks
            .map(({ task, originalIndex }) => task.display(originalIndex))
            .join("");
    }

    updateTask(index, newTitle, newDesc, newDueDate) {
        if (this.taskList.some((task, i) => i !== index && task.title.toLowerCase() === newTitle.toLowerCase())) {
            const error = document.getElementById("err-msg");
            error.textContent = "Task with this title already exists!";
            error.style.display = "block";
            return false;
        }
        this.taskList[index].title = newTitle;
        this.taskList[index].description = newDesc;
        this.taskList[index].dueDate = newDueDate;
        return true;
    }
}

const handler = new TaskManager();

function completeTask(index) {
    handler.completeTask(index);
    handler.update();
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
        if(!flag) return;
    }
    else {
        if(!handler.updateTask(currentUpdateIndex, title, desc, dueDate)) return;
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