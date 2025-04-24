let timerDisplay = document.querySelector(".timerDisplay");
let startButton25 = document.querySelector(".startButton25");
let startButton50 = document.querySelector(".startButton50");
let optionContainer = document.querySelector(".button-container2");
let startContainer = document.querySelector(".button-container1");
let stopButton = document.querySelector(".stop");
let delButton = document.querySelector(".del");
let pauseImg = document.querySelector("#pauseImg");
let gif = document.querySelector(".gif");

let isFocus = true;
let secondiRimanenti = 0;
let isRunning = false;

const breakPhoto = ["./assets/tel.PNG", "./assets/panino.PNG", "./assets/contro.PNG"];
const maxBreakPhotoIndex = breakPhoto.length - 1;
let photo;

// Funzioni Riutilizzabili

/**
 * Genera un numero casuale tra 0 e un massimo (incluso).
 * @returns {number} Un numero intero casuale.
 */
function getRandomPhoto() {
  return Math.floor(Math.random() * (maxBreakPhotoIndex + 1));
}

/**
 * Imposta la visibilità dei contenitori dei pulsanti.
 * @param {boolean} isRunning - Indica se il timer è in esecuzione.
 */
function setButtonVisibility(isRunning) {
  startContainer.style.display = isRunning ? "none" : "flex";
  optionContainer.style.display = isRunning ? "flex" : "none";
}

/**
 * Aggiorna l'icona del pulsante di stop/play.
 * @param {boolean} isRunning - Indica se il timer è in esecuzione.
 */
function updateStopButtonIcon(isRunning) {
  pauseImg.src = isRunning ? "./assets/pause.png" : "./assets/play.png"; // Corretto il nome dell'immagine
}

/**
 * Resetta l'interfaccia utente allo stato iniziale.
 */
function resetUI() {
  setButtonVisibility(false);
  timerDisplay.innerHTML = ""; // Resetta il timer display
  gif.src = "assets/logo-removebg-preview.png";
  isRunning = false;
  isFocus = true; // Resetta anche isFocus
}

/**
 * Aggiorna il display del timer.
 * @param {number} secondi - Il numero di secondi rimanenti.
 */
function updateTimerDisplay(secondi) {
  const minuti = Math.floor(secondi / 60);
  const secondiFormattati = secondi % 60 < 10 ? "0" + (secondi % 60) : secondi % 60;
  timerDisplay.innerHTML =`${minuti}m ${secondiFormattati}s <br> ${
    isFocus ? "Focus" : "Pausa"
  }`;
}

// Event Listeners

startButton25.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "start", focus: 0.6, break: 0.5 });
  setButtonVisibility(true);
  gif.src = "./assets/pomo.PNG";
  isRunning = true;
  photo = breakPhoto[getRandomPhoto()];
});

startButton50.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "start", focus: 50, break: 10 });
  setButtonVisibility(true);
  gif.src = "./assets/pomo.PNG";
  isRunning = true;
  photo = breakPhoto[getRandomPhoto()];
});

stopButton.addEventListener("click", () => {
  if (isRunning) {
    chrome.runtime.sendMessage({ action: "stop" });
    isRunning = false;
    updateStopButtonIcon(false);
    if (!isFocus) {
        gif.src = photo;
    }
  }
  else {
    chrome.runtime.sendMessage({
    action: "resume",
    timer: secondiRimanenti, 
    isFocus: isFocus
    });
    isRunning = true;
    updateStopButtonIcon(true);
  }
});

delButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "reset" });
  resetUI();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateTimer") {
    secondiRimanenti = message.timer;
    isFocus = message.isFocus; // Ottieni isFocus dal messaggio
    updateTimerDisplay(secondiRimanenti); // Passa i secondi da visualizzare

    if (message.isRunning) {
      setButtonVisibility(true);
      updateStopButtonIcon(true);
      if (!isFocus) {
        // Usa !isFocus per controllare più chiaramente
        gif.src = photo;
      } else {
        gif.src = "./assets/pomo.PNG";
      }
      isRunning = true;
    } else if (secondiRimanenti < 0 ) {
      resetUI(); // Usa la funzione di reset
    } else {
      setButtonVisibility(false);
      updateStopButtonIcon(false);
      isRunning = false;
    }
  }
});