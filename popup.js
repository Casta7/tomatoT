const timerDisplay = document.querySelector(".timerDisplay");
const startButtons = document.querySelectorAll(".startButton25, .startButton50");
const optionContainer = document.querySelector(".button-container2");
const startContainer = document.querySelector(".button-container1");
const stopButton = document.querySelector(".stop");
const delButton = document.querySelector(".del");
const pauseImg = document.querySelector("#pauseImg");
const gif = document.querySelector(".gif");
const progressBar = document.querySelector(".progress-bar");
const progressBarConttainer = document.querySelector(".progress-container");

// === Stato UI ===
let isFocus = true;
let isRunning = false;
let secondiRimanenti = 0;
let durataTotale = 0; //aggiunto

const breakPhotos = ["assets/giphy-unscreen.gif"];
let breakPhoto = breakPhotos[Math.floor(Math.random() * breakPhotos.length)];

// === Utility ===
const formatTime = (secondi) => {
  const minuti = Math.floor(secondi / 60);
  const secondiFormattati =
    secondi % 60 < 10 ? "0" + (secondi % 60) : secondi % 60;
  return `${minuti}m ${secondiFormattati}s`;
};

const updateTimerDisplay = (secondi) => {
  timerDisplay.innerHTML = `<h2> ${formatTime(secondi)} </h2> <span> ${
    isFocus ? "Focus" : "Pausa"
  } </span>`;
};

function updateProgressBar(secondiRimanenti, durataTotale) {
  // Calcoliamo la percentuale di tempo passato
  let percentuale = (1 - secondiRimanenti / durataTotale) * 100;

  // Se la percentuale è maggiore di 100, impostiamo 100 per evitare che la barra vada oltre
  if (percentuale > 100) percentuale = 100;

  // Se la percentuale è inferiore a 0, la impostiamo a 0 (per evitare valori negativi)
  if (percentuale < 0) percentuale = 0;

  // Selezioniamo la progress bar e aggiorniamo la larghezza
  progressBar.style.width = `${percentuale}%`;
}

const setButtonVisibility = (visible) => {
  startContainer.style.display = visible ? "none" : "flex";
  optionContainer.style.display = visible ? "flex" : "none";
  progressBarConttainer.style.display = visible ? "flex" : "none";
};

const updateGif = () => {
  gif.src = isRunning
    ? isFocus
      ? "./assets/9aa4048e9dd2d6474d3288a034505d-unscreen.gif"
      : breakPhoto
    : "./assets/logo-removebg-preview.png";
};

const updateStopButtonIcon = () => {
  pauseImg.src = isRunning ? "./assets/pause.png" : "./assets/play.png";
};

const resetUI = () => {
  isFocus = true;
  isRunning = false;
  secondiRimanenti = 0;
  timerDisplay.innerHTML = "";
  updateGif();
  setButtonVisibility(false);
  updateStopButtonIcon();
  progressBar.style.width = "0%";
  progressBarConttainer.style.display = "none" //reset progress bar
};

// === Eventi ===

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ action: "getState" }, (response) => {
    if (!response) return;

    isRunning = response.isRunning;
    isFocus = response.isFocus;
    secondiRimanenti = response.secondiRimanenti || 0;
    durataTotale = isFocus ? response.durataFocusSecondi : response.durataPausaSecondi; //prendo durata totale

    if (response.tempoInizio && isRunning) {
      const elapsed = Math.floor((Date.now() - response.tempoInizio) / 1000);
      const durata = isFocus
        ? response.durataFocusSecondi
        : response.durataPausaSecondi;
      secondiRimanenti = durata - elapsed;
    }

    if (secondiRimanenti > 0) updateTimerDisplay(secondiRimanenti);
    updateProgressBar(secondiRimanenti, durataTotale); //aggiunto
    setButtonVisibility(isRunning || secondiRimanenti > 0);
    updateStopButtonIcon();
    updateGif();
  });
});

startButtons.forEach((button) =>
  button.addEventListener("click", () => {
    const focus = button.classList.contains("startButton25") ? 0.6 : 50;
    const pause = button.classList.contains("startButton25") ? 0.5 : 10;

    chrome.runtime.sendMessage({ action: "start", focus: focus, break: pause });
    isRunning = true;
    isFocus = true; //aggiunto
    durataTotale = focus * 60; //imposto la durata totale
    breakPhoto = breakPhotos[Math.floor(Math.random() * breakPhotos.length)];
    setButtonVisibility(true);
    gif.src = "./assets/9aa4048e9dd2d6474d3288a034505d-unscreen.gif";
  })
);

stopButton.addEventListener("click", () => {
  if (isRunning) {
    chrome.runtime.sendMessage({ action: "stop" });
    isRunning = false;
  } else {
    chrome.runtime.sendMessage({
      action: "resume",
      timer: secondiRimanenti,
      isFocus,
    });
    isRunning = true;
  }
  updateStopButtonIcon();
});

delButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "reset" });
  resetUI();
});

chrome.runtime.onMessage.addListener((message) => {
  

  if (message.action === "timerFinished") {
    resetUI(); // Reset GUI quando il timer finisce
  }

  if(message.action === "updateTimer"){
    secondiRimanenti = message.timer;
    isFocus = message.isFocus; 
    updateTimerDisplay(secondiRimanenti);
    updateProgressBar(message.durataTotale - message.secondiTrascorsi, message.durataTotale); // Usa la durataTotale dal messaggio
    setButtonVisibility(true);
    updateStopButtonIcon();
  }

  if(message.action === "changedStatus"){
    console.log("changed status")
    gif.src = breakPhoto;
    timerDisplay.innerHTML = `<h2> 0m 00s </h2> <span> focus </span>`;
  }

});
