"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    let table = document.getElementById("pet-table").querySelector("tbody");
    let petData = await getPets();
    if (petData.length >= 1) {
        petData.forEach( (pet) => {
            let row = document.createElement("tr");
            let tableFields = ["photo_url", "name", "species", "gender", "description", "status", "caretaker_id"];
    
            tableFields.forEach( async (field) => {
                let currentEntry = document.createElement("td");
                let innerText = "";
                if (field == "photo_url") {
                    innerText = `<img src="/img/uploads/${pet[field]}" alt="${pet["name"]}" width="160" height="160">`;
                } else if (field == "status") {
                    let state = ""
                    let allowChange = false;
                    let status = pet['status'];
                    if (status == 0) {
                        state = "Home"
                        allowChange = true;
                    } else if (status == 1) {
                        state = "Away"
                    } else {
                        state = "Pending"
                        allowChange = true;
                    }
                    
                    let button = allowChange ? `<button onclick="changePetState(${pet["id"]})">Change</button>` : `<button disabled>Disabled</button>`
                    
                    innerText = 
                    `
                        ${state}
                        <br>
                        ${button}
                    `
                } else if (field == "caretaker_id") {
                    if (pet[field] == null) {
                        innerText = "None";
                    } else {
                        let data = await getAccountInfo(pet[field]);
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
    } else {
        let row = document.createElement("tr");
        for (let i = 0; i < 7; i++) {
            let currentEntry = document.createElement("td");
            let innerText = "N/A";
            currentEntry.innerHTML = innerText;
            
            row.appendChild(currentEntry);
        }
        table.appendChild(row);
    }
    
    let table2 = document.getElementById("caretaker-panel").querySelector("tbody");
    let requestData = await getRequests();
    if (requestData.length >= 1) {
        requestData.forEach( (pet) => {
            let row = document.createElement("tr");
            let tableFields = ["photo_url", "name", "species", "gender", "description", "status", "owner_id"];
    
            tableFields.forEach( async (field) => {
                let currentEntry = document.createElement("td");
                let innerText = "";
                if (field == "photo_url") {
                    innerText = `<img src="/img/uploads/${pet[field]}" alt="${pet["name"]}" width="160" height="160">`;
                } else if (field == "status") {
                    let state = ""
                    let allowChange = false;
                    let status = pet['status'];
                    if (status == 0) {
                        state = "Home"
                        allowChange = true;
                    } else if (status == 1) {
                        state = "Away"
                    } else {
                        state = "Pending"
                        allowChange = true;
                    }
                    
                    let button = allowChange ? `<button onclick="changePetState(${pet["id"]})">Change</button>` : `<button disabled>Disabled</button>`
                    
                    innerText = 
                    `
                        ${state}
                        <br>
                        ${button}
                    `
                } else if (field == "owner_id") {
                    if (pet[field] == null) {
                        innerText = "None";
                    } else {
                        let data = await getAccountInfo(pet[field]);
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
    
            table2.appendChild(row);
        })
    } else {
        let row = document.createElement("tr");
        for (let i = 0; i < 7; i++) {
            let currentEntry = document.createElement("td");
            let innerText = "N/A";
            currentEntry.innerHTML = innerText;
            
            row.appendChild(currentEntry);
        }
        table2.appendChild(row);
    }
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

async function getRequests() {
    try {
        let response = await fetch("/petRequests", {
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

async function getAccountInfo(id) {
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

async function changePetState(id) {
    let request = { 
        method: "PUT",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
            petid: id
        })
    }; try {
        let response = await fetch("/requestHousing", request);

        if (response.status == 200) {
            response.json().then(response => {window.confirm(response.msg)});
            location.reload();
        } else {
            console.error(response.status, response.statusText);
        }
    } catch (error) {
        console.error(error);
    }
}