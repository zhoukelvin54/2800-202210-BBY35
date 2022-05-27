/* jshint esversion: 8 */
/* jshint browser: true */
"use strict";

onReady(() => {
  appendPosts();
  // Add events for uploading photo and post
  document.querySelector(".create_post .submit_post").addEventListener("click", submitPost);
});

/**
 * Fetches the posts then appends each card for each post.
 */
async function appendPosts() {
  let data = await fetch(`/API/timeline/posts/${window.location.href.split("/").pop()}`).then(async res => {
    return JSON.parse(await res.text());
  });

  for (let i = 0; i < data.length; i++) {
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
  let photo = post.photo_url ? post.photo_url : "dog_1.jpg";
  card.querySelector(".photo_container").innerHTML = `<img src="/img/uploads/${photo}" alt="Pet photo"/>`;
  card.querySelector(".post_content").innerHTML = post.contents;
  card.querySelector(".date_posted").innerText = "Post Date: " + post.post_date.split("T")[0] + " " +
    post.post_date.split("T")[1].split(".")[0];

  return newPost;
}

function findCard(element) {
  if (element.classList.contains("card")) {
    return element;
  } else {
    return findCard(element.parentElement);
  }
}

async function submitPost(e) {
  let editor = document.querySelector("[data-tiny-editor]");
  if(!editor.innerHTML.trim()) {
    document.querySelector(".create_post > .error_message").innerText = "Post must contain something!";
    return;
  }
  
  fetch("/addPost", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      timeline_id: window.location.href.split("/").pop(),
      post_date: Date.now(),
      photo_url: await uploadPhoto(),
      contents: editor.innerHTML
    })
  }).then(async res => {
    let data = JSON.parse(await res.text());
    if(data.status == "success") {
      location.reload();
    }
  }).catch(error => {
    console.error(error);
    throw error;
  });
}

async function uploadPhoto() {
  let photo = document.getElementById("post_photo").files[0];
  let photoURL;
  if (photo != null) {
    const formData = new FormData();

    formData.append("picture", photo);

    await fetch("/addPhoto", {
      method: "POST",
      body: formData
    }).then(res => res.json())
      .then(res => {
        photoURL = res.url;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }
  return photoURL;
}