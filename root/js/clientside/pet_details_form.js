// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";

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
    profile_photo_url: pp_url,
    telephone: form.telephone.value.trim(),
    address: form.street_address.value.trim() + " " + form.region.value.trim() + " " + form.country.value.trim()
  };
}

function getPetData() {
  let sexButtons = document.querySelectorAll('input[name="pet_sex"]');
  var selectedSex;
  for (const sexButton of sexButtons) {
    if (sexButton.checked) {
      selectedSex = sexButton.value;
      break;
    }
  }
  return {
    pet_name: form["pet_name"].value,
    pet_sex: selectedSex,
    pet_species: form["pet_species"].value,
    pet_description: form["pet_description"].value
  };
}

// ============================================================================
// Updates the account on the DB
// ============================================================================

async function updateProfile() {
  var pp_url;
  let profile_picture = form.upload_profile_picture.files[0];
  const formData = new FormData();

  formData.append("picture", profile_picture);

  await fetch("/addPhoto", {
    method: "POST",
    body: formData
  }).then(res => res.json())
    .then(res => (pp_url = res.url))
    .catch(err => {
      console.error(err);
      throw err;
    });

  await fetch("/update-profile", {
    method: "PUT",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(getProfileData(pp_url))
  }).catch(err => {
    throw err;
  });

}

// ============================================================================
// Creates a pet data table row for the pet owner.
// ============================================================================

async function updatePetInfo() {
  let picLocation = await uploadPetPhoto();
  let petData = getPetData();
  fetch("/update-pet", {
    method: "PUT",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      "name": petData.pet_name.trim(),
      "gender": petData.pet_sex,
      "species": petData.pet_species.trim(),
      "description": petData.pet_description.trim(),
      "photo_url": picLocation
    })
  }).then(async res => {
    if (res.status == 200) {
      let data = await res.text();
      if (data) {
        let parsed = JSON.parse(data);
        if (parsed.status == "failure") {
          console.error(parsed.status, parsed.msg);
        } else {
          window.location.assign("/home");
        }
      }
    }
  }).catch(err => {
    console.err(err);
  });
}

/**
 * Uploads the pet's photo to the database and returns its server location
 * @returns server file location under /img/uploads/
 */
async function uploadPetPhoto() {
  var pet_picture_location;
  let pet_picture = form["upload_pet_picture"].files[0];
  const formData = new FormData();

  formData.append("picture", pet_picture);

  await fetch("/addPhoto", {
    method: "POST",
    body: formData
  }).then(res => res.json())
    .then(res => (pet_picture_location = res.url))
    .catch(err => {
      console.error(err);
      throw err;
    });

  return pet_picture_location;
} 