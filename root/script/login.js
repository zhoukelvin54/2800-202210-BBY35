function swapForm() {
    console.log("clicked");
    if (document.getElementById("swap").value == "New User?") {
        document.getElementById("swap").value="Already have an account?";
        document.getElementById("submit").value="Sign Up";
        document.querySelector("label[for='firstname']").style.display="flex";
        document.querySelector("input[name='firstname']").style.display="flex";
        document.querySelector("label[for='lastname']").style.display="flex";
        document.querySelector("input[name='lastname']").style.display="flex";
        document.querySelector("label[for='email']").style.display="flex";
        document.querySelector("input[id='email']").style.display="flex";
    } else {
        document.getElementById("swap").value="New User?";
        document.getElementById("submit").value="Log In";
        document.querySelector("label[for='firstname']").style.display="none";
        document.querySelector("input[name='firstname']").style.display="none";
        document.querySelector("label[for='lastname']").style.display="none";
        document.querySelector("input[name='lastname']").style.display="none";
        document.querySelector("label[for='email']").style.display="none";
        document.querySelector("input[id='email']").style.display="none";
    }

}

/*
function getAccounts() {

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {

            // 200 means everthing worked
            if (xhr.status === 200) {

              let data = JSON.parse(this.responseText);
              if(data.status == "success") {

                            let str = `<tr>
                            <th class="id_header"><span>id</span></th>
                            <th class="name_header"><span>Name</span></th>
                            <th class="email_header"><span>Email</span></th>
                            </tr>`;


                    for(let i = 0; i < data.rows.length; i++) {
                        let row = data.rows[i];
                        //console.log("row", row);
                        str += ("<tr><td class='id'>" + row.id
                            + "</td><td class='username'>" + row.username
                            + "</td><td class='firstname'>"
                            + row.firstname + "</td><td class='lastname'>"
                            + row.lastname + "</td><td class='email'>" 
                            + row.email + "</td><td class='password'>" 
                            + row.password + "</td><td class='is_admin'>" 
                            + row.is_admin + "</td><td class='is_caretaker'>" 
                            + row.is_caretaker + "</td><tr>");
                    }
                    //console.log(str);
                    document.getElementById("customers").innerHTML = str;

                    // select all spans under the email class of td elements
                    let records = document.querySelectorAll("td[class='email'] span");
                    for(let j = 0; j < records.length; j++) {
                        records[j].addEventListener("click", editCell);
                    }

                } else {
                    console.log("Error!");
                }

            } else {

              // not a 200, could be anything (404, 500, etc.)
              console.log(this.status);

            }

        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("GET", "/get-customers");
    xhr.send();
}
getAccounts();
*/

document.getElementById("submit").addEventListener("click", function(e) {
    e.preventDefault();

    let formData = { username: document.getElementById("username").value,
                     password: document.getElementById("password").value,
                     firstname: document.getElementById("firstname").value,
                     lastname: document.getElementById("lasrname").value,
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

              

            } else {

              // not a 200, could be anything (404, 500, etc.)
              console.log(this.status);

            }

        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("POST", "/add-account");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("username=" + formData.username + "&password=" + formData.password
    + "&firstname=" + formData.firstname + "&lastname=" + formData.lastname +
    "&email=" +formData.email);

}) 
