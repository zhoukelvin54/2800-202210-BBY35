// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";

function submitCaretakerInfo() {
  let form = document.forms.user_creation_form;
  let profileInfo = {
    profile_picture: form.upload_profile_picture.files[0],
    telephone: form.telephone.value,
    street_address: form.street_address.value,
    region: form.region.value,
    country: form.country.value
  };

  let caretakerInfo = {
    animal_affection: form.animal_affection.value,
    experience: form.experience.value,
    allergies: form.allergies.value,
    other_pets: form.other_pets.value,
    busy_hours: form.busy_hours.value,
    house_type: form.house_type.value,
    house_active_level: form.house_active_level.value,
    people_in_home: form.people_in_home.value,
    children_in_home: form.children_in_home.value,
    yard_type: form.yard_type.value,
    accomodation_picture: form.accomodation_picture.files
  };

  console.log(profileInfo, caretakerInfo);
}