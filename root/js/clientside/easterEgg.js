function myFunction() {
    document.getElementById("easterJS").innerHTML = "Team Members:<br>Jashanjot Singh<br>Angad Grewal<br>Dakaro Mueller<br>Kelvin Zhou";
}
var audio;
var clicks = 0;

document.getElementById("logo").addEventListener("click", function () {
    clicks += 1;
    if (clicks == 3) {
        var chosenValue = Math.random() < 0.5 ? 1 : 2;
        if (chosenValue == 1) {
            audio = new Audio('audio/catsounds.mp3');
            audio.play();
        } else {
            audio = new Audio('audio/dogsounds.mp3');
            audio.play();
        }    
        clicks = 0;
    }
});
