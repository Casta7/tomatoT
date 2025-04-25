let pomodoro = {
  isRunning: false,
  durataFocusSecondi: null,
  durataPausaSecondi: null,
  isFocus: null,
  intervallo: null,
  tempoInizio: null,
  secondiRimanenti: null,
};

function startTimer(focusMin, breakMin) {
  clearInterval(pomodoro.intervallo);
  pomodoro.durataFocusSecondi = focusMin * 60;
  pomodoro.durataPausaSecondi = breakMin * 60;
  pomodoro.secondiRimanenti = pomodoro.durataFocusSecondi;
  pomodoro.tempoInizio = Date.now();
  pomodoro.isFocus = true;
  pomodoro.isRunning = true;
  updateTimer(pomodoro);
  pomodoro.intervallo = setInterval(() => updateTimer(pomodoro), 1000);
}

function stopTimer() {
  clearInterval(pomodoro.intervallo);
  const tempoPassato = Math.floor((Date.now() - pomodoro.tempoInizio) / 1000);
  pomodoro.secondiRimanenti = (pomodoro.isFocus
    ? pomodoro.durataFocusSecondi
    : pomodoro.durataPausaSecondi) - tempoPassato;
  pomodoro.isRunning = false;
  pomodoro.intervallo = null;
  pomodoro.tempoInizio = null;
}

function resumeTimer(timer, focus) {
  pomodoro.secondiRimanenti = timer;
  pomodoro.isFocus = focus;
  pomodoro.tempoInizio =
    Date.now() -
    ((pomodoro.isFocus
      ? pomodoro.durataFocusSecondi
      : pomodoro.durataPausaSecondi) -
      pomodoro.secondiRimanenti) *
    1000;
  pomodoro.isRunning = true;
  updateTimer(pomodoro);
  pomodoro.intervallo = setInterval(() => updateTimer(pomodoro), 1000);
}

function resetTimer() {
  clearInterval(pomodoro.intervallo);
  pomodoro.isRunning = false;
  pomodoro.intervallo = null;
  pomodoro.secondiRimanenti = null;
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (chrome.runtime.lastError) {
    // Popup chiuso? Nessun problema.
    console.warn("Ignorato errore: ", chrome.runtime.lastError.message);
    return;
  }

  switch (message.action) {
    case "start":
      startTimer(message.focus, message.break);
      sendResponse({ status: "Timer avviato!" });
      break;
    case "stop":
      stopTimer();
      sendResponse({
        status: "Timer fermato!",
        secondiRimanenti: pomodoro.secondiRimanenti,
      });
      break;
    case "resume":
      resumeTimer(message.timer, message.isFocus);
      sendResponse({ status: "Timer ripreso!" });
      break;
    case "reset":
      resetTimer();
      sendResponse({ status: "Timer resettato!" });
      break;
    case "getState":
      sendResponse({
        isRunning: pomodoro.isRunning,
        isFocus: pomodoro.isFocus,
        secondiRimanenti: pomodoro.secondiRimanenti,
        tempoInizio: pomodoro.tempoInizio,
        durataFocusSecondi: pomodoro.durataFocusSecondi,
        durataPausaSecondi: pomodoro.durataPausaSecondi,
      });
      break;
    default:
      console.warn("Azione sconosciuta:", message.action);
      break;
  }

  return true;
});

function updateTimer(p) {
  const tempoPassato = Math.floor((Date.now() - p.tempoInizio) / 1000);
  p.secondiRimanenti = (p.isFocus ? p.durataFocusSecondi : p.durataPausaSecondi) - tempoPassato;

  const durataTotale = p.durataFocusSecondi + p.durataPausaSecondi; // Calcola la durata totale
  const secondiTrascorsi = p.isFocus ? tempoPassato : tempoPassato + p.durataFocusSecondi; //secondi trascorsi

  // Correzione qui: Passa anche la durataTotale a updateProgressBar
  chrome.runtime.sendMessage({
    action: "updateTimer",
    timer: p.secondiRimanenti,
    isFocus: p.isFocus,
    isRunning: p.isRunning,
    durataTotale: durataTotale, // Passa la durata totale
    secondiTrascorsi: secondiTrascorsi,

  });

  if (p.secondiRimanenti < 0) {
    if (p.isFocus) {
      p.secondiRimanenti = p.durataPausaSecondi;
      p.tempoInizio = Date.now();
      p.isFocus = false;
    } else {
      clearInterval(p.intervallo);
      notifica();
      p.intervallo = null;
      p.isRunning = false;
      chrome.runtime.sendMessage({ action: "timerFinished" });
    }
  }
}

function notifica() {
  chrome.notifications.create("", {
    type: "basic",
    iconUrl: "./assets/logo-removebg-preview.png",
    title: "Pomodoro completato!",
    message: "È il momento di fare una pausa 🍅",
    priority: 2,
  });
}