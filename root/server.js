// used for validating the code with https://jshint.com/
/* jshint esversion: 6 */
/* jshint node: true */

"use strict";

// miscellanous code snippets that can be useful
// function extractDateFromFileName(string) {
//     let indexOfStart= (string.lastIndexOf("-")) + 1;
//     let indexOfEnd = string.lastIndexOf(".");

//     let out = parseInt(string.substring(indexOfStart, indexOfEnd));

//     console.log(out);
//     return new Date(out);
// }

// Constant Variables
const SALT_ROUNDS = 10;

// App import statements
import * as helpers from "./js/serverside/helpers.js";
import * as mysql2 from "mysql2";
import express from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import { JSDOM } from "jsdom";
import bodyParser from "body-parser";
import fs from "fs";
import { readFile } from "fs/promises";
import multer from "multer";
import sanitizeHtml from "sanitize-html";

// sanitize HTML document
function clean(dirty) {
    return sanitizeHtml(dirty, {
        allowedTags: false,
        allowedAttributes: false
    });
}

// Unused, to be implemented requires constants
// const http = require("http");
// Used for Secure HTTP connection
// const https = require("https");
// tiny-editor requires that there be a document object from HTML; 
// as there is no HTML element just yet, it is safe to comment out
// const tinyeditor = require("tiny-editor");
// HTTP2 used for faster client connections via multiplexing
// const { connect } = require("http2");

const is_Heroku = process.env.is_Heroku || false;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let id = req.session.userid;
        let dir = `./root/img/uploads/${id}/`;
        fs.mkdir(dir, (exists) => {
            if (!exists) {
                console.log("Path does not exist, creating: " + dir);
            }
        });

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        let id = req.session.userid;
        
        let input = file.originalname;
        let extensionIndex = input.lastIndexOf(".");
        let extension = input.substring(extensionIndex);

        let fileString = `UserID-${id}-UploadedAt-${Date.now()}${extension}` 
        
        cb(null, fileString);
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

if (is_Heroku) {
    var connection = mysql2.createPool(process.env.JAWSDB_MARIA_URL);
} else {
    var connection = mysql2.createPool(dbConnection);
}
var promiseConnection = connection.promise();


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
        async (error, results, fields) => {
            if (error) {
                res.send({ status: "failure", msg: "Internal Server Error" });
            } else if (results.length > 0) {
                res.send({ status: "failure", msg: "Username or email already taken!" });
            } else {
                connection.query("INSERT INTO BBY35_accounts (username, firstname, lastname, email, password, is_caretaker)" +
                    "values (?, ?, ?, ?, ?, ?)",
                    [req.body.username, req.body.firstname, req.body.lastname,
                    req.body.email, await bcrypt.hash(req.body.password, SALT_ROUNDS), req.body.account_type],
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

app.get("/get-profile", (req, res) => {
    res.setHeader("Content-type", "application/json");
    let actualFields = [req.session.userid];
    let query = "SELECT username, firstname, lastname, email, profile_photo_url"
        
    query += " FROM BBY35_accounts WHERE id = ?"
    
    connection.query(query, actualFields, (error, results, fields) => {
        if (error) {
            res.send({status: "failure", msg: "Server error"})
        } else {
            res.send({status: "success", information: results})
        }
    })
}) 

//KELVIN's BUGGY CODE BELOW
app.put("/update-profile", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    console.log(req.body);

    let username = (req.body.username) ? req.body.username : "";
    let email = (req.body.email) ? req.body.email : "";
    connection.query("SELECT BBY35_accounts.`username` FROM BBY35_accounts WHERE BBY35_accounts.`username` = ? UNION " +
        "SELECT BBY35_accounts.`email` FROM BBY35_accounts WHERE BBY35_accounts.`email` = ?;",
        [username, email],
        (error, results, fields) => {
            if (results.length > 0) {
                res.status(409).send({ status: "failure", msg: "Username or email already taken!" });
            } else {
                let expectedFields = ["firstname", "lastname", "email", "username", "password", "profile_photo_url", "telephone", "address"];
                let recievedFields = [];
                let actualFields = [];
                let query = "UPDATE BBY35_accounts SET ";
                let loops = 0;

                for (let prop in req.body) {
                    loops += 1;
                    if (expectedFields.includes(prop)) {
                        if (Object.keys(req.body).length == loops) {
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

                connection.query(query, actualFields, (error, results, fields) => {
                    if (error) {
                        res.send({ status: "failure", msg: "Internal Server Error" });
                    } else {
                        res.send({ status: "success", msg: "Profile updated." });
                    }
                });
            }
        }
    );

});

app.put("/update-pet", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.session.caretaker) {
        res.send({ status: "failure", msg: "Current user is a caretake!" });
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
        query += recievedFields[i] + "=VALUES(" + recievedFields[i] + ")";
        if (i == recievedFields.length - 1) {
            query += ";";
        } else {
            query += ",";
        }
    }

    connection.query(query, actualFields, (error, results, fields) => {
        if (error) {
            res.send({ status: "failure", msg: "Internal Server Error" });
        } else {
            res.send({ status: "success", msg: "Pet details updated." });
        }
    });
})

app.put("/update-caretaker-info", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (!req.session.caretaker) {
        res.send({ status: "failure", msg: "Current user is not a caretaker!" });
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
        query += recievedFields[i] + "=VALUES(" + recievedFields[i] + ")";
        if (i == recievedFields.length - 1) {
            query += ";";
        } else {
            query += ",";
        }
    }

    connection.query(query, actualFields, (error, results, fields) => {
        if (error) {
            res.send({ status: "failure", msg: "Internal Server Error" });
        } else {
            res.send({ status: "success", msg: "Caretaker information updated." });
        }
    });
});

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/home", async (req, res) => {
    if (!(req.session.loggedIn)) {
        res.redirect("/login");
    } else if (req.session.newAccount) {
        res.redirect("/sign-up");
    } else {
        let doc = await getUserView(req);
        res.send(doc);
    }
});

