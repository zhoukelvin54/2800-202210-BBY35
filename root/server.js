const express = require("express");
const session = require("express-session");
const filesys = require("fs");
const jsdom = require("jsdom");
const mysql2 = require("mysql2");
const http = require("http");
const https = require("https");
// tiny-editor requires that there be a document object from HTML; 
// as there is no HTML element just yet, it is safe to comment out
// const tinyeditor = require("tiny-editor"); 
const sanitize = require("sanitize-html");
const multer = require("multer");

const app = express();

// initializing directory paths
app.use("/common", express.static("./root/common"));
app.use("/css", express.static("./root/css"));
app.use("/font", express.static("./root/font"));
app.use("/img", express.static("./root/img"));
app.use("/js", express.static("./root/js"));
app.use("/scss", express.static("./root/scss"));

app.get("/home", (req, res) => {
    let doc = filesys.readFileSync("./root/index.html", "utf-8");
    res.send(doc);
})

// this only serves the login page, it doesn't actually interact with the backend
app.get("/login", (req, res) => {
    let doc = filesys.readFileSync("./root/login.html", "utf-8");
    res.send(doc);
})

console.log("Starting Server...");

const port = 8001;
function onBoot() {
    console.log("Started on port: " + port);
}


app.listen(port, onBoot);