var express = require('express')
var app = express();
var http = require("http").createServer(app)
var mysql = require('mysql')
var bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'))
app.use(function (request, result, next) {
    result.setHeader("Access-Control-Allow-Origin", "*")
    next()
})
app.use(express.static(__dirname + '/public'))

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '****',
    database: 'task'
})

connection.connect(function (err) {
    if (!err) {
        console.log("database connected successfully")
    }
})

var io = require("socket.io")(http);

io.on("connection", function (socket) {
    console.log("User connected", socket.id);
    socket.on("new_chat", function (data) {
        console.log(data)
        console.log("client says" + data);
        io.emit("new_chat", data)

        var query = "INSERT INTO messages(message) VALUES('" + data + "')"
        console.log(query)
        connection.query(query, function (err, rows, fields) {
            if (!err) {
                console.log("Pushed")
            }
            else
                console.log('Error while performing Query.');
        });
    })
})

app.get("/get_message", function (request, result) {

    var query1 = "select * from messages"
    console.log(query1)
    connection.query(query1, function (err, rows, fields) {
        if (!err) {
            console.log("data received")
            console.log(Object.values(JSON.parse(JSON.stringify(rows))))
            result.send(Object.values(JSON.parse(JSON.stringify(rows))))
        }
        else
            console.log('Error while performing Query.');
    });
})

app.post("/chat", function (req, result) {

    console.log(req.body)
    var UsertableQuery = "INSERT INTO usertable(UserName, Password) VALUES('" + req.body.username + "'," + "'" + req.body.password + "')"

    connection.query(UsertableQuery, function (err, rows, fields) {

        if (!err) {
            console.log("Pushed")
            result.render("index", {})
        }
        else
            console.log('Error while performing Query.');
    });

})

app.get("/", function (req, result) {
    result.render("login", {})
})


var port = 3000;
http.listen(port, function () {
    console.log("serer running" + port);
})