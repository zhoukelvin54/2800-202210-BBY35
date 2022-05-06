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

app.use("/", express.static("./login.html"));

app.get('/', function (req, res) {


    // Let's build the DB if it doesn't exist
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dh_petpal',
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

    let doc = fs.readFileSync('./login.html', "utf8");
    res.send(doc);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/add-account', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  //console.log("Name", req.body.username);
  //console.log("Email", req.body.email);

  let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_petpal'
  });
  connection.connect();
  // TO PREVENT SQL INJECTION, DO THIS:
  // (FROM https://www.npmjs.com/package/mysql#escaping-query-values)
  connection.query('INSERT INTO accounts (username, firstname, lastname, email, password, is_admin, is_caretaker)' 
  + 'values (?, ?, ?, ?, ?, 0, 0)',
        [req.body.username, req.body.firstname, req.body.lastname, 
          req.body.email, req.body.password, req.body.is_admin, req.body.is_caretaker],
        function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    //console.log('Rows returned are: ', results);
    res.send({ status: "success", msg: "Record added." });

  });
  connection.end();

});

// POST: we are changing stuff on the server!!!
/*
app.post('/delete-all-customers', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
  });
  connection.connect();
  // NOT WISE TO DO, BUT JUST SHOWING YOU CAN
  connection.query('DELETE FROM customer',
        function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    //console.log('Rows returned are: ', results);
    res.send({ status: "success", msg: "Recorded all deleted." });

  });
  connection.end();

});
*/

// ANOTHER POST: we are changing stuff on the server!!!
/*
app.post('/update-customer', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_petpals'
  });
  connection.connect();
console.log("update values", req.body.email, req.body.username)
  connection.query('UPDATE customer SET email = ? WHERE ID = ?',
        [req.body.email, req.body.id],
        function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    //console.log('Rows returned are: ', results);
    res.send({ status: "success", msg: "Recorded updated." });

  });
  connection.end();

});
*/

let port = 8000;
app.listen(port, function () {
  console.log('CRUD app listening on port ' + port + '!');
})