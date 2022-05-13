// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint browser: true */
'use strict'
/*
ready(function () {
    document.getElementById("pet-details-form").addEventListener("submit", handleForm);
});
*/

const form = document.forms['pet_details_form'];

form.addEventListener("submit", handleForm);

// ============================================================================
// Handles the form and error output.
// ============================================================================
function handleForm(e) {
    e.preventDefault();
    try {
      let profileData = getProfileData();
      let petData = getCaretakerData();
  
      updateProfile(profileData);
      updatePetInfo(PetData);
  
    } catch (err) {
      document.getElementById("error_message").innerText = err;
      return;
    }
}

// ============================================================================
// Gets data from forms
// ============================================================================
    function getProfileData() {
        return {
            profile_picture: form["upload_profile_picture"].files[0],
            telephone: form["telephone"].value,
            address: (form["street_address"].value + ", "
            + form["region"].value + ", " + form["country"].value)
        }
    }

    function getPetData() {
        let sexButtons = document.querySelectorAll('input[name="pet_sex"]');
        for (const sexButton of sexButtons) {
            if (sexButton.checked) {
                var selectedSex = sexButton.value;
                break;
            }
        }
        return {
            pet_name: form["name"].value,
            pet_sex: selectedSex,
            pet_species: form["pet_species"].value,
            pet_description: form["pet_description"].value,
            pet_picture: form["upload_pet_picture"].files[0]
        }
    }

// ============================================================================
// Updates the account on the DB
// ============================================================================

async function updateProfile() {
    fetch("/update-profile", {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "profile_picture": profileData.profile_picture,
                "telephone": profileData.telephone,
                "address": profileData.address
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
                }
            }
        }
        }).catch(err => {
            console.err(err);
        });

}

// ============================================================================
// Creates a pet data table row for the pet owner.
// ============================================================================

async function updatePetInfo() {
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
                }
            }
        }
        }).then(async res => {
            res => res.json();
        }).catch(err => {
            console.err(err);
        });

}