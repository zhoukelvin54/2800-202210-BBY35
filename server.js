// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint node: true */
"use strict";

import * as helpers from "./root/js/serverside/helpers.js";
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

/** Amount of rounds to salt passwords in bcrypt. */
const SALT_ROUNDS = 10;
/** Stores if the app is currently running in Heroku from the process environment variables. */
const is_Heroku = process.env.is_Heroku || false;
/** Multer options for using disk storage under the sessions user's ID to the uploads directory. */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let id = req.session.userid;
        let dir = `./root/img/uploads/${id}/`;
        fs.mkdir(dir, (exists) => {
            if (!exists) {
                //console.log("Path does not exist, creating: " + dir);
            }
        });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        let id = req.session.userid;

        let input = file.originalname;
        let extensionIndex = input.lastIndexOf(".");
        let extension = input.substring(extensionIndex);

        let fileString = `UserID-${id}-UploadedAt-${Date.now()}${extension}`;

        cb(null, fileString);
    }
});
/** Multer object to upload to using configured storage options. */
const upload = multer({ storage: storage });

const app = express();

/** Connection settings for the MySQL database */
const dbConnection = {
    host: "localhost",
    user: "root",
    password: "",
    database: "COMP2800",
    port: 3306
};

// Setup the connection pool based on which environment is running
if (is_Heroku) {
    var connection = mysql2.createPool(process.env.JAWSDB_MARIA_URL);
} else {
    var connection = mysql2.createPool(dbConnection);
}

connection.getConnection((err) => {
    if (err) {
        console.error("Error connecting to database: " + err.stack);
    }
});

/** Stores session configuration options. */
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
app.use("/audio", express.static("./root/audio"));
app.use("/font", express.static("./root/font"));
app.use("/js", express.static("./root/js/clientside"));
app.use("/scss", express.static("./root/scss"));


// ============================================================================
//                          General page routing
// ============================================================================

// Redirects base requests to the login screen.
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Gets the log in screen, otherwise redirects logged in users to the home screen.
app.get("/login", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/home");
    } else {
        let doc = fs.readFileSync("./root/login.html", "utf-8");
        res.send(doc);
    }
});

// Authenticates and attempts to login to the app from a request 
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

// Temporarily redirect to the correct forms on sign up, to be phased out by modals in the future.
app.get("/sign-up", (req, res) => {
    req.session.newAccount = false;
    if (req.session.caretaker) {
        res.send(fs.readFileSync("./root/caretaker_form.html", "utf-8"));
    } else {
        res.send(fs.readFileSync("./root/pet_details_form.html", "utf-8"));
    }
});

// Redirects users not logged in, or if they need to fill out the new account information forms.
// Otherwise gets the currently logged in users home view.
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

// Creates and returns the currently logged in users profile page
app.get("/profile", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) return res.redirect("/login");

    let doc = fs.readFileSync("./root/profile.html", "utf-8");
    let pageDOM = new JSDOM(doc);
    if (req.session.caretaker) {
        //update path 
        let link = pageDOM.window.document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", "css/modals.css");
        pageDOM.window.document.head.appendChild(link);
        pageDOM = await helpers.loadHTMLComponent(pageDOM, "#edit_caretaker_button", "#edit_caretaker_button", "./root/common/caretaker_modal.html");
        pageDOM = await helpers.loadHTMLComponent(pageDOM, "#edit_caretaker_modal", "#edit_caretaker_modal", "./root/common/caretaker_modal.html");
        let script = pageDOM.window.document.createElement("script");
        script.setAttribute("src", "js/caretaker_modal.js");
        pageDOM.window.document.body.appendChild(script);
    }

    // header & footer
    let link = pageDOM.window.document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "css/main.css");
    pageDOM.window.document.head.appendChild(link);
    pageDOM = await helpers.injectHeaderFooter(pageDOM);

    res.send(pageDOM.serialize());

});

// Destroys the currently logged in session and logs the user out
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

