/* jshint esversion: 8 */
/* jshint browser: true */
var pets;

onReady(async () => {
  // Try getting owner data
  try {
    pets = await getOwnerPets();
    if(pets.length > 0) {
      pets.forEach(pet => {
        document.querySelector("main").appendChild(createTimeline(pet));
      });
    }
  } catch (error) {
    // Not pet owner, get caretaker data
    try {
      pets = await getCaretakerPets();
      if(pets.length > 0) {
        pets.forEach(pet => {
          document.querySelector("main").appendChild(createTimeline(pet));
        });
      }
    } catch (error) {
      console.error("Could not get owner or caretaker pets!");
    }
  }
});

/**
 * Gets the pet data for the currently logged in pet owner.
 * @throws Status of server response
 */
async function getOwnerPets() {
  return fetch("/petData", {
    method: "GET"
  }).then(async response => {
    if (response.status == 200) {
      let data = JSON.parse(await response.text());
      if(data.status == "failure") throw "Not an owner!";
      else return data;
    } else {
      console.error(response.status, response.statusText);
      throw response.status;
    }
  });
}

/**
 * Gets the pet data for the currently logged in caretaker.
 * @throws Status of server response
 */
 async function getCaretakerPets() {
  return fetch("/petRequests", {
    method: "GET"
  }).then(async response => {
    if (response.status == 200) {
      let data = JSON.parse(await response.text());
      if(data.status == "failure") throw "Not a caretaker!";
      else return data;
    } else {
      console.error(response.status, response.statusText);
      throw response.status;
    }
  });
}

/**
 * Creates a timeline from a provided pets data.
 * @returns Node containing the timeline elements for a specific pet.
 */
function createTimeline(pet) {
  let rowTemplate = document.getElementById("timeline_row_template"); // Change to template.timeline_row eventually
  let row = rowTemplate.content.cloneNode(true);
  row.querySelector("#PET_ID").id = pet.id;
  row.querySelector(".pet_name").innerText = pet.name.charAt(0).toUpperCase() + pet.name.substring(1);
  row.querySelector(".species").innerText = pet.species;
  window.__tinyEditor.transformToEditor(row.querySelector(".card .create_post"));
  
  return row;
}

/**
 * Adds the targeted editor post to the relevant timeline.
 * @param {*} e TODO use event target to find injected timeline id.
 */
function createPost(e) {
  // Get post contents and other variables
  let data = {
    "timeline_id": 6,                   // Get timeline id from post row?
    "post_date": Date("18/05/2022"),    // Figure out date to SQL date conversion
    "photo_url": null,                  // Get uploaded photo url from page
    "contents": "Aha a new post!"
  };

  fetch("/addPost", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    let parsedData = JSON.parse(await response.text());
    if (parsedData.status == "error") {
      console.error("Unable to add post!");
    } else {
      console.log("Post was added!");
    }
  });
}