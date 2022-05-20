// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint browser: true */
'use strict'

import sanitizeHtml from "sanitize-html";

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
      updateProfile();
      updatePetInfo();
    } catch (err) {
      document.getElementById("error_message").innerText = err;
      return;
    }
}


// ============================================================================
// Gets data from forms
// ============================================================================
    function getProfileData(pp_url) {
      return {
        profile_photo_url: sanitizeHtml(pp_url),
        telephone: sanitizeHtml(form.telephone.value.trim()),
        address: sanitizeHtml(form.street_address.value.trim() + " " + form.region.value.trim() + " " + form.country.value.trim())
        //street_address: form.street_address.value.trim(),
        //region: form.region.value.trim(),
        //country: form.country.value.trim()
      };
    }

    function getPetData() {
        let sexButtons = document.querySelectorAll('input[name="pet_sex"]');
        for (const sexButton of sexButtons) {
            if (sexButton.checked) {
                var selectedSex = sanitizeHtml(sexButton.value);
                break;
            }
        }
        return {
            pet_name: sanitizeHtml(form["pet_name"].value),
            pet_sex: sanitizeHtml(selectedSex),
            pet_species: sanitizeHtml(form["pet_species"].value),
            pet_description: sanitizeHtml(form["pet_description"].value),
            pet_picture: sanitizeHtml(form["upload_pet_picture"].files[0].name) // TODO Replace with generated name from upload
        }
    }

// ============================================================================
// Updates the account on the DB
// ============================================================================

async function updateProfile() {
  var pp_url; 
  let profile_picture = form.upload_profile_picture.files[0]
  const formData = new FormData();

  formData.append("picture", profile_picture)

  await fetch("/addPhoto", {
    method: "POST",
    body: formData
    }).then(res => res.json())
    .then(res => (pp_url = res.url))
    .catch(err => {
      console.error(err);
      throw err;
    })

  await fetch("/update-profile", { 
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

// ============================================================================
// Creates a pet data table row for the pet owner.
// ============================================================================

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