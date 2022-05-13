"use strict";

// ============================================================================
// On page load, create the table for the admin panel.
// TODO:  -Move serverside
//        -Move relevant HTML panel to admin's homepage serverside
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  let table = document.getElementById("userTable").querySelector("tbody");

  let userData = await getUserData();
  userData.forEach(user => {
    let row = document.createElement("tr");
    let tableFields = ["id", "username", "firstname", "lastname", "email", "is_admin", "is_caretaker"];
    
    tableFields.forEach(field => {
      let currentField = document.createElement("td");
      currentField.innerText = user[field];
      row.appendChild(currentField);
    });

    let deleteButton = document.createElement("button");
    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();
      callDelete(user.id);
    });
    
    let grantButton = document.createElement("button");
    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();
      callGrant(user.id);
    });

    let revokeButton = document.createElement("button");
    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();
      callRevoke(user.id);
    });

    deleteButton.innerText = 'Delete';
    grantButton.innerText = 'Grant Admin';
    revokeButton.innerHTML = 'Revoke Admin';
    
    row.appendChild(deleteButton, grantButton, revokeButton);

    table.appendChild(row);
  });
});

// ============================================================================
// Fetch and parse into JSON the table for userData
// ============================================================================
async function getUserData() {
  try {
    let response = await fetch("/userData", {
      method: 'GET',
    });

    if (response.status == 200) {
      let data = await response.text();
      return JSON.parse(data);
    } else {
      console.error(response.status, response.statusText);
    }
  } catch (error) {
    console.error(error);
  }
}

async function callDelete(userid) {
  try {
    let response = await fetch("/delete", {
      "method": 'DELETE',
      "headers": {
        "content-type": "application/json",
      },

      "body": JSON.stringify({
        "id": userid,
      })
    });

    if (response.status == 200) {
      response.json().then(response => {console.log(response.msg)});
      //location.reload();
    } else {
      console.error(response.status, response.statusText);
    }
  } catch (error) {
    console.error(error);
  }
}