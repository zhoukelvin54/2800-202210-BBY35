function signUpForm() {
    console.log("clicked");
    document.querySelectorAll("label").style.display="flex";
    document.querySelectorAll("input").style.display="flex";
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

document.getElementById("submit").addEventListener("click", function(e) {
    e.preventDefault();

    let formData = { name: document.getElementById("name").value,
                     email: document.getElementById("email").value};
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";


    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {

            // 200 means everthing worked
            if (xhr.status === 200) {

              getAccounts();
              document.getElementById("status").innerHTML = "DB updated.";

            } else {

              // not a 200, could be anything (404, 500, etc.)
              console.log(this.status);

            }

        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("POST", "/add-customer");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("name=" + formData.name + "&email=" + formData.email);

}) 
*/  