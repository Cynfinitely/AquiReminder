const ALARM_ID = "alarm_001";
const MIN_MINUTES = 1;
const MAX_MINUTES = 480;

let countdownInterval = null;
let currentPeriodMinutes = null;

const inputEl = document.getElementById("id_Sec");
const setBtn = document.getElementById("id_Set");
const errorEl = document.getElementById("error");
const clearBtn = document.getElementById("id_Clear");
const intervalInfoEl = document.getElementById("intervalInfo");
const setReminderEl = document.getElementById("setReminder");
const remainingTimeEl = document.getElementById("remainingTime");
const presetChips = document.querySelectorAll(".chip");

function validateMinutes(value) {
  const minutes = parseInt(value, 10);
  if (isNaN(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
    return null;
  }
  return minutes;
}

function showSetUI() {
  setReminderEl.classList.remove("hidden");
  remainingTimeEl.classList.add("hidden");
  currentPeriodMinutes = null;
  stopCountdown();
  document.documentElement.style.setProperty("--progress", 0);
}

function showActiveUI(periodMinutes) {
  setReminderEl.classList.add("hidden");
  remainingTimeEl.classList.remove("hidden");
  currentPeriodMinutes = periodMinutes;
  if (periodMinutes) {
    intervalInfoEl.innerText = `Repeats every ${periodMinutes} minutes`;
  }
}

function formatRemaining(scheduledTime) {
  const ms = scheduledTime - Date.now();
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function updateProgressRing(scheduledTime, periodMinutes) {
  const period = periodMinutes || currentPeriodMinutes;
  if (!period) return;
  const totalMs = period * 60 * 1000;
  const remainingMs = Math.max(0, scheduledTime - Date.now());
  const progress = 1 - remainingMs / totalMs;
  document.documentElement.style.setProperty("--progress", progress);
}

function updateCountdown(scheduledTime, periodMinutes) {
  document.getElementById("time").innerText = formatRemaining(scheduledTime);
  updateProgressRing(scheduledTime, periodMinutes);
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function startCountdown() {
  stopCountdown();
  countdownInterval = setInterval(() => {
    chrome.alarms.get(ALARM_ID, (alarm) => {
      if (alarm) {
        updateCountdown(alarm.scheduledTime, alarm.periodInMinutes);
      } else {
        showSetUI();
      }
    });
  }, 1000);
}

function syncUIFromAlarm() {
  chrome.alarms.get(ALARM_ID, (alarm) => {
    if (alarm) {
      showActiveUI(alarm.periodInMinutes);
      updateCountdown(alarm.scheduledTime, alarm.periodInMinutes);
      startCountdown();
    } else {
      showSetUI();
      chrome.storage.local.set({ intervalMinutes: null });
    }
  });
}

function startReminder(minutes) {
  chrome.runtime.sendMessage({
    action: "setAlarm",
    alarm_id: ALARM_ID,
    minutes: minutes,
  });
  showActiveUI(minutes);
  setTimeout(syncUIFromAlarm, 100);
}

inputEl.addEventListener("input", () => {
  const minutes = validateMinutes(inputEl.value);
  setBtn.disabled = minutes === null;
  errorEl.style.display = "none";
});

setBtn.addEventListener("click", () => {
  const minutes = validateMinutes(inputEl.value);
  if (minutes === null) {
    errorEl.innerText = `Enter a number between ${MIN_MINUTES} and ${MAX_MINUTES}`;
    errorEl.style.display = "block";
    return;
  }
  startReminder(minutes);
});

presetChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const minutes = parseInt(chip.dataset.minutes, 10);
    inputEl.value = minutes;
    setBtn.disabled = false;
    errorEl.style.display = "none";
    startReminder(minutes);
  });
});

clearBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "clearAlarm", alarm_id: ALARM_ID });
  showSetUI();
  inputEl.value = "";
  setBtn.disabled = true;
  errorEl.style.display = "none";
});

syncUIFromAlarm();
