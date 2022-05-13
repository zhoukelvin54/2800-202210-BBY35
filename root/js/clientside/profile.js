/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";

let l = ["input","span"];

document.addEventListener("DOMContentLoaded", () => {
  let swappableElements = [document.getElementById("username"), document.getElementById("first_name"), document.getElementById("last_name")];
  for (let i = 0; i < swappableElements.length; i++) {
    // swappableElements[i].addEventListener("click", changeElementType(swappableElements[i], "input"));
  }
});

function changeElementType(element, newType) {
  if (!element || !newType) {
    throw "Invalid params: " + element + newType;
  }

  let newElement = document.createElement(newType);
  newElement.innerHTML = element.innerHTML;

  // Copy ID and ClassList, alternatively implement function to get all attributes
  newElement.classList = element.classList;
  newElement.id = element.id;
  

  element.parentNode.replaceChild(newElement, element);
}

function swapSpanToInput(element) {
  if (!element) throw "Invalid param: " + element;
  let input = document.createElement("input");
  input.value = element.textContent;
  input.classList = element.classList;

  element.parentNode.replaceChild(input, element);
}

function swapInputToSpan(element) {
  if (!element) throw "Invalid param: " + element;
  let span = document.createElement("span");
  span.textContent = element.value;
  span.classList = element.classList;

  element.parentNode.replaceChild(span, element);
}