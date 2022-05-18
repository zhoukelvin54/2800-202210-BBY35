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
    document.getElementById("add_pet_modal").style.display="block";
}

document.querySelector(".cancel").onclick = function hideModal() {
    document.getElementById("add_pet_modal").style.display="none";
}

// ============================================================================
// ============================================================================
// Below are add pet functions
// ============================================================================
// ============================================================================
const form = document.forms['pet_details_form'];

form.addEventListener("submit", handleForm);

// ============================================================================
// Handles the form and error output.
// ============================================================================
function handleForm(e) {
    e.preventDefault();
    try {
      updatePetInfo();
      document.getElementById("add_pet_modal").style.display="none";
    } catch (err) {
      document.getElementById("error_message").innerText = err;
      return;
    }
}
// ============================================================================
// Creates a pet data table row for the pet owner.
// ============================================================================
function getPetData() {
    let sexButtons = document.querySelectorAll('input[name="pet_sex"]');
    for (const sexButton of sexButtons) {
        if (sexButton.checked) {
            var selectedSex = sexButton.value;
            break;
        }
    }
    return {
        pet_name: form["pet_name"].value,
        pet_sex: selectedSex,
        pet_species: form["pet_species"].value,
        pet_description: form["pet_description"].value,
        pet_picture: form["upload_pet_picture"].files[0].name // TODO Replace with generated name from upload
    }
}

async function updatePetInfo() {
    let petData = getPetData();
    fetch("/update-pet", {
      method: "PUT",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        "name": petData.pet_name,
        "gender": petData.pet_sex,
        "species": petData.pet_species,
        "description": petData.pet_description,
        "photo_url": petData.pet_picture
      })
    }).then(async res => {
      if (res.status == 200) {
        let data = await res.text();
        console.log(data);
        if (data) {
          let parsed = JSON.parse(data);
          if (parsed.status == "failure") {
            console.log("error");
          } else {
            console.log("success");
            window.location.assign("/home");
          }
        }
      }
    }).catch(err => {
      console.err(err);
    });
  }