async function getUserView(req) {
    if (req.session.admin) {
        let doc = fs.readFileSync("./root/user_management.html", "utf-8");
        let pageDOM = new JSDOM(doc);

        // header & footer
        let link = pageDOM.window.document.createElement("link");
        link.setAttribute("rel","stylesheet");
        link.setAttribute("href", "css/main.css");
        pageDOM.window.document.head.appendChild(link);
        pageDOM = await helpers.injectHeaderFooter(pageDOM);
        return pageDOM.serialize();
    } else {
        // TODO Get individual account view
        let doc = fs.readFileSync("./root/index.html", "utf-8");
        let pageDOM = new JSDOM(doc);
        let user = req.session.username;
        pageDOM.window.document.getElementById("username").innerHTML = user;
        let role;
        let description;
        if (req.session.caretaker == 1) {
            role = "caretaker";
            description = "Here you will see your pets and can request a caretaker to look after them. <br> At the bottom you can see a list of other's pets that currently need caretakers to look after them"
            pageDOM.window.document.getElementById("caretaker-panel").hidden = false;
        } else {
            role = "pet owner";
            description = "Here you will see your pets and can request a caretaker to look after them";
        }

        pageDOM.window.document.getElementById("role").innerHTML = role;
        pageDOM.window.document.getElementById("role-desc").innerHTML = description;

        // header & footer
        let link = pageDOM.window.document.createElement("link");
        link.setAttribute("rel","stylesheet");
        link.setAttribute("href", "css/main.css");
        pageDOM.window.document.head.appendChild(link);
        pageDOM = await helpers.injectHeaderFooter(pageDOM);
        return pageDOM.serialize();
    }
}

