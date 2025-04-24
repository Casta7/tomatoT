let pomodoro = {
  isRunning: false,
  durataFocusSecondi: null,
  durataPausaSecondi: null,
  isFocus: null,
  intervallo: null,
  tempoInizio: null,
  secondiRimanenti: null
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

 switch (message.action){
  case 'start':
    pomodoro.durataFocusSecondi = message.focus * 60;
    pomodoro.durataPausaSecondi = message.break * 60;
    pomodoro.tempoInizio = Date.now();
    pomodoro.secondiRimanenti = pomodoro.durataFocusSecondi;
    pomodoro.isFocus = true;
    pomodoro.isRunning = true;
    pomodoro.intervallo = setInterval(() => updateTimer(pomodoro), 1000);
    sendResponse({ status: "Timer avviato!" });
    break;
  case 'stop':
    clearInterval(pomodoro.intervallo);
    const tempoPassato = Math.floor((Date.now() - pomodoro.tempoInizio) / 1000);
    pomodoro.secondiRimanenti = (pomodoro.isFocus ? pomodoro.durataFocusSecondi : pomodoro.durataPausaSecondi) - tempoPassato;
    pomodoro.isRunning = false;
    pomodoro.intervallo = null;
    sendResponse({ status: "Timer fermato!", secondiRimanenti: pomodoro.secondiRimanenti });
    break; 
  case 'resume':
    pomodoro.secondiRimanenti = message.timer;
    pomodoro.isFocus = message.isFocus;
    pomodoro.tempoInizio =
      Date.now() -
      ((pomodoro.isFocus ? pomodoro.durataFocusSecondi : pomodoro.durataPausaSecondi) -
        pomodoro.secondiRimanenti) *
        1000;

    pomodoro.isRunning = true;
    pomodoro.intervallo = setInterval(() => updateTimer(pomodoro), 1000);
    sendResponse({ status: "Timer ripreso!" });
    break; 
  case 'reset':
    clearInterval(pomodoro.intervallo);
    pomodoro.isRunning = false;
    pomodoro.intervallo = null;
    pomodoro.secondiRimanenti = null;
    sendResponse({ status: "Timer resettato!" });
    break;
 }

  return true;
});

function updateTimer(p) {
  const tempoPassato = Math.floor((Date.now() - p.tempoInizio) / 1000);
  p.secondiRimanenti = (p.isFocus ? p.durataFocusSecondi : p.durataPausaSecondi) - tempoPassato;

  if (p.secondiRimanenti < 0) {
    if (p.isFocus) {
      p.secondiRimanenti = p.durataPausaSecondi;
      p.tempoInizio = Date.now();
      p.isFocus = false;
    } else {
      clearInterval(p.intervallo);
      p.intervallo = null;
      p.isRunning = false;

      notifica();
    }
  }

  chrome.runtime.sendMessage({
    action: "updateTimer",
    timer: p.secondiRimanenti,
    isFocus: p.isFocus,
    isRunning: p.isRunning
  });
}

function notifica() {
  chrome.notifications.create('', {
    type: 'basic',
    iconUrl: './assets/logo-removebg-preview.png',
    title: 'Pomodoro completato!',
    message: 'È il momento di fare una pausa 🍅',
    priority: 2
  });
}