async function getUserView(req) {
    if (req.session.admin) {
        let doc = fs.readFileSync("./root/user_management.html", "utf-8");
        let pageDOM = new JSDOM(doc);

        // header & footer
        let link = pageDOM.window.document.createElement("link");
        link.setAttribute("rel", "stylesheet");
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
            description = "Here you will see your pets and can request a caretaker to look after them. <br> At the bottom you can see a list of other's pets that currently need caretakers to look after them";
            pageDOM.window.document.getElementById("caretaker-panel").hidden = false;
        } else {
            role = "pet owner";
            description = "Here you will see your pets and can request a caretaker to look after them";

            let link = pageDOM.window.document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("href", "css/modals.css");
            pageDOM.window.document.head.appendChild(link);
            pageDOM = await helpers.loadHTMLComponent(pageDOM, "#add_pet_button", "#add_pet_button", "./root/common/pets_modal.html");
            pageDOM = await helpers.loadHTMLComponent(pageDOM, "#add_pet_modal", "#add_pet_modal", "./root/common/pets_modal.html");
            let script = pageDOM.window.document.createElement("script");
            script.setAttribute("src", "js/pets_modal.js");
            pageDOM.window.document.body.appendChild(script);
        }

        pageDOM.window.document.getElementById("role").innerHTML = role;
        pageDOM.window.document.getElementById("role-desc").innerHTML = description;

        // header & footer
        let link = pageDOM.window.document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", "css/main.css");
        pageDOM.window.document.head.appendChild(link);
        pageDOM = await helpers.injectHeaderFooter(pageDOM);


        return pageDOM.serialize();
    }
}

// ============================================================================
//                          Backend API routing
// ============================================================================

// Uploads a single photo to the uploads folder using multer
app.post("/addPhoto", upload.single("picture"), (req, res) => {
    res.statusCode = 201;
    let path = req.file.path.replaceAll("\\", "/");
    let truncatedPath = path.replace("root/img/uploads/", "");
    console.log("File created at: root/img/uploads/", truncatedPath);
    res.send({ url: truncatedPath });
});

// Get timelines data for a given pet ID
app.get("/API/timeline/pet/:petId", (req, res) => {
    res.setHeader("content-type", "application/json");

    connection.query("SELECT * FROM `BBY35_pet_timeline` WHERE `pet_id` = ?", [req.params.petId],
        (error, results, fields) => {
            if (error) {
                console.error(error);
            } else if (results) {
                res.status(200).send(results);
            } else {
                return res.status(404).send({ status: "failure", msg: "No timelines with that pet ID!" });
            }
        });
});

// Get timelines data for a given caretaker ID
app.get("/API/timeline/caretaker/:caretakerId", (req, res) => {
    res.setHeader("content-type", "application/json");

    connection.query("SELECT * FROM `BBY35_pet_timeline` WHERE `caretaker_id_fk` = ?", [req.params.caretakerId],
        (error, results, fields) => {
            if (error) {
                console.error(error);
            } else if (results) {
                res.status(200).send(results);
            } else {
                return res.status(404).send({ status: "failure", msg: "No timelines with that caretaker ID!" });
            }
        });
});

// Get timelines posts for a given timeline ID
app.get("/API/timeline/posts/:timelineId", (req, res) => {
    res.setHeader("content-type", "application/json");

    connection.query("SELECT * FROM `BBY35_pet_timeline_posts` WHERE `timeline_id` = ?", [req.params.timelineId],
        (error, results, fields) => {
            if (error) {
                console.error(error);
            } else if (results.length > 0) {
                return res.status(200).send(results);
            } else {
                return res.status(404).send({ status: "failure", msg: "No posts with that timeline ID!" });
            }
        });
});

// Gets the requested users information from the database
app.get("/getUserInfo/:userid", (req, res) => {
    res.setHeader("content-type", "application/json");
    let userid = req.params.userid;

    connection.query(`SELECT username, firstname, lastname, email, is_caretaker FROM BBY35_accounts WHERE id = ?`, [userid], (err, data, fields) => {
        res.send(data);
    });
});

// Gets the requests pets information from the database
app.get("/getPetInfo/:petid", (req, res) => {
    res.setHeader("content-type", "application/json");
    let petid = req.params.petid;

    connection.query(`SELECT * FROM BBY35_pets WHERE id = ?`, [petid], (err, data, fields) => {
        res.send(data);
    });
});


// ============================================================================
//                            Timeline routes
// ============================================================================

// Constructs and sends a timelines document dependant on which type of account is logged in.
app.get("/timeline", async (req, res) => {
    helpers.redirectIfNotLoggedIn(req, res);

    let pageDOM = new JSDOM(await readFile("./root/common/page_template.html"));
    let userScript = req.session.caretaker ? "/js/timeline_caretaker.js" : "/js/timeline_pets.js";
    pageDOM = await helpers.injectHeaderFooter(pageDOM);
    pageDOM = await helpers.loadHTMLComponent(pageDOM, "main", "main", "./root/common/pet_timelines.html");
    helpers.injectStylesheet(pageDOM, "/css/timelines.css");
    helpers.injectScript(pageDOM, userScript, "defer");

    return res.send(pageDOM.serialize());
});

