"use strict";

onReady(() => {
  // Do things on load!
  appendTimelines();

  let cards = document.querySelectorAll(".timeline.card");
});

async function appendTimelines() {
  let data = await fetch("/timeline/caretaker").then(async res => {
    return JSON.parse(await res.text());
  });

  for (let i = 0; i < data.length; i++) {
    console.log(data[i]);
    document.querySelector("main").appendChild(createTimelineCard(data[i]));
  }
}

async function createTimelineCard(timeline) {
  let template = document.getElementById("timeline_template");
  let newTimeline = template.content.cloneNode(true);
  
  newTimeline.id = timeline.pet_id;
  let petData = await fetch(`/petData/${timeline.pet_id}`).then(async res => {
    return JSON.parse(await res.text());
  });
  newTimeline.querySelector(".pet_name").innerText = petData.name;
  // newTimeline.querySelector(".status").innerText = ""; 
  
  return newTimeline
}