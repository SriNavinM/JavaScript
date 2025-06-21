
const express = require('express');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

require('dotenv').config();

// const dataFile = path.join(__dirname, 'data', 'tasks.json');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new pgSession({
        pool: db,
        tableName: 'session',
        pruneSessionInterval: 60
    }),
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        secure: false,
        httpOnly: true
    }
}));

function isStrongPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
}

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!isStrongPassword(password)) {
        return res.status(400).json({ error: "Weak password. Use at least 8 characters, with uppercase, lowercase, number, and symbol." });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `Insert into users (username, password, email) values ($1, $2, $3) returning *`,
            [username, hashedPassword, email]
        );

        req.session.user_id = result.rows[0].user_id;
        return res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

app.post('/forgot-password/reset', async (req, res) => {
    const { username, password } = req.body;
    if (!isStrongPassword(password)) {
        return res.status(400).json({ error: "Weak password. Use at least 8 characters, with uppercase, lowercase, number, and symbol." });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `Update users set password = $1 where username = $2 returning *`,
            [hashedPassword, username]
        );

        return res.status(201).json({ success: true, user_id: result.rows[0].user_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

function isAuthenticated(req, res, next) {
    if(req.session.user_id) {
        next();
    }
    else {
        res.status(401).json({ error: "Unauthorized"});
    }
}

const otpGenerator = () => { return Math.floor(100000 + Math.random() * 900000) }

const transporter = nodemailer.createTransport(
    {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }
)

async function sendOtp(email, otp) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
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

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await db.query(
            `insert into users_otp (email, otp, expires_at)
            values ($1, $2, $3)
            on conflict (email) do update
            set otp = $2, expires_at = $3`,
            [email, otp, expiresAt]
        );

        await sendOtp(email, otp);

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    }
    catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
});

app.post('/forgot-password/send-otp', async (req, res) => {
    const { username, email } = req.body;
    try {
        const checkUser = await db.query('select * from users where username = $1', [username]);
        if (checkUser.rows.length === 0) {
            return res.status(400).json({ error: "Username does not exist" });
        }

        if (email !== checkUser.rows[0].email) {
            return res.status(400).json({ error: "Invalid email id" });
        }

        const otp = otpGenerator();

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await db.query(
            `insert into users_otp (email, otp, expires_at)
            values ($1, $2, $3)
            on conflict (email) do update
            set otp = $2, expires_at = $3`,
            [email, otp, expiresAt]
        );

        sendOtp(email, otp);

        res.status(200).json({ success: true, message: 'OTP sent successfully', email });
    }
    catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
})

app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const result = await db.query('select * from users_otp where email = $1', [email]);
        const otpEntry = result.rows[0];

        if (!otpEntry || otpEntry.otp !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid OTP' });
        }
        if(new Date() > new Date(otpEntry.expires_at)) {
            return res.status(400).json({ success: false, error: 'OTP Expired' });
        }

        return res.status(200).json({ success: true, message: 'OTP verified' });
    }
    catch (err) {
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
        req.session.user_id = user.user_id;
        return res.status(200).json({ success: true, user_id: user.user_id });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({ error: 'Failed to Logout'});
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ success: true, message: 'Logged out Successfully' });
    });
});

app.get('/', (req, res) => {
    if(req.session.user_id)
        return res.redirect('/home.html');
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/api/tasks', isAuthenticated, async (req, res) => {
    const user_id = req.session.user_id;
    const {
        filter = "all",
        search = "",
        sortField = "completed",
        sortOrder = "asc"
    } = req.query;

    const validSortFields = ["title", "due_date", "completed"];
    const validSortOrder = ["asc", "desc"];

    const field = validSortFields.includes(sortField) ? sortField : "completed";
    const order = validSortOrder.includes(sortOrder) ? sortOrder : "asc";

    try {
        let query = `select * from tasks where user_id = $1`;
        const values = [user_id];
        let count = 2;

        if (filter === "completed") {
            query += ` and completed = true`;
        } else if (filter === "pending") {
            query += ` and completed = false`;
        }

        if (search) {
            query += ` and lower(title) like $${count}`;
            values.push(`%${search.toLowerCase()}%`);
            count++;
        }

        query += ` order by ${field} ${order}`;

        const result = await db.query(query, values);
        return res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

app.post('/api/tasks', isAuthenticated, async (req, res) => {
    const { title, description, dueDate } = req.body;
    const user_id = req.session.user_id;
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


app.patch('/api/tasks/:id', isAuthenticated, async (req, res) => {
    const id = req.params.id;
    const { completed } = req.body;
    const user_id = req.session.user_id;

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


app.put('/api/tasks/:id', isAuthenticated, async (req, res) => {
    const id = req.params.id;
    const { title, description, dueDate } = req.body;
    const user_id = req.session.user_id;
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

app.delete('/api/tasks/:id', isAuthenticated, async (req, res) => {
    const id = req.params.id;
    const user_id = req.session.user_id;
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