// Constructs and creates an overview of posts for a specific timeline, appends 
// tinyeditor if the account is a caretaker.
app.get("/timeline/overview/:timeline_Id", async (req, res) => {
    helpers.redirectIfNotLoggedIn(req, res);

    let pageDOM = new JSDOM(await readFile("./root/common/page_template.html"));
    let pageDoc = pageDOM.window.document;
    pageDOM = await helpers.injectHeaderFooter(pageDOM);
    pageDOM = await helpers.loadHTMLComponent(pageDOM, "main", "main", "./root/common/pet_timelines.html");
    helpers.injectStylesheet(pageDOM, "/css/timelines.css");
    helpers.injectScript(pageDOM, "/js/timeline.js", "defer");

    if (req.session.caretaker) {
        let addPostEditor = pageDoc.getElementById("create_post_template").content.cloneNode(true);
        pageDoc.querySelector("main").prepend(addPostEditor);
        helpers.injectScript(pageDOM, "https://unpkg.com/tiny-editor/dist/bundle.js", "defer");
        let fontAwesome = pageDOM.window.document.createElement("link");
        fontAwesome.setAttribute("rel", "stylesheet");
        fontAwesome.setAttribute("href", "https://use.fontawesome.com/releases/v5.3.1/css/all.css");
        fontAwesome.setAttribute("integrity", "sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU");
        fontAwesome.setAttribute("crossorigin", "anonymous");
        pageDOM.window.document.head.appendChild(fontAwesome);
    }

    return res.send(pageDOM.serialize());
});

// Gets the currently logged in caretaker timeline info
app.get("/timeline/caretaker", (req, res) => {
    if (req.session.loggedIn && req.session.caretaker) {
        res.redirect(`/API/timeline/caretaker/${req.session.userid}`);
    }
});

// Gets the currently logged in users' pet timelines info
app.get("/timeline/pet/:petId", (req, res) => {
    res.setHeader("content-type", "application/json");

    connection.query("SELECT `timeline_id`,`pet_id`,`caretaker_id_fk`,`start_date`,`end_date`,`location` FROM " +
        "`BBY35_pet_timeline` INNER JOIN `BBY35_pets` ON `BBY35_pets`.`owner_id` = ? WHERE `pet_id` = ?;",
        [req.session.userid, req.params.petId], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send({ status: "failure", msg: "Internal server error" });
            } else if (results.length > 0) {
                res.status(200).send(results);
            } else {
                return res.status(404).send({ status: "failure", msg: "No timelines with that pet ID!" });
            }
        });
});

// Creates a new timeline post from a request
app.post("/addPost", (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.body.timeline_id) {
        connection.query("INSERT INTO `BBY35_pet_timeline_posts` (`poster_id`, `timeline_id`, `post_date`, `photo_url`, `contents`) " +
            "VALUES (?, ?, ?, ?, ?);", [req.session.userid, req.body.timeline_id, req.body.post_date, req.body.photo_url, req.body.contents],
            (error, results, fields) => {
                if (error) {
                    res.send({ status: "failure", msg: "Internal Server Error" });
                } else {
                    res.status(201).send({ status: "success", msg: "Post created" });
                }
            });
    } else {
        return res.status(404).send({ status: "failure", msg: "No timeline provided!" });
    }
});

// Deletes a specfic timeline post from a request. Ensures the user either owns the card
// or is an admin before deletion.
app.delete("/deletePost", (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.body.post_id) {
        res.status(202);
        connection.query("SELECT `BBY35_pet_timeline_posts`.`post_id`, `BBY35_pet_timeline_posts`.`timeline_id`, `BBY35_pet_timeline`.`caretaker_id_fk` " +
            "FROM `BBY35_pet_timeline_posts` INNER JOIN `BBY35_pet_timeline` ON `BBY35_pet_timeline`.`timeline_id` = `BBY35_pet_timeline_posts`.`timeline_id` WHERE `post_id` = ?;", [req.body.post_id],
            async (error, results, fields) => {
                if (error) {
                    return res.status(404).send({ status: "failure", msg: "Unable to find post!" });
                } else if (results.length == 1 && (results[0].caretaker_id_fk == req.session.userid || req.session.admin)) {
                    await connection.promise().query("DELETE FROM `BBY35_pet_timeline_posts` WHERE `post_id` = ?", [results[0].post_id],
                        (error, results, fields) => {
                            if (error) {
                                console.error(error);
                            }
                            else {
                                return res.send({ status: "success", msg: "Post deleted" });
                            }
                        });
                } else {
                    return res.status(401).send({ status: "failure", msg: "Unauthorized" });
                }
            });
    } else {
        return res.status(204);
    }
});


// ============================================================================
//                            Account routes
// ============================================================================

