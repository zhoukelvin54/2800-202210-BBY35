/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";
let swappableElements;

document.addEventListener("DOMContentLoaded", () => {
  getDatabaseData();
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
// Password swap
// ============================================================================
function swapButtonToInput(e) {
  let attributes = {
    type: "password",
    name: "new_password",
    id: "new_password",
    placeholder: "New Password"
  };

  let pwInput = document.createElement("input");
  for (let [key, value] of Object.entries(attributes)) {
    pwInput.setAttribute(key, value);
  }

  e.target.replaceWith(pwInput);

  pwInput.addEventListener("keyup", async (e) => {
    if (e.key == "Enter") {
      let pwButton = document.createElement("button");
      pwButton.setAttribute("onclick", "swapButtonToInput()");
      pwButton.innerHTML = "Change Password?";
      let password = pwInput.value;
      e.target.replaceWith(pwButton);

      fetch("/update-profile", {
        method: "PUT",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          "password": password
        })
      }).then(async res => {
        if (res.status == 200) {
          let data = await res.text();
          if (data) {
            let parsedData = JSON.parse(data);
            if (parsedData.status == "success") {
              document.getElementById("response_message").innerText = parsedData.msg;
            } else {
              document.getElementById("response_message").innerText = parsedData.msg;
            }
          }
        }
      }).catch(err => {
        console.error(err);
      })
    }
  })
}

// ============================================================================
// Gets the updated database profile data to update the page on load
// ============================================================================
async function getDatabaseData() {

  let neededProfileData = {
    username: "nothing",
    firstname: "nothing",
    lastname: "nothing",
    email: "nothing",
    profile_photo_url: "nothing"
  }

  await fetch("/get-profile", {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(neededProfileData)
  }).then(async res => {
    let data = await res.text();
    if (data) {
      let parsedData = JSON.parse(data);
      console.log(parsedData);
      fetch("/get-profile", {
        method: "GET",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(parsedData)
      }).catch(err => {
        document.getElementById("response_message").innerText = err;
      });
  }
  }).catch(err => {
    document.getElementById("response_message").innerText = err;
  });
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