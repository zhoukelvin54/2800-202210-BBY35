'use strict';

var signup = function(e) {
    e.preventDefault();
    
    let formData = { username: document.getElementById("username").value,
                        password: document.getElementById("password").value,
                        firstname: document.getElementById("firstname").value,
                        lastname: document.getElementById("lastname").value,
                        email: document.getElementById("email").value};
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("firstname").value = "";
    document.getElementById("lastname").value = "";
    document.getElementById("email").value = "";
    
    
    
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
    
            // 200 means everthing worked
            if (xhr.status === 200) {
            //   console.log("success");
    
            } else {
    
                // not a 200, could be anything (404, 500, etc.)
            //   console.log(this.status);
    
            }
    
        } else {
            // console.log("ERROR", this.status);
        }
    }
    
    
    xhr.open("POST", "/add-account");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("username=" + formData.username + "&password=" + formData.password
    + "&firstname=" + formData.firstname + "&lastname=" + formData.lastname +
    "&email=" +formData.email);
};
    
    
    
function swapForm() {
    // console.log("clicked");
    if (document.getElementById("swap").value == "New User?") {
        document.getElementById("login").id="signup";
        document.getElementById("signup").addEventListener("click", signup) 
        document.getElementById("signup").value="Sign Up";
        document.getElementById("swap").value="Already have an account?";
        
        document.querySelector("label[for='firstname']").style.display="flex";
        document.querySelector("input[name='firstname']").style.display="flex";
        document.querySelector("input[name='firstname']").ariaRequired;
        document.querySelector("label[for='lastname']").style.display="flex";
        document.querySelector("input[name='lastname']").style.display="flex";
        document.querySelector("label[for='email']").style.display="flex";
        document.querySelector("input[id='email']").style.display="flex";
        
    } else {
        document.getElementById("signup").removeEventListener("click", signup);
        document.getElementById("signup").id="login";
        document.getElementById("login").addEventListener('submit', login);
        document.getElementById("login").value="Log In";
        document.getElementById("swap").value="New User?";
        
        document.querySelector("label[for='firstname']").style.display="none";
        document.querySelector("input[name='firstname']").style.display="none";
        document.querySelector("label[for='lastname']").style.display="none";
        document.querySelector("input[name='lastname']").style.display="none";
        document.querySelector("label[for='email']").style.display="none";
        document.querySelector("input[id='email']").style.display="none";
    }

}


