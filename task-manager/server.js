
const express = require('express');
const path = require('path');
const { json } = require('stream/consumers');
const pool = require('./db');

// const dataFile = path.join(__dirname, 'data', 'tasks.json');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query(`select * from tasks order by completed`);
        return res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching tasks');
        return res.status(500).json({ message: 'Failed to fetch tasks.json' });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { title, description, dueDate } = req.body;
    try {
        const result = await pool.query(
            `insert into tasks(title, description, due_date)
            values ($1, $2, $3)
            returning *`,
            [title, description, dueDate]
        );
        return res.status(201).json(result.rows[0]);
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to add task' });
    }
});


app.patch('/api/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const { completed } = req.body;
    try {
        const result = await pool.query(
            `update tasks
            set completed = $1,
                completed_at = case when $1 then current_timestamp else null end
            where id = $2
            returning *`,
            [completed, id]
        );
        return res.status(200).json({ message: 'Task Updated Succesfully'});
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update task' });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const { title, description, dueDate } = req.body;
    try {
        const result = await pool.query(
            `update tasks
            set title = $1,
                description = $2,
                due_date = $3
            where id = $4
            returning *`,
            [title, description, dueDate, id]
        );
        return res.status(200).json({ message: 'Task Updated Succesfully'});
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update task' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query(
            `delete from tasks where id = $1 returning *`,
            [id]
        );
        return res.status(200).json({ message: 'Task Deleted Succesfully'});
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete task' });
    }
});

app.listen(8080, () => {
    console.log("http://localhost:8080/");
});

