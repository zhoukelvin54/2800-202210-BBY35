'use strict';

document.addEventListener("DOMContentLoaded", async () => {
  console.log("User management script loaded.");
  let table = document.getElementById("userTable").querySelector("tbody");

  let userData = await getUserData()
  userData.forEach(user => {
    let row = document.createElement("tr");
    let tableFields = ["username", "firstname", "lastname", "email", "is_admin", "is_caretaker"];
    
    tableFields.forEach(field => {
      let currentField = document.createElement("td");
      currentField.innerText = user[field];
      row.appendChild(currentField);
    });

    table.appendChild(row);
  });
});

async function getUserData() {
  try {
    let response = await fetch("/userData", {
      method: 'GET',
    });

    if (response.status == 200) {
      let data = await response.text();
      // console.log(data);
      return JSON.parse(data);
    } else {
      console.log(response.status);
      console.log(response.statusText);
    }
  } catch (error) {
    console.log(error);
  }
}