/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";

onReady(async () => {
  await appendTimelines();

  let cards = document.querySelectorAll(".timeline.card");
  for (let i = 0; i < cards.length; i++) {
    cards[i].addEventListener("click", e => {
      let card = findCard(e.target);
      window.location.assign(`/timeline/overview/${card.id}`);
    });
  }
});

/**
 * Fetches the timelines then appends each card for each timeline.
 */
async function appendTimelines() {
  let data = await fetch("/timeline/caretaker").then(async res => {
    return JSON.parse(await res.text());
  });

  for (let i = 0; i < data.length; i++) {
    document.querySelector("main").appendChild(await createTimelineCard(data[i]));
  }
}

function findCard(element) {
  if (element.classList.contains("card")) {
    return element;
  } else {
    return findCard(element.parentElement);
  }
}

/**
 * Creates a timeline card and inserts its information
 * @param { JSON } timeline 
 * @returns new timeline card
 */
async function createTimelineCard(timeline) {
  let template = document.getElementById("timeline_template");
  let newTimeline = template.content.cloneNode(true);
  let card = newTimeline.firstElementChild;

  card.id = timeline.timeline_id;
  let petData = await fetch(`/getPetInfo/${timeline.pet_id}`).then(async res => {
    return JSON.parse(await res.text())[0];
  });
  let status = petData.status == 2 ? "In Queue" : petData.status == 1 ? "Away" : "Home";

  card.querySelector(".pet_name").innerText = petData.name;
  card.querySelector(".status").innerText = status;
  let dates = card.querySelectorAll(".timeline_date");
  if (dates.length > 0) {
    if (timeline.start_date) {
      dates[0].innerText = timeline.start_date.split("T")[0];
    }
    if (timeline.end_date) {
      dates[1].innerText = timeline.end_date.split("T")[0];
    }
  }

  let pet_img = document.createElement("img");
  pet_img.src = "/img/uploads/" + (petData.photo_url ? petData.photo_url : "dog_1.jpg");
  pet_img.alt = petData.name + " Photo";

  card.prepend(pet_img);

  return newTimeline;
}