onReady(() => {
  // Do things on load!
});

async function appendTimelines() {
  let timelines = await fetch("/timeline/caretaker");
  
  for (let i; i < timelines.length; i++) {
    document.querySelector("main").appendChild(createTimelineCard(timelines[i]));
  }
}

function createTimelineCard(timeline) {
  // TODO construct timeline card from page template
  console.log(timeline);
}