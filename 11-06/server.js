
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

const data_file = 'task.json'

function getContentType(ext) {
    switch (ext) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'text/javascript';
        case '.json':
            return 'application/json';
        default:
            return 'application/octet-stream';
    }
}

async function readTask() {
    try {
        const data = await fs.readFile(data_file);
        return JSON.parse(data);
    }
    catch (err) {
        return [];
    }
}

async function writeTask(tasks) {
    await fs.writeFile(data_file, JSON.stringify(tasks, null, 4));
}

let server = http.createServer(async (req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    if (req.method === "GET" && pathname === "/api/tasks") {
        const tasks = await readTask();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tasks));
        return;
    }

    if (req.method === "POST" && pathname === "/api/tasks") {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            try {
                const { title, description, dueDate } = JSON.parse(body);
                if (!title) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Title is required!" }));
                    return;
                }

                const tasks = await readTask();

                if (tasks.some(x => x.title.toLowerCase() === title.toLowerCase())) {
                    res.writeHead(409, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Task with this title already exists." }));
                    return;
                }

                const newTask = {
                    title,
                    description,
                    dueDate,
                    completed: false
                }

                tasks.push(newTask);
                await writeTask(tasks);

                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Task added successfully" }));

            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid data" }));
            }
        });

        return;
    }


    let filename = "." + (pathname === '/' ? '/todo.html' : pathname);
    let extention = path.extname(filename);
    let contentType = getContentType(extention);

    try {
        const data = await fs.readFile(filename);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    }
    catch (err) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>Error 404: Page not found</h1>");
    }

    // res.writeHead(200, {"Content-Type":"text/html"})
    // res.write("Welcome home Puppy ma");
    // res.end();

});

server.listen(8080, () => {
    console.log("http://localhost:8080/");
})