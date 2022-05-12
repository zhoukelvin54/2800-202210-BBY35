// used for validating the code with https://jshint.com/
/* jshint esversion: 6 */
/* jshint node: true */

"use strict";

// Constants
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const jsdom = require("jsdom");
const http = require("http");
const https = require("https");
// tiny-editor requires that there be a document object from HTML; 
// as there is no HTML element just yet, it is safe to comment out
// const tinyeditor = require("tiny-editor"); 
const sanitize = require("sanitize-html");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./root/img/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.split("/").pop().trim())
    }
});
const upload = multer({ storage: storage });

const app = express();

const dbConnection = {
    host: "localhost",
    user: "nodeapp",
    password: "",
    database: "COMP2800",
    port: 3306
};

const mysql2 = require("mysql2");

console.log(process.env.JAWSDB_MARIA_URL);

if(process.env.JAWSDB_MARIA_URL) {
    var connection = mysql2.createConnection(process.env.JAWSDB_MARIA_URL);
} else {
    var connection = mysql2.createConnection(dbConnection);
}


connection.connect((err) => {
    if (err) {
        console.error("Error connecting to database: " + err.stack);
        return;
    }

    console.log("Database connected successfully.");
});

// initializing sessions
let sessionObj = {
    secret: "Hey, another password that will be obscured eventually. Neat!",
    name: "petpalsID",
    resave: false,
    saveUninitialized: true
};

app.use(bodyParser.json());
app.use(session(sessionObj));

app.use("/common", express.static("./root/common"));
app.use("/css", express.static("./root/css"));
app.use("/img", express.static("./root/img"));
app.use("/font", express.static("./root/font"));
app.use("/js", express.static("./root/js/clientside"));
app.use("/scss", express.static("./root/scss"));

app.post("/add-account", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    console.log(req.body);

    // TODO Figure out simplified SQL to insert if not exists.
    connection.query("SELECT username FROM BBY35_accounts WHERE username = ? UNION ALL SELECT username FROM BBY35_accounts WHERE email = ?", [req.body.username, req.body.email],
        (error, results, fields) => {
            if (error) {
                res.send({ status: "failure", msg: "Internal Server Error" });
            } else if (results.length > 0) {
                res.send({ status: "failure", msg: "Username or email already taken!" })
            } else {
                connection.query("INSERT INTO BBY35_accounts (username, firstname, lastname, email, password, is_caretaker)"
                    + "values (?, ?, ?, ?, ?, ?)",
                    [req.body.username, req.body.firstname, req.body.lastname,
                    req.body.email, req.body.password, req.body.account_type],
                    (error, results, fields) => {
                        if (error) {
                            res.send({ status: "failure", msg: "Internal Server Error" });
                        } else {
                            res.send({ status: "success", msg: "Record added." });
                        }
                    });
            }
        });
});

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/home", (req, res) => {
    if (!(req.session.loggedIn)) {
        res.redirect("/login");
    } else if (req.session.newAccount) {
        if (req.session.caretaker){
            res.send(fs.readFileSync("./root/caretaker_form.html", "utf-8"));
        } else {
            res.send(fs.readFileSync("./root/pet_details_form.html", "utf-8"));
        }
    } else {
        let doc = getUserView(req);
        res.send(doc);
    }
});

function getUserView(req) {
    if (req.session.admin) {
        return fs.readFileSync("./root/user_management.html", "utf-8");
    } else {
        let doc = fs.readFileSync("./root/index.html", "utf-8");
        let pageDOM = new jsdom.JSDOM(doc);
        let user = req.session.username;
        pageDOM.window.document.getElementById("username").innerHTML = user;
        
        return pageDOM.serialize();
    }
}

app.get("/login", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/home");
    } else {
        let doc = fs.readFileSync("./root/login.html", "utf-8");
        res.send(doc);
    }
});

app.post("/login", (req, res) => {
    res.setHeader("content-type", "application/json");
    
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        connection.query("SELECT * FROM BBY35_accounts WHERE username = ? AND password = ?", [username, password], (err, data, fields) => {
            if (err) throw err;
            if (data.length > 0) {
                req.session.loggedIn = true;
                req.session.username = data[0].username;
                req.session.name = data[0].firstname + " " + data[0].lastname;
                req.session.username = data[0].username;
                req.session.userid = data[0].id;
                req.session.admin = data[0].is_admin;
                req.session.caretaker = data[0].is_caretaker;
                req.session.newAccount = req.body.new_account;
                req.session.save((e) => {
                    if (e) {
                        console.log("Error: " + e);
                    }
                });
                res.send({ status: "success", msg: "Log In Successful" });
            } else {
                res.send({ status: "failure", msg: "Log In Unsuccessful" });
            }
        });
    }
});

app.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                res.status(400).send("Unable to log out");
            } else {
                // session deleted, redirect to home
                res.redirect("/");
            }
        });
    }
});

app.get("/userData", (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.session.admin) {
        connection.query("SELECT username, firstname, lastname, email, is_admin, is_caretaker FROM BBY35_accounts", (err, data, fields) => {
            res.send(data);
        });
    } else {
        res.send({ status: "failure", msg: "User not logged in!" });
    }
});

app.get("/petData", (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.session.caretaker == 0) {
        connection.query('SELECT id, caretaker_id, photo_url, name, species, gender, description FROM BBY35_pets WHERE owner_id = ?', [req.session.userid], (err, data, fields) => {
            res.send(data);
        });
    } else {
        res.send({ status: "failure", msg: "User not logged in!" });
    }
});

// this route is for testing and example purposes only and should be cleaned up once the forms requiring image upload are completed
app.get("/addPhoto", (req, res) => {
    let doc = fs.readFileSync("./root/addphoto.html", "utf-8");
    res.send(doc);
});

app.post("/addPhoto", upload.single("picture"), (req, res) => {
    console.log(req.file);
    res.statusCode = 201;
    res.send( {url: req.file.filename} );
});

console.log("Starting Server...");

if(process.env.PORT) {
    const port = process.env.PORT;
} else {
    const port = 8000;
}

function onBoot() {
    console.log("Started on port: " + port);
}

app.listen(port, onBoot);