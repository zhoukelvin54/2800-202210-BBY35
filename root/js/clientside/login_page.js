// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";

const FORM = document.forms.login_form;
// Used to keep track of the current state of the login / sign up form (0 for normal form, 1 for sign up)
let formState = 0;

ready(function () {
    FORM.addEventListener("submit", handleForm);
});

// ============================================================================
// This handles what function will be called upon login / signup submission.
// ============================================================================
function handleForm(e) {
    e.preventDefault();
    let stateFunction = formState == 1 ? signup : login;
    stateFunction();
}

// ============================================================================
// This is responsible for logging in and redirecting the user if server 
// repsponds that we are logged in.
// ============================================================================
async function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if (username == "" || password == "") {
        document.getElementById("errorMsg").innerText = "Please fill out all fields.";
        return;
    }

    fetch("/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ "username": username, "password": password })
    }).then(async res => {
        if (res.status == 200) {
            let data = await res.text();
            if (data) {
                let parsed = JSON.parse(data);

                if (parsed.status == "failure") {
                    document.getElementById("errorMsg").innerText = parsed.msg;
                } else {
                    window.location.replace("/home");
                }
            }
        }
    }).catch(err => {
        console.err(err);
    });
}

// ============================================================================
// This function is responsible for logging in and redirecting the user if 
// logged in.
// ============================================================================
function signup() {
    let requiredFields = ["username", "password", "email"];
    let formData = {
        username: FORM.username.value.trim(),
        password: FORM.password.value.trim(),
        firstname: FORM.firstname.value.trim(),
        lastname: FORM.lastname.value.trim(),
        email: FORM.email.value.trim(),
        account_type: FORM.account_type.value
    };

    for (let i = 0; i < requiredFields.length; i++) {
        let prop = requiredFields[i];
        if (formData[prop] == "" || formData[prop] == null) {
            document.getElementById("errorMsg").innerText = "Please fill out all required fields.";
            return;
        }
    }

    fetch("/add-account", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            "username": formData.username,
            "password": formData.password,
            "firstname": formData.firstname,
            "lastname": formData.lastname,
            "email": formData.email,
            "account_type": formData.account_type
        })
    }).then(async res => {
        if (res.status == 200) {
            let data = await res.text();
            if (data) {
                let parsedData = JSON.parse(data);
                if (parsedData.status == "success") {
                    login();
                } else {
                    document.getElementById("errorMsg").innerText = parsedData.msg;
                }
            }
        }
    }).catch(err => {
        console.error(err);
    });
}

// ============================================================================
// This function is responsible for swapping the sign up form between sign up 
// and log-in
// ============================================================================
function swapForm() {
    let signUpElements = document.querySelectorAll(".signup");

    // If the form currently displays only login items, change it and display sign-up elements
    if (formState == 0) {
        formState = 1;
        document.getElementById("swap").value = "Already have an account?";
        FORM.querySelector("h1").innerText = "Sign up";

        document.getElementById("signup").removeAttribute("hidden");
        document.getElementById("login").setAttribute("hidden", true);
        document.getElementById("email").setAttribute("required", true);

        for (let i = 0; i < signUpElements.length; i++) {
            signUpElements[i].classList.remove("hidden");
        }
    } else {
        formState = 0;
        document.getElementById("swap").value = "New User?";
        FORM.querySelector("h1").innerText = "Login";

        document.getElementById("signup").setAttribute("hidden", true);
        document.getElementById("login").removeAttribute("hidden");
        document.getElementById("email").removeAttribute("required");

        for (let i = 0; i < signUpElements.length; i++) {
            signUpElements[i].classList.add("hidden");
        }
    }

    document.getElementById("errorMsg").innerText = "";
}

// ============================================================================
// This is used to ensure functions are called only when the DOM is ready.
// ============================================================================
function ready(cb) {
    if (document.readyState != "loading") cb();
    else document.addEventListener("DOMContentLoaded", cb);
}