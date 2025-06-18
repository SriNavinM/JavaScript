
const express = require('express');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// const dataFile = path.join(__dirname, 'data', 'tasks.json');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `Insert into users (username, password, email) values ($1, $2, $3) returning *`,
            [username, hashedPassword, email]
        );

        return res.status(201).json({ success: true, user_id: result.rows[0].user_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

const otpGenerator = () => { return Math.floor(100000 + Math.random() * 900000) }
const otpCatch = {}

const transporter = nodemailer.createTransport(
    {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMPT_USER,
            pass: process.env.SMPT_PASS
        }
    }
)

async function sendOtp(email, otp) {
    await transporter.sendMail({
        to: email,
        subject: 'Your OTP for registration',
        html: `Your OTP is: ${otp}`,
    });
}

app.post('/send-otp', async (req, res) => {
    const { username, email } = req.body;
    try {
        const checkUser = await db.query('select * from users where username = $1', [username]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: "Username already taken" });
        }

        const checkEmail = await db.query('select * from users where email = $1', [email]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ error: "Account with this email already exists" });
        }

        const otp = otpGenerator();
        otpCatch[email] = { otp };

        sendOtp(email, otp);

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    }
    catch(err) {
        console.error('Error sending email:', err);
        res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
});

app.post('/verify-otp', async (req, res) => {
    const { username, password, email, otp } = req.body;
    try {
        if (otpCatch[email].otp == otp) {
            return res.status(200).json({ success: true, message: 'OTP verified' });
        }
        res.status(400).json({ success: false, error: 'Invalid OTP'})
    }
    catch(err) {
        console.error(err);
        res.status(500).json({ error: "Server error during OTP verification" });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query(`select * from users where username = $1`, [username]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid username" });;
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }
        return res.status(200).json({ success: true, user_id: user.user_id });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/api/tasks', async (req, res) => {
    const user_id = req.query.user_id;
    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const result = await db.query(`select * from tasks where user_id = $1 order by completed`, [user_id]);
        return res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching tasks');
        return res.status(500).json({ message: 'Failed to fetch tasks.json' });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { title, description, dueDate, user_id } = req.body;
    try {
        const result = await db.query(
            `insert into tasks(title, description, due_date, user_id)
            values ($1, $2, $3, $4)
            returning *`,
            [title, description, dueDate, user_id]
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
    const { completed, user_id } = req.body;

    try {
        const result = await db.query(
            `update tasks
            set completed = $1,
                completed_at = case when $1 then current_timestamp else null end
            where id = $2 and user_id = $3
            returning *`,
            [completed, id, user_id]
        );

        return res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update task' });
    }
});


app.put('/api/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const { title, description, dueDate, user_id } = req.body;
    try {
        const result = await db.query(
            `update tasks
            set title = $1,
                description = $2,
                due_date = $3
            where id = $4 and user_id = $5
            returning *`,
            [title, description, dueDate, id, user_id]
        );
        return res.status(200).json({ message: 'Task Updated Succesfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update task' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const { user_id } = req.body;
    try {
        await db.query(
            `delete from tasks where id = $1 and user_id = $2 returning *`,
            [id, user_id]
        );
        return res.status(200).json({ message: 'Task Deleted Succesfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete task' });
    }
});

app.listen(8080, () => {
    console.log("http://localhost:8080/");
});



