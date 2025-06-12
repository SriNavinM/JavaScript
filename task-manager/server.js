
const express = require('express');
const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');

const dataFile = path.join(__dirname, 'data', 'tasks.json');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/tasks', (req, res) => {
    fs.readFile(dataFile, (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to load tasks.json' });
        }
        const tasks = JSON.parse(data);
        res.json(tasks);
    });
});

app.post('/api/tasks', (req, res) => {
    const newTask = req.body;
    fs.readFile(dataFile, (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to load tasks.json' });
        }

        let tasks = [];
        try {
            tasks = JSON.parse(data || []);
        }
        catch (err) {
            return res.status(500).json({ message: 'Invalid data' });
        }

        tasks.push(newTask);

        fs.writeFile(dataFile, JSON.stringify(tasks, null, 4), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save task' });
            }

            return res.status(201).json({ message: 'Task Added Successfully' });
        });
    });
})

app.patch('/api/tasks/:index', (req, res) => {
    const index = req.params.index;
    const { completed } = req.body;

    fs.readFile(dataFile, (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read tasks.json' });
        }

        let tasks = [];
        try {
            tasks = JSON.parse(data || []);
        }
        catch (err) {
            return res.status(500).json({ message: 'Invalid data' });
        }

        tasks[index].completed = completed;
        if (completed) {
            tasks[index].completedAt = new Date().toISOString();
        }
        else {
            delete tasks[index].completedAt;
        }

        fs.writeFile(dataFile, JSON.stringify(tasks, null, 4), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to update task' });
            }

            return res.status(200).json({ message: 'Task updated successfuly' });
        });
    });
});

app.put('/api/tasks/:index', (req, res) => {
    const index = req.params.index;
    const { title, description, dueDate } = req.body;

    fs.readFile(dataFile, (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read tasks.json' });
        }

        let tasks = [];
        try {
            tasks = JSON.parse(data || []);
        }
        catch (err) {
            return res.status(500).json({ message: 'Invalid data' });
        }

        if (index < 0 || index >= tasks.length) {
            return res.status(404).json({ message: 'Task not found' });
        }

        tasks[index].title = title;
        tasks[index].description = description;
        tasks[index].dueDate = dueDate;

        fs.writeFile(dataFile, JSON.stringify(tasks, null, 4), (err) => {
            if(err) {
                return res.status(500).json({ message: 'Failed to update task' });
            }

            return res.status(200).json({ message: 'Task updated successfuly' });
        });
    });
});

app.delete('/api/tasks/:index', (req, res) => {
    const index = req.params.index;

    fs.readFile(dataFile, (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read tasks.json' });
        }

        let tasks = [];
        try {
            tasks = JSON.parse(data || []);
        }
        catch (err) {
            return res.status(500).json({ message: 'Invalid data' });
        }

        if (index < 0 || index >= tasks.length) {
            return res.status(404).json({ message: 'Task not found' });
        }

        tasks.splice(index,1);

        fs.writeFile(dataFile, JSON.stringify(tasks, null, 4), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to delete task' });
            }

            return res.status(200).json({ message: 'Task deleted successfuly' });
        });
    });
});

app.listen(8080, () => {
    console.log("http://localhost:8080/");
});

