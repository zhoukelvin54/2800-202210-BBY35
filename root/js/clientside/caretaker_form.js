// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";

function submitCaretakerInfo() {
  let form = document.forms.user_creation_form;
  let profileInfo = {
    profile_picture: form.upload_profile_picture.files[0],
    telephone: form.telephone.value.trim(),
    street_address: form.street_address.value.trim(),
    region: form.region.value.trim(),
    country: form.country.value.trim()
  };

  let caretakerInfo = {
    animal_affection: form.animal_affection.value,
    experience: form.experience.value.trim(),
    allergies: form.allergies.value.trim(),
    other_pets: form.other_pets.value.trim(),
    busy_hours: form.busy_hours.value.trim(),
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
      document.getElementById("error_message").innerText = "Please fill out all form fields.";
    }
  }

  console.log(profileInfo, caretakerInfo);
}