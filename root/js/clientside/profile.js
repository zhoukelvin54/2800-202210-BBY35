/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";
let swappableElements = [document.getElementById("username"), document.getElementById("first_name"), document.getElementById("last_name"), document.getElementById("email")];

document.addEventListener("DOMContentLoaded", () => {
  for (let i = 0; i < swappableElements.length; i++) {
    swappableElements[i].addEventListener("click", e => {swapEditableSpan(e.target)});
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
  let input = document.createElement("input");
  input.value = element.textContent;
  input.classList = element.classList;
  input.id = element.id;

  element.parentNode.replaceChild(input, element);
}

function swapInputToSpan(element) {
  if (!element) throw "Invalid param: " + element;
  let span = document.createElement("span");
  span.textContent = element.value;
  span.classList = element.classList;
  span.id = element.id;

  element.parentNode.replaceChild(span, element);
}