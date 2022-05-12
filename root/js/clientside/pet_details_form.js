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
        street_address: form["street-address"].value,
        region: form["region"].value,
        country: form["country"].value
    }

    let petInfo = {
        pet_name: form["name"].value,
        pet_sex: selectedSex,
        pet_species: form["pet-species"].value,
        pet_description: form["pet-description"].value,
        pet_picture: form["upload-pet-picture"].files[0]
    }


    console.log(profileInfo);
    console.log(petInfo);

    try {
        let response = await fetch("/add-account", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "username": formData.username,
                "password": formData.password,
                "firstname": formData.firstname,
                "lastname": formData.lastname,
                "email": formData.email,
                "account_type": formData.account_type
            })
        });

        if (response.status == 200) {
            let data = await response.text();
            if (data) {
                let parsedData = JSON.parse(data);
                if (parsedData.status == "success") {
                    login(true);
                }   else {
                    document.getElementById("errorMsg").innerText = parsedData.msg;
                }
            }
        } else {
            console.error(response.status, response.statusText);
        }
    } catch (error) {
        console.error(error);
    }
}