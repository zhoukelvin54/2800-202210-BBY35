"use strict";

onReady(appendPosts);

/**
 * Fetches the posts then appends each card for each post.
 */
async function appendPosts() {
  let data = await fetch(`/API/timeline/posts/${window.location.href.split("/").pop()}`).then(async res => {
    return JSON.parse(await res.text());
  });

  for (let i = 0; i < data.length; i++) {
    console.log(data[i]);
    document.querySelector("main").appendChild(await createPostCard(data[i]));
  }
}


/**
 * Creates a new post card and inserts its information
 * @param { JSON } post 
 * @returns new post card
 */
async function createPostCard(post) {
  let template = document.getElementById("post_template");
  let newPost = template.content.cloneNode(true);
  let card = newPost.firstElementChild;
  
  card.id = post.post_id;
  let photo = post.photo_url ? post.poster_id + "/" + post.photo_url : "dog_1.jpg";
  card.querySelector(".photo_container").innerHTML = `<img src="/img/uploads/${photo}" alt="Pet photo"/>`;
  card.querySelector(".post_content").innerHTML = post.contents;
  card.querySelector(".date_posted").innerText = post.post_date;

  return newPost;
}