app.get("/login", async (req, res) => {
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
    if (username) {
        connection.query("SELECT * FROM BBY35_accounts WHERE username = ?", [username], async (err, data, fields) => {
            if (err) throw err;
            if (data.length > 0) {
                let passwordMatches = await bcrypt.compare(password, data[0].password);
                if (passwordMatches) {
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
                    res.send({
                        status: "success",
                        msg: "Log In Successful"
                    });
                }

            } else {
                res.send({
                    status: "failure",
                    msg: "Log In Unsuccessful"
                });
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

app.get("/profile", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) return res.redirect("/login");

    let doc = fs.readFileSync("./root/profile.html", "utf-8");
    let pageDOM = new JSDOM(doc);

    // header & footer
    let link = pageDOM.window.document.createElement("link");
    link.setAttribute("rel","stylesheet");
    link.setAttribute("href", "css/main.css");
    pageDOM.window.document.head.appendChild(link);
    pageDOM = await helpers.injectHeaderFooter(pageDOM);
   
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
    if (req.session.loggedIn) {
        connection.query('SELECT id, caretaker_id, photo_url, name, species, gender, description, status  FROM BBY35_pets WHERE owner_id = ?', [req.session.userid], (err, data, fields) => {
            res.send(data);
        });
    } else {
        res.send({ status: "failure", msg: "User not logged in!" });
    }
});

app.get("/petRequests", (req, res) =>{
    res.setHeader("content-type", "application/json");
    if (req.session.caretaker == 1) {
        connection.query("SELECT id, owner_id, photo_url, name, species, gender, description, status FROM BBY35_pets WHERE status = 2 AND owner_id <> ?", [req.session.userid], (err, data, fields) => {
            res.send(data);
        });
    } else {
        res.send({ status: "failure", msg: "User not caretaker!" });
    }
});

app.put("/acceptPet", (req, res) => {
    res.setHeader("content-type", "application/json");
    let petid = req.body.petid;
    let caretakerid = req.session.userid;
    if (req.session.caretaker == 1) {
        connection.query("UPDATE BBY35_pets SET status = 1, caretaker_id = ? WHERE id = ?", [caretakerid, petid], () => {
            res.send({status: "success", msg: "Pet is now in your care"});
        })
    } else {
        res.send({status: "failue", msg: "You are not a caretaker!"});
    }
});

app.put("/releasePet", (req, res) => {
    res.setHeader("content-type", "application/json");
    let petid = req.body.petid;
    let status = req.body.status
    let isOKStatus = (status != 1);
    if (isOKStatus && req.session.caretaker == 1) {
        connection.query("UPDATE BBY35_pets SET status = ?, caretaker_id = NULL WHERE id = ?", [status, petid], () => {
            res.send({status: "success", msg: "Pet is now no longer in your care"});
        })
    } else {
        res.send({status: "failue", msg: "You are not a caretaker or status is invalid!"});
    }
})

app.get("/petsInCare", (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.session.caretaker == 1) {
        connection.query("SELECT id, owner_id, photo_url, name, species, gender, description, status FROM BBY35_pets WHERE status = 1 AND caretaker_id = ?", [req.session.userid], (err, data, fields) => {
            res.send(data);
        });
    } else {
        res.send({ status: "failure", msg: "User not caretaker!" });
    }
});

app.get("/getUserInfo/:userid", (req, res) => {
    res.setHeader("content-type", "application/json");
    let userid = req.params.userid;

    connection.query(`SELECT username, firstname, lastname, email, is_caretaker FROM BBY35_accounts WHERE id = ?`, [userid], (err, data, fields) => {
        res.send(data);
    });
});

app.put("/requestHousing", (req, res) => {
    res.setHeader("content-type", "application/json");
    let petid = req.body.petid;

    connection.query(`SELECT status FROM BBY35_pets WHERE id = ?`, [petid], async (err, data, fields) => {
        let status = data[0]['status'];
        if (status == 1) {
            res.send({status: "failure", msg: "Pet is away."});
        } else {
            if (status == 0) {
                connection.query(`UPDATE BBY35_pets SET status = 2 WHERE id = ?`, [petid], () => {
                    res.send({status: "success", msg: "Pet is now pending caretaker."});
                });
            } else {
                connection.query(`UPDATE BBY35_pets SET status = 0 WHERE id = ?`, [petid], () => {
                    res.send({status: "success", msg: "Pet is now returned home."});
                });
            }
        }
    });
});

// this route is for testing and example purposes only and should be cleaned up once the forms requiring image upload are completed
app.get("/addPhoto", (req, res) => {
    let doc = fs.readFileSync("./root/addphoto.html", "utf-8");
    res.send(doc);
});

app.post("/addPhoto", upload.single("picture"), (req, res) => {
    console.log(req.file);
    res.statusCode = 201;
    let truncatedPath = req.file.path.replace("root/img/uploads/", "");
    console.log(truncatedPath);
    res.send({ url: truncatedPath });
});

app.delete("/delete", async (req, res) => {
    let requesterID = req.session.userid;
    let isRequesterAdmin = req.session.admin;
    let accountID = req.body.id;

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
    let adminDelete = (adminOnAdminDelete || adminOnUserDelete);
    let allowDelete = (userSelfDelete || adminDelete);

    if (allowDelete) {
        connection.query('UPDATE BBY35_accounts SET username = NULL, password = NULL, firstname = "DELETED", lastname = "USER", is_admin = 0  WHERE id = ?', [accountID], async () => {
            await getAdminCount();
            if (adminOnAdminDelete) {
                res.send({ status: "success", msg: `Removed user: ${targetName}; Remaining admins: ${adminCount}` });
            } else if (userSelfDelete) {
                res.send({ status: "success", msg: `Your account has been removed.` });
            } else {
                res.send({ status: "success", msg: `Removed user: ${targetName}` });
            }
        });
    } else {
        res.send({ status: "failure", msg: `Could not remove user ${targetName}` });
    }
});

app.put("/grant", async (req, res) => {
    let isRequesterAdmin = req.session.admin;
    let accountID = req.body.id;

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
            res.send({ status: "success", msg: `User ${targetName} was granted admin privileges` })
        });
    } else {
        res.send({ status: "failure", msg: `User ${targetName} could not be granted admin privileges` });
    }
});

app.put("/revoke", async (req, res) => {
    let requesterID = req.session.userid;
    let isRequesterAdmin = req.session.admin;
    let accountID = req.body.id;

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
            res.send({ status: "success", msg: `Revoked admin: ${targetName}; Remaining admins: ${adminCount}` });
        });
    } else {
        res.send({ status: "failure", msg: `Could not revoke admin ${targetName}` });
    }
});

app.post("/add", (req, res) => {
    res.setHeader("Content-Type", "application/json");

    let isRequesterAdmin = req.session.admin;

    if (isRequesterAdmin) {
        connection.query("INSERT INTO BBY35_accounts (username, firstname, lastname, email, password, is_caretaker) VALUES (?, ?, ?, ?, ?, ?)", 
        [req.body.username, req.body.firstname, req.body.lastname, req.body.email, req.body.password, req.body.account_type], (error, data, fields) => {
            if (error) {
                res.send({ status: "failure", msg: "Internal Server Error" });
            } else {
                res.send({ status: "success", msg: "Record added." });
            }
        });
    } else {
        res.send({ status: "failure", msg: "Forbidden." });
    }
});

console.log("Starting Server...");

if (is_Heroku) {
    var port = process.env.PORT;
} else {
    var port = 8000;
}

function onBoot() {
    console.log("Started on port: " + port);
}

app.listen(port, onBoot);