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