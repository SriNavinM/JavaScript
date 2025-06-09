class Task {
    constructor(title, description, dueDate) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.completed = false;
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
                <td>${this.completed ? "Completed" : "Pending"}</td>
                <td>
                    <button onclick="completeTask(${index})">Complete</button>
                    <button onclick="editTask(${index})">Update</button>
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

    addTask(title, description, dueDate) {
        if (this.taskList.some(task => task.title.toLowerCase() === title.toLowerCase())) {
            alert("Task with this title already exists");
            return;
        }
        this.taskList.push(new Task(title, description, dueDate));
    }

    completeTask(index) {
        this.taskList[index].markCompleted();
    }

    deleteTask(index) {
        this.taskList.splice(index, 1);
    }

    update() {
    const filter = document.getElementById("statusFilter")?.value || "all";

    const filteredTasks = this.taskList
        .map((task, originalIndex) => ({ task, originalIndex })) // keep original index for actions
        .filter(({ task }) => {
            if (filter === "all") return true;
            if (filter === "pending") return !task.completed;
            if (filter === "completed") return task.completed;
        });

    document.getElementById("tableBody").innerHTML = filteredTasks
        .map(({ task, originalIndex }) => task.display(originalIndex))
        .join("");
}

    updateTask(index, newTitle, newDesc, newDueDate) {
        if (this.taskList.some((task, i) => i !== index && task.title.toLowerCase() === newTitle.toLowerCase())) {
            alert("Another task with this title already exists!");
            return;
        }
        this.taskList[index].title = newTitle;
        this.taskList[index].description = newDesc;
        this.taskList[index].dueDate = newDueDate;
    }
}

const handler = new TaskManager();

function addTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDesc").value.trim();
    const dueDate = document.getElementById("taskDueDate").value;

    if (title) {
        handler.addTask(title, description, dueDate);
        handler.update();
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDesc").value = "";
        document.getElementById("taskDueDate").value = "";
    }
    else {
        alert("Title is required");
    }
}

function completeTask(index) {
    handler.completeTask(index);
    handler.update();
}

function deleteTask(index) {
    handler.deleteTask(index);
    handler.update();
}
function updateTask(index) {
    const currentTask = handler.taskList[index];
    if (newTitle === "") {
        alert("Title is required");
    }
    else {
        handler.updateTask(index, newTitle, newDesc);
        handler.update();
    }
}

let currentUpdateIndex = null;

function editTask(index) {
    const task = handler.taskList[index];
    currentUpdateIndex = index;
    document.getElementById("updateTitle").value = task.title;
    document.getElementById("updateDesc").value = task.description;
    document.getElementById("updateDueDate").value = task.dueDate;

    document.getElementById("updateModal").style.display = "block";
}

function closeModal() {
    document.getElementById("updateModal").style.display = "none";
}

function saveUpdate() {
    const newTitle = document.getElementById("updateTitle").value.trim();
    const newDesc = document.getElementById("updateDesc").value.trim();
    const newDueDate = document.getElementById("updateDueDate").value;

    if (newTitle === "") {
        alert("Title is required");
        return;
    }

    handler.updateTask(currentUpdateIndex, newTitle, newDesc, newDueDate);
    handler.update();
    closeModal();
}

function applyFilter() {
    handler.update();
}