let timerDisplay = document.querySelector(".timerDisplay");
let button1 = document.querySelector(".button1");
let intervallo;
let gif = document.querySelector(".gif");
let stopButton = document.querySelector(".stop");
let delButton = document.querySelector(".del");
let bc1 = document.querySelector(".button-container1");
let bc2 = document.querySelector(".button-container2");
let pauseImg = document.querySelector("#pauseImg");

let isRunning = false;
let isFocus = true;
let secondiRimanenti;
let durataFocusSecondi;
let durataPausaSecondi;
let tempoInizio;
let tempoSalvato = null; 

// Funzione per avviare il timer Pomodoro
function countdownPomodoro(focusTime, breakTime) {
  durataFocusSecondi = focusTime * 60;
  durataPausaSecondi = breakTime * 60;
  secondiRimanenti = durataFocusSecondi;
  isFocus = true;
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
      gif.src = "assets/contro.PNG";
      timerDisplay.innerHTML = `${Math.floor(durataPausaSecondi / 60)}m 00s <br> Pausa`;
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
    return;
  }

  let minuti = Math.floor(secondiRimanenti / 60);
  let secondi = secondiRimanenti % 60;
  timerDisplay.innerHTML = `${minuti}m ${secondi < 10 ? "0" : ""}${secondi}s <br> ${
    isFocus ? "Focus" : "Pausa"
  }`;
}

function stopTimer() {
  if (isRunning) {
    clearInterval(intervallo);
    isRunning = false;
    tempoSalvato = secondiRimanenti; 
    pauseImg.src = "./assets/play-buttton.png";
    pauseImg.alt = "Riprendi";
  } else {
    secondiRimanenti = tempoSalvato !== null ? tempoSalvato : (isFocus ? durataFocusSecondi : durataPausaSecondi);
    
    // 🛠️ Nuovo tempoInizio calcolato in base al tempo salvato
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
  bc1.style.visibility = "visible";
  bc2.style.visibility = "hidden";
  gif.src = "";
  timerDisplay.innerHTML = " ";
}

// Event listeners
button1.addEventListener("click", () => {
  if (!isRunning) {
    countdownPomodoro(25, 5); // esempio: 30 sec focus, 1 min pausa
  }
});

delButton.addEventListener("click", delTimer);
stopButton.addEventListener("click", stopTimer);
