const ALARM_ID = "alarm_001";
const MIN_MINUTES = 1;
const MAX_MINUTES = 480;

let countdownInterval = null;
let currentPeriodMinutes = null;
let isDue = false;
let selectedPresetMinutes = null;

const inputEl = document.getElementById("id_Sec");
const setBtn = document.getElementById("id_Set");
const errorEl = document.getElementById("error");
const rangeHintEl = document.getElementById("rangeHint");
const clearBtn = document.getElementById("id_Clear");
const ackBtn = document.getElementById("id_Ack");
const reopenBtn = document.getElementById("id_Reopen");
const snoozeBtn = document.getElementById("id_Snooze");
const intervalInfoEl = document.getElementById("intervalInfo");
const nextAtEl = document.getElementById("nextAt");
const setReminderEl = document.getElementById("setReminder");
const remainingTimeEl = document.getElementById("remainingTime");
const countdownSectionEl = document.getElementById("countdownSection");
const dueSectionEl = document.getElementById("dueSection");
const timeEl = document.getElementById("time");
const presetChips = document.querySelectorAll(".chip");
const languageSelect = document.getElementById("languageSelect");

function validateMinutes(value) {
  const minutes = parseInt(value, 10);
  if (isNaN(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
    return null;
  }
  return minutes;
}

function setInputInvalid(isInvalid) {
  inputEl.setAttribute("aria-invalid", isInvalid ? "true" : "false");
}

function hideError() {
  errorEl.textContent = "";
  errorEl.style.display = "none";
  setInputInvalid(false);
}

function showError() {
  errorEl.innerText = t("validationError", MIN_MINUTES, MAX_MINUTES);
  errorEl.style.display = "block";
  setInputInvalid(true);
}

function refreshChipLabels() {
  presetChips.forEach((chip) => {
    chip.textContent = t("presetMinutes", chip.dataset.minutes);
  });
}

function selectChip(minutes) {
  selectedPresetMinutes = minutes;
  presetChips.forEach((chip) => {
    const selected = parseInt(chip.dataset.minutes, 10) === minutes;
    chip.classList.toggle("chip--active", selected);
    chip.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function clearChipSelection() {
  selectedPresetMinutes = null;
  presetChips.forEach((chip) => {
    chip.classList.remove("chip--active");
    chip.setAttribute("aria-pressed", "false");
  });
}

function formatRemaining(scheduledTime) {
  const ms = scheduledTime - Date.now();
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatClockTime(scheduledTime) {
  return new Date(scheduledTime).toLocaleTimeString(getLanguage(), {
    hour: "numeric",
    minute: "2-digit",
  });
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
  timeEl.innerText = formatRemaining(scheduledTime);
  nextAtEl.innerText = t("nextAt", formatClockTime(scheduledTime));
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
    if (isDue || !currentPeriodMinutes) {
      stopCountdown();
      return;
    }
    chrome.alarms.get(ALARM_ID, (alarm) => {
      if (isDue || !currentPeriodMinutes) {
        stopCountdown();
        return;
      }
      if (alarm) {
        updateCountdown(alarm.scheduledTime, currentPeriodMinutes);
      }
    });
  }, 1000);
}

function showIdleUI() {
  setReminderEl.classList.remove("hidden");
  remainingTimeEl.classList.add("hidden");
  currentPeriodMinutes = null;
  isDue = false;
  stopCountdown();
  document.documentElement.style.setProperty("--progress", 0);
  nextAtEl.innerText = "";
}

function showActiveShell(periodMinutes) {
  setReminderEl.classList.add("hidden");
  remainingTimeEl.classList.remove("hidden");
  currentPeriodMinutes = periodMinutes;
}

function showCountdownMode() {
  countdownSectionEl.classList.remove("hidden");
  dueSectionEl.classList.add("hidden");
  isDue = false;
  if (currentPeriodMinutes) {
    intervalInfoEl.innerText = t("repeatsEvery", currentPeriodMinutes);
  }
}

function showDueMode() {
  countdownSectionEl.classList.add("hidden");
  dueSectionEl.classList.remove("hidden");
  isDue = true;
  stopCountdown();
  document.documentElement.style.setProperty("--progress", 1);
}

function syncUIFromStorage() {
  chrome.storage.local.get(["intervalMinutes", "alertPending"], (storage) => {
    const { intervalMinutes, alertPending } = storage;

    if (!intervalMinutes) {
      showIdleUI();
      return;
    }

    showActiveShell(intervalMinutes);

    if (alertPending) {
      showDueMode();
      return;
    }

    chrome.alarms.get(ALARM_ID, (alarm) => {
      showCountdownMode();
      if (alarm) {
        updateCountdown(alarm.scheduledTime, intervalMinutes);
        startCountdown();
      } else {
        timeEl.innerText = "0:00";
        nextAtEl.innerText = "";
        startCountdown();
      }
    });
  });
}

function startReminder(minutes) {
  chrome.runtime.sendMessage({
    action: "setAlarm",
    minutes,
  });
  showActiveShell(minutes);
  showCountdownMode();
  updateCountdown(Date.now() + minutes * 60 * 1000, minutes);
  startCountdown();
}

function refreshDynamicText() {
  rangeHintEl.innerText = t("rangeHint", MIN_MINUTES, MAX_MINUTES);
  refreshChipLabels();
  if (errorEl.style.display === "block") {
    errorEl.innerText = t("validationError", MIN_MINUTES, MAX_MINUTES);
  }
  if (isDue) return;
  if (currentPeriodMinutes) {
    intervalInfoEl.innerText = t("repeatsEvery", currentPeriodMinutes);
    chrome.alarms.get(ALARM_ID, (alarm) => {
      if (alarm) {
        nextAtEl.innerText = t("nextAt", formatClockTime(alarm.scheduledTime));
      }
    });
  }
}

inputEl.addEventListener("input", () => {
  const minutes = validateMinutes(inputEl.value);
  setBtn.disabled = minutes === null;
  if (inputEl.value !== "" && minutes === null) {
    showError();
  } else {
    hideError();
  }
  if (minutes === selectedPresetMinutes) return;
  if (minutes === null) {
    clearChipSelection();
    return;
  }
  const matchingChip = [...presetChips].find(
    (chip) => parseInt(chip.dataset.minutes, 10) === minutes
  );
  if (matchingChip) {
    selectChip(minutes);
  } else {
    clearChipSelection();
    selectedPresetMinutes = null;
  }
});

setBtn.addEventListener("click", () => {
  const minutes = validateMinutes(inputEl.value);
  if (minutes === null) {
    showError();
    return;
  }
  startReminder(minutes);
});

presetChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const minutes = parseInt(chip.dataset.minutes, 10);
    inputEl.value = minutes;
    setBtn.disabled = false;
    hideError();
    selectChip(minutes);
  });
});

clearBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "clearAlarm" });
  showIdleUI();
  inputEl.value = "";
  setBtn.disabled = true;
  hideError();
  clearChipSelection();
});

ackBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "acknowledgeReminder" });
});

reopenBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "reopenAlert" });
});

snoozeBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "snoozeReminder" });
});

languageSelect.addEventListener("change", async () => {
  await setLanguage(languageSelect.value);
  refreshDynamicText();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.intervalMinutes || changes.alertPending) {
    syncUIFromStorage();
  }
});

(async () => {
  await initI18n();
  applyI18n();
  populateLanguageSelect();
  refreshDynamicText();
  syncUIFromStorage();
})();
