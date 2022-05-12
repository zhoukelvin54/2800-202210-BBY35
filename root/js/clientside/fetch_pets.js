"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    let table = document.getElementById("pet-table").querySelector("tbody");
    let petData = await getPets();

    petData.forEach( (pet) => {
        let row = document.createElement("tr");
        let tableFields = ["photo_url", "name", "species", "gender", "description", "caretaker_id"];

        tableFields.forEach( (field) => {
            let currentEntry = document.createElement("td");
            let innerText = "";
            if (field == "photo_url") {
                innerText = `<img src="/img/uploads/${pet[field]}" alt="${pet["name"]}" width="160" height="160">`;
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