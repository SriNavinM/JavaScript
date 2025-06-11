
const http = require('http');
let url = require('url');
let fs = require('fs');


http.createServer(function (req, res) {
    let q = url.parse(req.url, true);
    let filename = "." + q.pathname;
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/html" })
            res.write("Error 404: Page not found")
            res.end();
        }
        else {
            res.writeHead(200, { "Content-Type": "text/html" })
            res.write(data);
            res.end();
        }
    })

    // res.writeHead(200, {"Content-Type":"text/html"})
    // res.write("Welcome home Puppy ma");
    // res.end();

}).listen(8080)