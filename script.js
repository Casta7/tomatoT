let timerDisplay = document.querySelector(".timerDisplay");
let button1 = document.querySelector(".button1");
let button2 = document.querySelector(".button2"); 
let intervallo;
let gif = document.querySelector(".gif");
let stopButton = document.querySelector(".stop");
let delButton = document.querySelector(".del");
let bc1 = document.querySelector(".button-container1");
let bc2 = document.querySelector(".button-container2");
let pauseImg = document.querySelector("#pauseImg");

let photos = ["./assets/panino.PNG", "./assets/tel.PNG", "./assets/contro.PNG"]

function randomBetweenZeroAndN(n) {
  return Math.floor(Math.random() * (n + 1));
}


let isRunning = false;
let isFocus = true;
let secondiRimanenti;
let durataFocusSecondi;
let durataPausaSecondi;
let tempoInizio;
let tempoSalvato = null;
let cicliRimanenti = 0; // 🆕 Per cicli multipli

// Funzione per avviare il timer Pomodoro con cicli multipli
function countdownPomodoro(focusTime, breakTime, cicli = 1) {
  durataFocusSecondi = focusTime * 60;
  durataPausaSecondi = breakTime * 60;
  secondiRimanenti = durataFocusSecondi;
  isFocus = true;
  cicliRimanenti = cicli;

  pauseImg.src = "./assets/pause.png";
  tempoInizio = Date.now();
  isRunning = true;

  bc1.style.visibility = "hidden";
  bc2.style.visibility = "visible";
  gif.src = "./assets/pomo.PNG";

  intervallo = setInterval(updateTimer, 100);
}

// Funzione per aggiornare il timer
function updateTimer() {
  let tempoPassato = Math.floor((Date.now() - tempoInizio) / 1000);
  secondiRimanenti = (isFocus ? durataFocusSecondi : durataPausaSecondi) - tempoPassato;

  if (secondiRimanenti < 0) {
    if (isFocus) {
      secondiRimanenti = durataPausaSecondi;
      isFocus = false;
      gif.src = photos[randomBetweenZeroAndN(2)];
      timerDisplay.innerHTML = `${Math.floor(durataPausaSecondi / 60)}m 00s <br> Pausa`;
      tempoInizio = Date.now();
    } else {
      cicliRimanenti--;
      if (cicliRimanenti > 0) {
        secondiRimanenti = durataFocusSecondi;
        isFocus = true;
        gif.src = "./assets/pomo.PNG";
        timerDisplay.innerHTML = `${Math.floor(durataFocusSecondi / 60)}m 00s <br> Focus`;
        tempoInizio = Date.now();
      } else {
        clearInterval(intervallo);
        intervallo = null;
        isRunning = false;
        pauseImg.src = "./assets/play-buttton.png";
        pauseImg.alt = "Riprendi";
        timerDisplay.innerHTML = "Ciclo completato!";
        bc1.style.visibility = "visible";
        bc2.style.visibility = "hidden";
      }
    }
    return;
  }

  let minuti = Math.floor(secondiRimanenti / 60);
  let secondi = secondiRimanenti % 60;
  timerDisplay.innerHTML = `${minuti}m ${secondi < 10 ? "0" : ""}${secondi}s <br> ${
    isFocus ? "Focus" : "Pausa"
  } ${cicliRimanenti}x`;
}

// Funzione per fermare o riprendere il timer
function stopTimer() {
  if (isRunning) {
    clearInterval(intervallo);
    isRunning = false;
    tempoSalvato = secondiRimanenti;
    pauseImg.src = "./assets/play-buttton.png";
    pauseImg.alt = "Riprendi";
  } else {
    secondiRimanenti = tempoSalvato !== null ? tempoSalvato : (isFocus ? durataFocusSecondi : durataPausaSecondi);
    tempoInizio = Date.now() - ((isFocus ? durataFocusSecondi : durataPausaSecondi) - secondiRimanenti) * 1000;

    isRunning = true;
    tempoSalvato = null;
    pauseImg.src = "./assets/pause.png";
    pauseImg.alt = "Pausa";
    intervallo = setInterval(updateTimer, 100);
  }
}

// Funzione per eliminare il timer
function delTimer() {
  clearInterval(intervallo);
  intervallo = null;
  isRunning = false;
  tempoSalvato = null;
  cicliRimanenti = 0;
  bc1.style.visibility = "visible";
  bc2.style.visibility = "hidden";
  gif.src = "";
  timerDisplay.innerHTML = " ";
}

// Event listeners
button1.addEventListener("click", () => {
  if (!isRunning) {
    countdownPomodoro(25, 5, 1); // 1 ciclo 25/5 classico
  }
});

button2.addEventListener("click", () => {
  if (!isRunning) {
    countdownPomodoro(50, 10, 1); // 2 cicli da 25/5
  }
});

delButton.addEventListener("click", delTimer);
stopButton.addEventListener("click", stopTimer);
