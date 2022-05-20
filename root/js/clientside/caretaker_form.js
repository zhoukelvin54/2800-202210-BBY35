// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";
function escapeHTML(str) {
  return str => str.replace(/[&<>'"]/g, 
  tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));
}

const form = document.forms.user_creation_form;
form.addEventListener("submit", handleForm);

// ============================================================================
// Handles the form and error output.
// ============================================================================
function handleForm(e) {
  e.preventDefault();
  try {

    
    let caretakerData = getCaretakerData();

    updateProfile();
    updateCaretakerInfo(caretakerData);

  } catch (err) {
    document.getElementById("info_error_message").innerText = err;
    return;
  }
}

// ============================================================================
// Sends profile information update request from the form.
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
// Sends caretaker information update request from the form.
// ============================================================================
function updateCaretakerInfo(data) {
  fetch("/update-caretaker-info", { 
    method: "PUT",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async res => {
    if (res.status == 200) {
      let data = await res.text();
      if (data) {
        let parsed = JSON.parse(data);
        if (parsed.status == "failure") {
          console.error("Could not update caretaker information.");
        } else {
          console.log("Caretaker information updated");
          window.location.assign("/home");
        }
      }
    }
  }).catch(err => {
    throw err;
  });
}

// ============================================================================
// Gets profile information from the form.
// ============================================================================
function getProfileData(pp_url) {
  return {
    profile_photo_url: pp_url,
    telephone: form.telephone.value.trim(),
    address: form.street_address.value.trim() + " " + form.region.value.trim() 
    + " " + form.country.value.trim()
    //street_address: form.street_address.value.trim(),
    //region: form.region.value.trim(),
    //country: form.country.value.trim()
  };
}

// ============================================================================
// Gets caretaker information from the form.
// ============================================================================
function getCaretakerData() {
  let caretakerInfo = {
    animal_affection: form.animal_affection.value,
    experience: escapeHtml(form.experience.value.trim()),
    allergies: escapeHtml(form.allergies.value.trim()),
    other_pets: escapeHtml(form.other_pets.value.trim()),
    busy_hours: escapeHtml(form.busy_hours.value.trim()),
    house_type: form.house_type.value,
    house_active_level: form.house_active_level.value,
    people_in_home: form.people_in_home.value,
    children_in_home: form.children_in_home.value,
    yard_type: form.yard_type.value,
    accomodation_picture: form.accomodation_picture.files
  };
  
  let requiresValidation = ["experience","allergies","other_pets","busy_hours"];
  for(let i; i < requiresValidation.length; i++) {
    if (caretakerInfo[requiresValidation[i]] == "") {
      throw "Please fill out all form fields.";
    }
  }
  return caretakerInfo;
}