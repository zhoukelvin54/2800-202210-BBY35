onReady(async () => {
  // Get the data for specific type of user?
  try {
    console.log(await getOwnerPets());
  } catch (error) {
    try {
      console.log(await getCaretakerPets());
    } catch (error) {
      console.error("Could not get owner or caretaker pets!");
    }
  }
});

/**
 * Gets the pet data for the currently logged in pet owner.
 * @throws Status of server response (success, failure)
 */
async function getOwnerPets() {
  fetch("/petData", {
    method: "GET"
  }).then(async response => {
    if (response.status == 200) {
      let data = await response.text();
      return JSON.parse(data);
    } else {
      console.error(response.status, response.statusText);
      throw response.status;
    }
  })
}

/**
 * Gets the pet data for the currently logged in caretaker.
 * @throws Status of server response (success, failure)
 */
 async function getCaretakerPets() {
  fetch("/petRequests", {
    method: "GET"
  }).then(async response => {
    if (response.status == 200) {
      let data = await response.text();
      return JSON.parse(data);
    } else {
      console.error(response.status, response.statusText);
      throw response.status;
    }
  })
}