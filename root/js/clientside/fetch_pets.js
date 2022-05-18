"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    let table = document.getElementById("pet-table").querySelector("tbody");
    let petData = await getPets();

    petData.forEach( (pet) => {
        let row = document.createElement("tr");
        let tableFields = ["photo_url", "name", "species", "gender", "description", "status", "caretaker_id"];

        tableFields.forEach( async (field) => {
            let currentEntry = document.createElement("td");
            let innerText = "";
            if (field == "photo_url") {
                innerText = `<img src="/img/uploads/${pet[field]}" alt="${pet["name"]}" width="160" height="160">`;
            } else if (field == "status") {
                innerText = pet[field] == 0 ? "Home" : "Away"
            } else if (field == "caretaker_id") {
                if (pet[field] == null) {
                    innerText = "None";
                } else {
                    let data = await getCaretaker(pet[field]);
                    innerText = 
                    `
                        ${data[0]["lastname"]}, ${data[0]["firstname"]}
                        <br>
                        ${data[0]["username"]} 
                        <br> 
                        (${data[0]["email"]})
                    `;
                }
            } else {
                innerText = pet[field];
            }
            currentEntry.innerHTML = innerText;
            row.appendChild(currentEntry);
        });

        table.appendChild(row);
    })
});

async function getPets() {
    try {
        let response = await fetch("/petData", {
            method: "GET",
        });

        if (response.status == 200) {
            let data = await response.text();
            return JSON.parse(data);
        } else {
            console.error(response.status, response.statusText)
        }
    } catch (error) {
        console.error(error);
    }
}

async function getCaretaker(id) {
    let request = { 
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
            userid: id
        })
    };
    try {
        let response = await fetch("/getUserInfo", request);

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