// Creates a new account from a sign up request
app.post("/add-account", (req, res) => {
    res.setHeader("Content-Type", "application/json");

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

// Gets currently logged in users profile information
app.get("/get-profile", (req, res) => {
    res.setHeader("Content-type", "application/json");
    let actualFields = [req.session.userid];
    let query = "SELECT username, firstname, lastname, email, profile_photo_url";

    query += " FROM BBY35_accounts WHERE id = ?";

    connection.query(query, actualFields, (error, results, fields) => {
        if (error) {
            res.send({ status: "failure", msg: "Server error" });
        } else {
            res.send({ status: "success", information: results });
        }
    });
});

// Updates the currently logged in accounts profile information after verifying there is
// no email or username conflicts
app.put("/update-profile", (req, res) => {
    res.setHeader("Content-Type", "application/json");

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
                            query += prop + " = ? ";
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


// ============================================================================
//                             Pet routes
// ============================================================================

// Gets the currently logged in pet owners pets and their data
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

// Updates or creates a new pet from a request
app.put("/update-pet", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.session.caretaker) {
        res.send({ status: "failure", msg: "Current user is a caretaker!" });
    }

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
});

// Request that a provided pet be housing status be updated to reflect their needs
// (at-home or pending a home)
app.put("/requestHousing", (req, res) => {
    res.setHeader("content-type", "application/json");
    let petid = req.body.petid;

    connection.query(`SELECT status FROM BBY35_pets WHERE id = ?`, [petid], async (err, data, fields) => {
        let status = data[0]['status'];
        if (status == 1) {
            res.send({ status: "failure", msg: "Pet is away." });
        } else {
            if (status == 0) {
                connection.query(`UPDATE BBY35_pets SET status = 2 WHERE id = ?`, [petid], () => {
                    res.send({ status: "success", msg: "Pet is now pending caretaker." });
                });
            } else {
                connection.query(`UPDATE BBY35_pets SET status = 0 WHERE id = ?`, [petid], () => {
                    res.send({ status: "success", msg: "Pet is now returned home." });
                });
            }
        }
    });
});


// ============================================================================
//                            Caretaker routes
// ============================================================================

// Updates or creates a new caretaker information entry from a request
app.put("/update-caretaker-info", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (!req.session.caretaker) {
        res.send({ status: "failure", msg: "Current user is not a caretaker!" });
    }

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

// Gets the current pets in care for the currently logged in caretaker
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

// Gets the currently logged in caretakers acceptable pet requests
app.get("/petRequests", (req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.session.caretaker == 1) {
        connection.query("SELECT id, owner_id, photo_url, name, species, gender, description, status FROM BBY35_pets WHERE status = 2 AND owner_id <> ?", [req.session.userid], (err, data, fields) => {
            res.send(data);
        });
    } else {
        res.send({ status: "failure", msg: "User not caretaker!" });
    }
});

// Accepts a pets request and updates their status
app.put("/acceptPet", (req, res) => {
    res.setHeader("content-type", "application/json");
    let petid = req.body.petid;
    let caretakerid = req.session.userid;
    if (req.session.caretaker == 1) {
        connection.query("UPDATE BBY35_pets SET status = 1, caretaker_id = ? WHERE id = ?", [caretakerid, petid], () => {
            res.send({ status: "success", msg: "Pet is now in your care" });
        });
    } else {
        res.send({ status: "failue", msg: "You are not a caretaker!" });
    }
});

// Releases a pet back into the queue and updates their status
app.put("/releasePet", (req, res) => {
    res.setHeader("content-type", "application/json");
    let petid = req.body.petid;
    let status = req.body.status;
    let isOKStatus = (status != 1);
    if (isOKStatus && req.session.caretaker == 1) {
        connection.query("UPDATE BBY35_pets SET status = ?, caretaker_id = NULL WHERE id = ?", [status, petid], () => {
            res.send({ status: "success", msg: "Pet is now no longer in your care" });
        });
    } else {
        res.send({ status: "failue", msg: "You are not a caretaker or status is invalid!" });
    }
});


// ============================================================================
//                         Administrator routes
// ============================================================================

// Gets the users data from the database if you are an administrator
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

// "Deletes" a user, effectively making them not able to log in. Many checks in place to 
// verify the user is not the last user and is an admin
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

// Grants a requested user admin priviledges. Checks if the requester and target is an admin.
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
            res.send({ status: "success", msg: `User ${targetName} was granted admin privileges` });
        });
    } else {
        res.send({ status: "failure", msg: `User ${targetName} could not be granted admin privileges` });
    }
});

// Revokes a requested users admin priviledges. Checks if requester is an admin, how many
// admins are left, and if the user is attempting to remove themselves.
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

// Creates a new account, checks if the current user is an admin.
// TODO !!! DUPLICATED CODE !!! UPDATE WHERE USED AND REMOVE ASAP
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

let port = is_Heroku ? process.env.PORT : 8000;
function onBoot() {
    console.log("Started on port: " + port);
}

app.listen(port, onBoot);
