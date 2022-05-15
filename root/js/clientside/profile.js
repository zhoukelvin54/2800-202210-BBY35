/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";
let swappableElements;

document.addEventListener("DOMContentLoaded", () => {
  swappableElements = document.querySelectorAll(".editable");
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
  document.getElementById(element.id).focus();
  swappableElements = document.querySelectorAll(".editable")
  for (let i = 0; i < swappableElements.length; i++) {
    swappableElements[i].addEventListener("click", e => {swapSpanToInput(e.target)});
  }
}

function swapInputToSpan(element) {
  if (!element) throw "Invalid param: " + element;
  if (element.tagName != "INPUT") return;

  let span = document.createElement("span");
  span.textContent = element.value;
  span.classList = element.classList;
  span.id = element.id;
  
  element.parentNode.replaceChild(span, element);
  document.getElementById(element.id).addEventListener("click", e => {swapSpanToInput(e.target)});
  swappableElements = document.querySelectorAll(".editable");
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
  }).then( async res => {
      if (res.status == 200) {
        document.querySelectorAll("input.editable").forEach(element => {
          swapInputToSpan(element); 
        });
      } else {
        let data = await res.text();
        if (data) {
          let parsed = JSON.parse(data);
          if (parsed.status == "failure") {
            document.getElementById("response_message").innerText = parsed.msg;
          } else {
            document.getElementById("response_message").innerText = "Profile Updated.";
          }
        }
      }
      
    }
  ).catch(err => {
    document.getElementById("response_message").innerText = err;
  });
}

function getProfileData() {
  let data = {};

  document.querySelectorAll("input.editable, input[type='password']").forEach(element => {
    data[element.id] = element.value.trim();
  });

  return {
    username: data.username,
    firstname: data.first_name,
    lastname: data.last_name,
    email: data.email,
    // password: data.new_password
  }
}