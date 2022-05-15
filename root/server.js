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

const is_Heroku = process.env.is_Heroku || false;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./root/img/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.split("/").pop().trim());
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
const { connect } = require("http2");


if(is_Heroku) {
    var connection = mysql2.createPool(process.env.JAWSDB_MARIA_URL);
} else {
    var connection = mysql2.createPool(dbConnection);
}


connection.getConnection((err) => {
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

// Set up file structure routing
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
                res.send({ status: "failure", msg: "Username or email already taken!" });
            } else {
                connection.query("INSERT INTO BBY35_accounts (username, firstname, lastname, email, password, is_caretaker)" +
                    "values (?, ?, ?, ?, ?, ?)",
                    [req.body.username, req.body.firstname, req.body.lastname,
                    req.body.email, req.body.password, req.body.account_type],
                    (error, results, fields) => {
                        if (error) {
                            res.send({ status: "failure", msg: "Internal Server Error" });
                        } else {
                            req.session.newAccount = true;
                            res.send({ status: "success", msg: "Record added." });
                         }
                    });
            }
        });
});

//KELVIN's BUGGY CODE BELOW
app.put("/update-profile", (req, res) => {
    res.setHeader("Content-Type", "application/json");    
    console.log(req.body);

    let expectedFields = ["firstname" , "lastname", "email", "password", "profile_photo_url", "telephone", "address"];
    let recievedFields = [];
    let actualFields = [];
    let query = "UPDATE BBY35_accounts SET ";
    let loops = 0; 

    for (let prop in req.body) {
        loops += 1;
        if (expectedFields.includes(prop)) {
            if(Object.keys(req.body).length == loops) {
                query += prop + " = ? "
                actualFields.push(req.body[prop]);
                recievedFields.push(prop);
            } else {
            query += prop + " = ?, ";
            actualFields.push(req.body[prop]);
            recievedFields.push(prop);
            }   
        }
    }

    query += "WHERE id = ?";

    actualFields.push(req.session.userid);

    console.log(actualFields);

    connection.query(query, 
        actualFields,
        (error,results,fields) => {
            if(error) {
                res.send({status: "failure", msg: "Internal Server Error" });
            } else {
                res.send({status: "success", msg: "Profile updated."});
            }        
    });   

});

app.put("/update-pet", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if(req.session.caretaker) {
        res.send({status: "failure", msg: "Current user is a caretake!"});
    }
    console.log(req.body);
    let expectedFields = ["name", "gender", "species", "description", "photo_url"];
    let recievedFields = [];
    let actualFields = [req.session.userid];
    let query = "INSERT INTO `BBY35_pets` (`owner_id`,`";

    let firstProp = true;
    for (let prop in req.body) {
        if (expectedFields.includes(prop)) {
            if (!firstProp) query += ", `";
            else firstProp = false;

            query += prop + "`";
            actualFields.push(req.body[prop]);
            recievedFields.push(prop);
        }
    }

    query += ") VALUES (?";
    for (let i = 0; i < recievedFields.length; i++) query += ",?";
    query += ") ON DUPLICATE KEY UPDATE ";

    for (let i = 0; i < recievedFields.length; i++) {
        query += recievedFields[i] +"=VALUES(" + recievedFields[i] + ")";
        if (i == recievedFields.length - 1) {
            query += ";";
        } else {
            query += ",";
        }
    }

    connection.query(query, actualFields, (error,results,fields) => {
        if(error) {
            res.send({status: "failure", msg: "Internal Server Error" });
        } else {
            res.send({status: "success", msg: "Pet details updated."});
        }        
    });
})

