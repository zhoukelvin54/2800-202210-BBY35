onReady(() => {
  // Get the data for specific type of user?
});

/**
 * Gets the pet data for the currently logged in pet owner.
 */
async function getOwnerPets() {
  fetch("/petData", {
    method: "GET"
  }).then(async response => {
    if (response.status == 200) {
      let data = await response.text();
      return JSON.parse(data);
    } else {
      console.error(response.status, response.statusText)
    }
  }).catch(error => {
    console.error(error);
  });
}

/**
 * Gets the pet data for the currently logged in caretaker.
 * TODO: GET THE CARETAKER ENDPOINT
 */
 async function getCaretakerPets() {
  fetch("/petData", {
    method: "GET"
  }).then(async response => {
    if (response.status == 200) {
      let data = await response.text();
      return JSON.parse(data);
    } else {
      console.error(response.status, response.statusText)
    }
  }).catch(error => {
    console.error(error);
  });
}