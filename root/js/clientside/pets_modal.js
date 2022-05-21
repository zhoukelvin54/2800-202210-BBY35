function showModal() {
    document.getElementById('add_pet_modal').style.display = 'block';
}
document.querySelector('.cancel').onclick = function hideModal() {
    document.getElementById('add_pet_modal').style.display = 'none';
}

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
    for (const sexButton of sexButtons) {
        if (sexButton.checked) {
            var selectedSex = sexButton.value;
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
        .then(res => {pet_url = res.url;
             //console.log(res.url);
        })
        .catch(err => {
            console.error(err);
            throw err;
        });

    //console.log(pet_url);

    return {
        pet_name: form["pet_name"].value,
        pet_sex: selectedSex,
        pet_species: form["pet_species"].value,
        pet_description: form["pet_description"].value,
        pet_picture: pet_url
    }
}

async function updatePetInfo() {
    let petData = await getPetData();
    await fetch("/update-pet", {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            "name": petData.pet_name,
            "gender": petData.pet_sex,
            "species": petData.pet_species,
            "description": petData.pet_description,
            "photo_url": petData.pet_picture
        })
    }).then(async res => {
        if (res.status == 200) {
            let data = await res.text();
            //console.log(data);
            if (data) {
                let parsed = JSON.parse(data);
                if (parsed.status == "failure") {
                    //console.log("error");
                } else {
                    //("success");
                    window.location.assign("/home");
                }
            }
        }
    }).catch(err => {
        console.err(err);
    });
}