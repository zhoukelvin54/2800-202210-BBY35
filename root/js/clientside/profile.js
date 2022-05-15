/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";
let swappableElements = document.querySelectorAll(".editable");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("save_profile").addEventListener("click", updateProfile);

  for (let i = 0; i < swappableElements.length; i++) {
    swappableElements[i].addEventListener("click", e => {swapSpanToInput(e.target)});
  }
});

function swapEditableSpan(element) {
  if (!element) throw "Invalid param: " + element;
  if (element.tagName == "INPUT") {
    swapInputToSpan(element);
  } else if (element.tagName == "SPAN") {
    swapSpanToInput(element);
  }
}

function swapSpanToInput(element) {
  if (!element) throw "Invalid param: " + element;
  if(element.tagName != "SPAN") return;

  let input = document.createElement("input");
  input.value = element.textContent;
  input.classList = element.classList;
  input.id = element.id;

  element.parentNode.replaceChild(input, element);
  swappableElements = document.querySelectorAll(".editable")
}

function swapInputToSpan(element) {
  if (!element) throw "Invalid param: " + element;
  if (element.tagName != "INPUT") return;

  let span = document.createElement("span");
  span.textContent = element.value;
  span.classList = element.classList;
  span.id = element.id;

  element.parentNode.replaceChild(span, element);
  swappableElements = document.querySelectorAll(".editable")
}

// ============================================================================
// Sends profile information update request from the form.
// ============================================================================
async function updateProfile() {
  await fetch("/update-profile", { 
    method: "PUT",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(getProfileData())
  }).then(
    () => {
      for (let i = 0; i < swappableElements.length; i++) {
        swapInputToSpan(swappableElements[i]);
      }
    }
  ).catch(err => {
    throw err;
  });
}

function getProfileData() {
  document.querySelectorAll("input[type='text'], input[type='password']").forEach(element => {
    console.log(element.id);
  });
  return {
    username: document.getElementById("username").value.trim(),
    firstname: document.getElementById("first_name").value.trim(),
    lastname: document.getElementById("last_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("new_password").value.trim()
  }
}