'use strict';

function swapForm() {
    document.getElementById("signup").addEventListener("click", signup);
    let signUpElements = ["label[for='firstname']",
            "input[name='firstname']",
            "label[for='lastname']",
            "input[name='lastname']",
            "label[for='email']",
            "input[id='email']"];
    
    // If the form currently displays the new user button, change it and display sign-up form
    if (document.getElementById("swap").value == "New User?") {
        document.getElementById("swap").value = "Already have an account?";
        document.getElementById("login").setAttribute("hidden", true);
        document.getElementById("signup").removeAttribute("hidden");
        
        for (let i = 0; i < signUpElements.length; i++) {
            document.querySelector(signUpElements[i]).style.display = "flex";
        }


    } else {
        document.getElementById("swap").value = "New User?";
        document.getElementById("signup").setAttribute("hidden", true);
        document.getElementById("login").removeAttribute("hidden");
        
        for (let i = 0; i < signUpElements.length; i++) {
            document.querySelector(signUpElements[i]).style.display = "none";
        }
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
                let parsedData = JSON.parse(data);
                if (parsedData.status == 'failure') {
                    document.getElementById("errorMsg").innerText = parsedData.msg;
                } else {
                    window.location = "/";
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


