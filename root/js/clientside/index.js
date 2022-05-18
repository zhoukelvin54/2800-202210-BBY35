"use strict";
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function hidehero() {
    document.getElementById("welcome-img").style.display="none";
    document.getElementById("content-img").style.display="flex";
    if (getCookie("sawWelcome")) {
        document.cookie = "sawWelcome=true"
    }
};

let sawWelcome = getCookie("sawWelcome")
console.log("sawwelcome");
if(sawWelcome = "true") {
    hidehero();
    console.log("you already saw this!")
}

function showModal() {
    document.getElementById("pet_details_form").style.display="block";
}

document.querySelector(".cancel").onclick = function hideModal() {
    document.getElementById("pet_details_form").style.display="none";
}