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

app.get('/', function (req, res) {


    // Let's build the DB if it doesn't exist
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    const createDBAndTables = `CREATE DATABASE IF NOT EXISTS db_petpals;
        use db_petpals;
        CREATE TABLE IF NOT EXISTS accounts (
            id int NOT NULL AUTO_INCREMENT,
            username varchar(20) NOT NULL,
            firstname varchar(45) DEFAULT NULL,
            lastname varchar(45) DEFAULT NULL,
            email varchar(50) NOT NULL,
            password varchar(20) NOT NULL,
            is_admin tinyint NOT NULL DEFAULT '0',
            is_caretaker tinyint NOT NULL DEFAULT '0',
            PRIMARY KEY (id);`;

    connection.connect();
    connection.query(createDBAndTables, function (error, results, fields) {
      if (error) {
          console.log(error);
      }
      console.log(results);

    });
    connection.end();

    let doc = fs.readFileSync('./index.html', "utf8");
    res.send(doc);
});