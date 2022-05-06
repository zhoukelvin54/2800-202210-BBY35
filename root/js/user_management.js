'use strict';

document.addEventListener("DOMContentLoaded", () => {
  console.log("User management script loaded.");

  let userData = getUserData();
});

async function getUserData() {
  try {
    let response = await fetch("/userData", {
      method: 'GET',
      body: "SessionID" // TODO Insert actual session ID to verify current logged in user is in fact Admin
    });

    if (response.status = 200) {
      return JSON.parse(await response.text());
    } else {
      console.log(response.status);
      console.log(response.statusText);
    }
  } catch (error) {
    console.log(error);
  }
}