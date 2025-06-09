class Task {
    constructor(title, description) {
        this.title = title;
        this.description = description;
        this.completed = false;
    }

    markCompleted() {
        this.completed = true;
    }

    display(index) {
        return `
            <div class="task ${this.completed ? "completed" : ""}">
                <b>${this.title}</b>: ${this.description}
                <br>
                <button onclick="completeTask(${index})">Complete</button>
                <button onclick="updateTask(${index})">Update</button>
                <button onclick="deleteTask(${index})">Delete</button>
            </div>
        `;
    }
}

class TaskManager {
    constructor() {
        this.taskList = [];
    }

    addTask(title, description) {
        this.taskList.push(new Task(title,description));
    }

    completeTask(index) {
        this.taskList[index].markCompleted(index);
    }

    deleteTask(index) {
        this.taskList.splice(index, 1);
    }

    updateTask(index, newTitle, newDesc) {
        if (this.taskList[index]) {
            this.taskList[index].title = newTitle;
            this.taskList[index].description = newDesc;
        }
    }


    update() {
        document.getElementById("taskList").innerHTML = this.taskList.map((task, index) => task.display(index)).join(""); 
    }
}

const handler = new TaskManager();

function addTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const description =document.getElementById("taskDesc").value.trim();

    if(title) {
        handler.addTask(title,description);
        handler.update();
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDesc").value = "";
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
    const newTitle = prompt("Enter new title:", currentTask.title);
    const newDesc = prompt("Enter new description:", currentTask.description);
    if (newTitle === "") {
        alert("Title is required");
    }
    else {
        handler.updateTask(index, newTitle, newDesc);
        handler.update();
    }
}
