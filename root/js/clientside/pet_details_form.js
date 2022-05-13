// used for validating the code with https://jshint.com/
/* jshint esversion: 8 */
/* jshint browser: true */
'use strict'
/*
ready(function () {
    document.getElementById("pet-details-form").addEventListener("submit", handleForm);
});
*/

function submitPetDetails() {
    const form = document.forms['pet-details-form'];
    let sexButtons = document.querySelectorAll('input[name="pet-sex"]');
    for (const sexButton of sexButtons) {
        if (sexButton.checked) {
            var selectedSex = sexButton.value;
            break;
        }
    }

    let profileInfo = {
        profile_picture: form["upload-profile-picture"].files[0],
        telephone: form["telephone"].value,
        address: (form["street-address"].value + ", "
        + form["region"].value + ", " + form["country"].value)
    }

    let petInfo = {
        pet_name: form["name"].value,
        pet_sex: selectedSex,
        pet_species: form["pet-species"].value,
        pet_description: form["pet-description"].value,
        pet_picture: form["upload-pet-picture"].files[0]
    }


    fetch("/update-proofile", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "profile_picture": profileInfo.profile_picture,
                "telephone": profileInfo.telephone,
                "address": profileInfo.address
            })
        }).then(async res => {
        if (res.status == 200) {
            let data = await res.text();
            console.log(data);
            if (data) {
                let parsed = JSON.parse(data);
                if (parsed.status == "failure") {
                    console.log("error");
                } else {
                    console.log("success");
                }
            }
        }
        }).catch(err => {
            console.err(err);
        });
    
}