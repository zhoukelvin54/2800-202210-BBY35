const express = require("express");
const session = require("express-session");
const filesys = require("fs");
const jsdom = require("jsdom");

// Oh look, unsecured data that will be moved to an .env at some point in future
// and no; we probably won't use this exact data again.
const dbConnection = {
    host: "localhost",
    user: "nodeapp",
    password: "",
    database: "db_petpals",
    port: 3306
};
const mysql2 = require("mysql2");
const connection = mysql2.createConnection(dbConnection);
connection.connect((err) => {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    };

    console.log("connected successfully");
});


const http = require("http");
const https = require("https");
// tiny-editor requires that there be a document object from HTML; 
// as there is no HTML element just yet, it is safe to comment out
// const tinyeditor = require("tiny-editor"); 
const sanitize = require("sanitize-html");
const multer = require("multer");

const app = express();

// initializing sessions
let sessionObj = {
    secret: "Hey, another password that will be obscured eventually. Neat!",
    name: "petpalsID",
    resave: false,
    saveUninitialized: true
};

app.use(session(sessionObj));

// initializing directory paths
app.use("/common", express.static("./root/common"));
app.use("/css", express.static("./root/css"));
app.use("/font", express.static("./root/font"));
app.use("/img", express.static("./root/img"));
app.use("/js", express.static("./root/js"));
app.use("/scss", express.static("./root/scss"));

app.get("/", (req, res) => {
    res.redirect("/home");
});

app.get("/home", (req, res) => {
    if (!(req.session.loggedIn)) {
        res.redirect("/login");
    } else {
        let doc = filesys.readFileSync("./root/index.html", "utf-8");
        res.send(doc);
    }
});

app.get("/login", (req, res) => {
    let doc = filesys.readFileSync("./root/login.html", "utf-8");
    res.send(doc);
});

app.post("/login", (req, res) => {
    res.setHeader("content-type", "application/json");
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], (err, data, fields) => {
            if (err) throw err;
            if (data.length > 0) {
                req.session.loggedIn = true;
                req.session.username = data[0].username;
                req.session.name = data[0].firstname + " " + data[0].lastname;
                req.session.username = data[0].username;
                req.session.userid = data[0].id;
                req.session.admin = data[0].is_admin;
                req.session.caretaker = data[0].is_caretaker;
                req.session.save((e) => {
                    if (e) {
                        console.log("Error: " +e);
                    }
                });
                res.send({status: "success", msg: "Log In Successful"});
            } else {
                res.send({status: "failure", msg: "Log In Unsuccessful"});
            }
        });
    }
});

console.log("Starting Server...");

const port = 8001;
function onBoot() {
    console.log("Started on port: " + port);
};


app.listen(port, onBoot);