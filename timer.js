let countdown;
let remainingSeconds;

function startTimer() {
    const minutes = document.getElementById("minutes").value;

    if (minutes === "" || minutes <= 0) {
        alert("Invalid input for minutes");
        return;
    }

    document.getElementById("reset").style.display = "inline";

    remainingSeconds = Math.floor(minutes * 60);
    displayTime(remainingSeconds);

    countdown = setInterval(() => {
        remainingSeconds--;
        displayTime(remainingSeconds);

        if (remainingSeconds === 0) {
            clearInterval(countdown);
            alert("Times Up");
        }
    }, 1000);
}

function displayTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    document.getElementById("timer").textContent = `${min}:${sec}`;
}

function resetTimer() {
    clearInterval(countdown);
    document.getElementById("minutes").value="";
    document.getElementById("reset").style.display= "none";
    document.getElementById("timer").textContent= "00:00";
}