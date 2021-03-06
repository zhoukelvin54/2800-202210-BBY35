// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint browser: true */
function showModal() {
    document.getElementById('add_pet_modal').style.display = 'block';
}
document.querySelector('.cancel').onclick = function hideModal() {
    document.getElementById('add_pet_modal').style.display = 'none';
};

const form = document.forms['pet_details_form'];

form.addEventListener("submit", handleForm);

function handleForm(e) {
    e.preventDefault();
    try {
        updatePetInfo();
        document.getElementById("add_pet_modal").style.display = "none";
    } catch (err) {
        document.getElementById("error_message").innerText = err;
        return;
    }
}

async function getPetData() {
    let sexButtons = document.querySelectorAll('input[name="pet_sex"]');
    var selectedSex;
    for (const sexButton of sexButtons) {
        if (sexButton.checked) {
            selectedSex = sexButton.value;
            break;
        }
    }

    var pet_url;
    let profile_picture = form.upload_pet_picture.files[0];
    const formData = new FormData();

    formData.append("picture", profile_picture);

    await fetch("/addPhoto", {
        method: "POST",
        body: formData
    }).then(res => res.json())
        .then(res => {
            pet_url = res.url;
        })
        .catch(err => {
            console.error(err);
            throw err;
        });

    return {
        pet_name: form["pet_name"].value,
        pet_sex: selectedSex,
        pet_species: form["pet_species"].value,
        pet_description: form["pet_description"].value,
        pet_picture: pet_url
    };
}

async function updatePetInfo() {
    let petData = await getPetData();
    await fetch("/update-pet", {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            "name": petData.pet_name.trim(),
            "gender": petData.pet_sex,
            "species": petData.pet_species.trim(),
            "description": petData.pet_description.trim(),
            "photo_url": petData.pet_picture
        })
    }).then(async res => {
        if (res.status == 200) {
            let data = await res.text();
            if (data) {
                let parsed = JSON.parse(data);
                if (parsed.status == "failure") {
                    console.error(parsed.status, parsed.msg);
                } else {
                    window.location.assign("/home");
                }
            }
        }
    }).catch(err => {
        console.err(err);
    });
}