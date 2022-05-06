ready(function () {
    console.log("Loaded script");
    function ajaxPost(url, cb, data) {
        let param = typeof data == "string" ? data : Object.keys(data).map(
            function (elem) {return encodeURIComponent(elem) + "=" + encodeURIComponent(data[elem]); }
        ).join('&');

        console.log("POST param: ", param);

        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                cb(this.responseText); 
            } else {
                console.log(this.status);
            }
        };
        xhr.open("POST", url);
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        xhr.send(param);
    }
    
        document.querySelector("#submit").addEventListener('click', function (e) {
            e.preventDefault();
            let username = document.getElementById("username");
            let password = document.getElementById("password");
            let queryStr = "username=" + username.value + "&password=" + password.value;
            //const vars = {"username": username, "password": password };

            ajaxPost('/login', function(data) {
                if (data) {
                    let parsed = JSON.parse(data);
                    console.log(parsed);
                    if (parsed.status == 'fail') {
                        document.getElementById("errorMsg");
                    } else {
                        window.location.replace("/profile");
                    }
                }
            }, queryStr);
        });
    });

function ready(cb) {
    if (document.readyState != "loading") {
        cb();
        console.log("ready completed");
    } else {
        document.addEventListener("DOMContentLoaded", cb);
        console.log("evoked listener");
    }
}