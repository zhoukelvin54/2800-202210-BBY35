// this file is for testing and example purposes and should be removed from dev/production once every form with img uploading is completed

const upLoadForm = document.getElementById("upload-images-form");
upLoadForm.addEventListener("submit", uploadImages);

function uploadImages(e) {
    e.preventDefault();

    const imageUpload = document.getElementById('image-upload');
    const formData = new FormData();

    formData.append("picture", imageUpload.files[0]);

    const options = {
        method: 'POST',
        body: formData,
    };

    fetch("/addphoto", options)
    .then(res => res.json()) // this returns a promise which has to become a JSON object before we can get the returned URL
    .then(res => console.log(res.url)) // this is the URL
    .catch(function(err) {("Error:", err)}
    );
}