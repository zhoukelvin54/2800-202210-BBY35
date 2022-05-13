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
      
      let petData = getPetData();
  
      updateProfile();
      updatePetInfo(petData);
  
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

function updateProfile() {
    var pp_url; 
    let profile_picture = form.upload_profile_picture.files[0]
    const formData = new FormData();
  
    formData.append("picture", profile_picture)
  
    fetch("/addPhoto", {
      method: "POST",
      body: formData
    }).then(async res => {
        if (res.status == 201) {
            pp_url = await res.json();
            pp_url = pp_url.url;
            console.log(pp_url);
  
            fetch("/update-profile", { 
              method: "PUT",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify(getProfileData(pp_url))
            }).then(
              () => {
                // TODO UPDATE DATA
                console.log("Uploaded?");
              }
            ).catch(err => {
              throw err;
            });
        }
    }).catch(err => {
      console.error(err);
      throw err;
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
        }).catch(err => {
            console.err(err);
        });

}