app.put("/update-caretaker-info",  (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if(!req.session.caretaker) {
        res.send({status: "failure", msg: "Current user is not a caretaker!"});
    }
    console.log(req.body);
    let expectedFields = ["animal_affection", "experience", "allergies", "other_pets", "busy_hours", "house_type", "house_active_level", "people_in_home", "children_in_home", "yard_type"];
    let recievedFields = [];
    let actualFields = [req.session.userid];
    let query = "INSERT INTO `BBY35_caretaker_info` (`account_id`, `";

    let firstProp = true;
    for (let prop in req.body) {
        if (expectedFields.includes(prop)) {
            if (!firstProp) query += ", `";
            else firstProp = false;

            query += prop + "`";
            actualFields.push(req.body[prop]);
            recievedFields.push(prop);
        }
    }

    query += ") VALUES (?";
    for (let i = 0; i < recievedFields.length; i++) query += ",?";
    query += ") ON DUPLICATE KEY UPDATE ";

    for (let i = 0; i < recievedFields.length; i++) {
        query += recievedFields[i] +"=VALUES(" + recievedFields[i] + ")";
        if (i == recievedFields.length - 1) {
            query += ";";
        } else {
            query += ",";
        }
    }

    connection.query(query, actualFields, (error,results,fields) => {
        if(error) {
            res.send({status: "failure", msg: "Internal Server Error" });
        } else {
            res.send({status: "success", msg: "Caretaker information updated."});
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
        res.redirect("/sign-up");
    } else {
        let doc = getUserView(req);
        res.send(doc);
    }
});

function getUserView(req) {
    if (req.session.admin) {
        return fs.readFileSync("./root/user_management.html", "utf-8");
    } else {
        // TODO Get individual account view
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
                req.session.name = data[0].firstname + "," + data[0].lastname;
                req.session.username = data[0].username;
                req.session.email = data[0].email;
                req.session.userid = data[0].id;
                req.session.admin = data[0].is_admin;
                req.session.caretaker = data[0].is_caretaker;
                req.session.profile_photo_url = data[0].profile_photo_url;
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

app.get("/sign-up", (req, res) => {
    // To be replaced later by injecting the forms as a modal and their scripts
    req.session.newAccount = false;
    if (req.session.caretaker) {
        res.send(fs.readFileSync("./root/caretaker_form.html", "utf-8"));
    } else {
        res.send(fs.readFileSync("./root/pet_details_form.html", "utf-8"));
    }
});

app.put("/sign-up", (req, res) => {
    console.log(req.body);
    
    if (req.session.caretaker) {
        // Handle caretaker req.body
    } else {
        // Handle pet owner req.body
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

app.get("/profile", (req, res) => {
    if (!(req.session && req.session.loggedIn)) return res.redirect("/login");

    let doc = fs.readFileSync("./root/profile.html", "utf-8");
    let pageDOM = new jsdom.JSDOM(doc);
    let pageDocument = pageDOM.window.document;
    let first_last_name = req.session.name.split(',');

    pageDocument.getElementById("profile_picture").style = `background-image: url(/img/uploads/${req.session.profile_photo_url});`;
    pageDocument.getElementById("username").textContent = req.session.username;
    pageDocument.getElementById("first_name").textContent = first_last_name[0];
    pageDocument.getElementById("last_name").textContent = first_last_name[1];
    pageDocument.getElementById("email").textContent = req.session.email;

    res.send(pageDOM.serialize());
});

app.get("/userData", (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.session.admin) {
        connection.query("SELECT id, username, firstname, lastname, email, is_admin, is_caretaker FROM BBY35_accounts", (err, data, fields) => {
            res.send(data);
        });
    } else {
        res.send({ status: "failure", msg: "Unauthorized!" });
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

app.delete("/delete", async (req, res) => {
    let requesterID = req.session.userid;
    let isRequesterAdmin = req.session.admin;
    let accountID  = req.body.id;
    
    let targetName;
    let isTargetAdmin;
    let adminCount;
    
    async function getTargetInfo(id) {
        await connection.promise()
        .query("SELECT username, is_admin FROM BBY35_accounts WHERE id = ?", [id])
        .then((data) => {
            targetName = data[0][0].username;
            isTargetAdmin = data[0][0].is_admin;
        });
    }

    async function getAdminCount() {
        await connection.promise()
        .query("SELECT id FROM BBY35_accounts WHERE is_admin = 1")
        .then((data) => {
            adminCount = data[0].length;
        });
    }

    await getTargetInfo(accountID);
    await getAdminCount();

    let userSelfDelete = (!isRequesterAdmin && (accountID == requesterID));
    let areRequesterAndTargetAdmins = (isTargetAdmin && isRequesterAdmin);
    let adminOnAdminDelete = (areRequesterAndTargetAdmins && (adminCount >= 2));
    let adminOnUserDelete = (!isTargetAdmin && isRequesterAdmin);
    let adminDelete =  (adminOnAdminDelete || adminOnUserDelete);
    let allowDelete = (userSelfDelete || adminDelete);

    if (allowDelete) {
        connection.query('UPDATE BBY35_accounts SET username = NULL, password = NULL, firstname = "DELETED", lastname = "USER", is_admin = 0  WHERE id = ?', [accountID], async () => {
            await getAdminCount();
            if (adminOnAdminDelete) {
                res.send({ status: "success", msg: `Removed user: ${targetName}; Remaining admins: ${adminCount}`});
            } else if (userSelfDelete) {
                res.send({ status: "success", msg: `Your account has been removed.`});
            } else {
                res.send({ status: "success", msg: `Removed user: ${targetName}`});
            }
        });
    } else {
        res.send({status: "failure", msg: `Could not remove user ${targetName}` });
    }
});

app.put("/grant", async (req, res) => {
    let isRequesterAdmin = req.session.admin;
    let accountID  = req.body.id;

    let targetName;
    let isTargetAdmin;

    async function getTargetInfo(id) {
        await connection.promise()
        .query("SELECT username, is_admin FROM BBY35_accounts WHERE id = ?", [id])
        .then((data) => {
            targetName = data[0][0].username;
            isTargetAdmin = data[0][0].is_admin;
        });
    }

    await getTargetInfo(accountID);

    if (isRequesterAdmin && !isTargetAdmin) {
        connection.query('UPDATE BBY35_accounts SET is_admin = 1 WHERE id = ?', [accountID], async () => {
            res.send({status: "success", msg: `User ${targetName} was granted admin privileges`})
        });
    } else {
        res.send({status: "failure", msg: `User ${targetName} could not be granted admin privileges`});
    }
});

app.put("/revoke", async (req, res) => {
    let requesterID = req.session.userid;
    let isRequesterAdmin = req.session.admin;
    let accountID  = req.body.id;
    
    let targetName;
    let isTargetAdmin;
    let adminCount;
    
    async function getTargetInfo(id) {
        await connection.promise()
        .query("SELECT username, is_admin FROM BBY35_accounts WHERE id = ?", [id])
        .then((data) => {
            targetName = data[0][0].username;
            isTargetAdmin = data[0][0].is_admin;
        });
    }

    async function getAdminCount() {
        await connection.promise()
        .query("SELECT id FROM BBY35_accounts WHERE is_admin = 1")
        .then((data) => {
            adminCount = data[0].length;
        });
    }

    await getTargetInfo(accountID);
    await getAdminCount();

    let isSelfRevoke = (requesterID == accountID);
    let areRequesterAndTargetAdmins = (isTargetAdmin && isRequesterAdmin);
    let allowRevoke = (!isSelfRevoke && areRequesterAndTargetAdmins && (adminCount >= 2));

    if (allowRevoke) {
        connection.query('UPDATE BBY35_accounts SET is_admin = 0  WHERE id = ?', [accountID], async () => {
            await getAdminCount();
            res.send({ status: "success", msg: `Revoked admin: ${targetName}; Remaining admins: ${adminCount}`});
        });
    } else {
        res.send({status: "failure", msg: `Could not revoke admin ${targetName}` });
    }
});

console.log("Starting Server...");

if(is_Heroku) {
    var port = process.env.PORT;
} else {
    var port = 8000;
}

function onBoot() {
    console.log("Started on port: " + port);
}

app.listen(port, onBoot);