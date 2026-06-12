const sound = document.getElementById("alertSound");
const playBtn = document.getElementById("playSound");
const dismissBtn = document.getElementById("dismiss");

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

dismissBtn.addEventListener("click", closeAlertWindow);

tryPlay();
