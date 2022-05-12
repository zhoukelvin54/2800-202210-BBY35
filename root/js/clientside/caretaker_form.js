"use strict";

function submitCaretakerInfo() {
  let form = document.forms["user-creation-form"];
  let profileInfo = {
    profile_picture: form["upload-profile-picture"].files[0],
    telephone: form["telephone"].value,
    street_address: form["street-address"].value,
    region: form["region"].value,
    country: form["country"].value
  }

  let caretakerInfo = {
    animal_affection: form["animal-affection"].value,
    experience: form["experience"].value,
    allergies: form["allergies"].value,
    other_pets: form["other-pets"].value,
    busy_hours: form["busy-hours"].value,
    house_type: form["house-type"].value,
    house_active_level: form["house-active-level"].value,
    people_in_home: form["people-in-home"].value,
    children_in_home: form["children-in-home"].value,
    yard_type: form["yard-type"].value,
    accomodation_picture: form["accomodation-picture"].files
  }

  console.log(profileInfo, caretakerInfo);
}