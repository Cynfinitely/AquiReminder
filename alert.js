const sound = document.getElementById("alertSound");
const playBtn = document.getElementById("playSound");
const dismissBtn = document.getElementById("dismiss");
const snoozeBtn = document.getElementById("snooze");

function closeAlertWindow() {
  const fallback = () => window.close();
  if (typeof chrome !== "undefined" && chrome.windows?.getCurrent) {
    chrome.windows.getCurrent((win) => {
      if (win?.id && chrome.windows.remove) {
        chrome.windows.remove(win.id, fallback);
      } else {
        fallback();
      }
    });
  } else {
    fallback();
  }
}

function tryPlay() {
  sound.play().catch(() => {
    playBtn.classList.remove("hidden");
  });
}

playBtn.addEventListener("click", () => {
  sound.play().catch(() => {});
  playBtn.classList.add("hidden");
});

dismissBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "acknowledgeReminder" });
  closeAlertWindow();
});

snoozeBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "snoozeReminder" });
  closeAlertWindow();
});

(async () => {
  await initI18n();
  applyI18n();
  dismissBtn.focus();
  tryPlay();
})();
