'use strict';

function swapForm() {
    document.getElementById("signup").addEventListener("click", signup);
    // console.log("clicked");
    if (document.getElementById("swap").value == "New User?") {
        document.getElementById("login").setAttribute("hidden", true);
        document.getElementById("signup").removeAttribute("hidden");
        document.getElementById("signup").value = "Sign Up";
        document.getElementById("swap").value = "Already have an account?";
        document.querySelector("label[for='firstname']").style.display = "flex";
        document.querySelector("input[name='firstname']").style.display = "flex";
        document.querySelector("input[name='firstname']").ariaRequired;
        document.querySelector("label[for='lastname']").style.display = "flex";
        document.querySelector("input[name='lastname']").style.display = "flex";
        document.querySelector("label[for='email']").style.display = "flex";
        document.querySelector("input[id='email']").style.display = "flex";

    } else {
        document.getElementById("login").removeAttribute("hidden");
        document.getElementById("signup").setAttribute("hidden", true);
        document.getElementById("login").value = "Log In";
        document.getElementById("swap").value = "New User?";
        document.querySelector("label[for='firstname']").style.display = "none";
        document.querySelector("input[name='firstname']").style.display = "none";
        document.querySelector("label[for='lastname']").style.display = "none";
        document.querySelector("input[name='lastname']").style.display = "none";
        document.querySelector("label[for='email']").style.display = "none";
        document.querySelector("input[id='email']").style.display = "none";
    }

}

var signup = async function (e) {
    e.preventDefault();

    let formData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        email: document.getElementById("email").value
    };
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("firstname").value = "";
    document.getElementById("lastname").value = "";
    document.getElementById("email").value = "";


    try {
        let response = await fetch("/add-account", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "username": formData.username,
                "password": formData.password,
                "firstname": formData.firstname,
                "lastname": formData.lastname,
                "email": formData.email
            })
        });

        if (response.status == 200) {
            let data = await response.text();
            if (data) {
                let parsed = JSON.parse(data);
                // console.log(parsed);
                if (parsed.status == 'failure') {
                    document.getElementById("errorMsg").innerText = parsed.msg;
                } else {
                    // console.log("User Added to database");
                }
            }
        } else {
            // console.log(response.status);
            // console.log(response.statusText);
        }
    } catch (error) {
        // console.log(error);
    }
};


