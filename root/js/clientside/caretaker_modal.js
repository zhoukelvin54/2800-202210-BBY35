function showModal() {
    document.getElementById('edit_caretaker_modal').style.display = 'block';
}
document.querySelector('.cancel').onclick = function hideModal() {
    document.getElementById('edit_caretaker_modal').style.display = 'none';
}

const form = document.forms.caretaker_details_form;
form.addEventListener("submit", handleForm);

function handleForm(e) {
    e.preventDefault();
    try {
        let caretakerData = getCaretakerData();
        updateCaretakerInfo(caretakerData);

    } catch (err) {
        document.getElementById("info_error_message").innerText = err;
        return;
    }
}

function updateCaretakerInfo(data) {
    fetch("/update-caretaker-info", {
        method: "PUT",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(async res => {
        if (res.status == 200) {
            let data = await res.text();
            if (data) {
                let parsed = JSON.parse(data);
                if (parsed.status == "failure") {
                    console.error("Could not update caretaker information.");
                } else {
                    //console.log("Caretaker information updated");
                    window.location.assign("/home");
                }
            }
        }
    }).catch(err => {
        throw err;
    });
}

function getCaretakerData() {
    let caretakerInfo = {
        animal_affection: form.animal_affection.value,
        experience: form.experience.value.trim(),
        allergies: form.allergies.value.trim(),
        other_pets: form.other_pets.value.trim(),
        busy_hours: form.busy_hours.value.trim(),
        house_type: form.house_type.value,
        house_active_level: form.house_active_level.value,
        people_in_home: form.people_in_home.value,
        children_in_home: form.children_in_home.value,
        yard_type: form.yard_type.value,
        accomodation_picture: form.accomodation_picture.files
    };

    let requiresValidation = ["experience", "allergies", "other_pets", "busy_hours"];
    for (let i; i < requiresValidation.length; i++) {
        if (caretakerInfo[requiresValidation[i]] == "") {
            throw "Please fill out all form fields.";
        }
    }
    return caretakerInfo;
}