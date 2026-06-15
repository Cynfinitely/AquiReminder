const MIN_MINUTES = 1;
const MAX_MINUTES = 480;
const ALARM_ID = "alarm_001";

function scheduleNextAlarm(alarmId, minutes) {
  chrome.alarms.clear(alarmId);
  chrome.alarms.create(alarmId, { delayInMinutes: minutes });
}

function openAlertWindow() {
  chrome.windows.create({
    width: 380,
    height: 420,
    type: "popup",
    url: "alert.html",
    focused: true,
  });
}

function closeAlertWindows() {
  chrome.windows.getAll({ populate: true }, (windows) => {
    windows.forEach((win) => {
      const isAlert = win.tabs?.some((tab) =>
        tab.url?.includes("alert.html")
      );
      if (isAlert && win.id) {
        chrome.windows.remove(win.id);
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "setAlarm") {
    const minutes = parseInt(request.minutes, 10);
    if (isNaN(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
      return;
    }
    closeAlertWindows();
    chrome.storage.local.set({
      intervalMinutes: minutes,
      alertPending: false,
    });
    scheduleNextAlarm(request.alarm_id, minutes);
    console.log(`Reminder scheduled in ${minutes} minutes.`);
  } else if (request.action === "clearAlarm") {
    chrome.alarms.clear(request.alarm_id);
    chrome.storage.local.set({
      intervalMinutes: null,
      alertPending: false,
    });
    closeAlertWindows();
  } else if (request.action === "acknowledgeReminder") {
    chrome.storage.local.get(["intervalMinutes"], (result) => {
      chrome.storage.local.set({ alertPending: false });
      const minutes = result.intervalMinutes;
      if (minutes) {
        scheduleNextAlarm(request.alarm_id, minutes);
        console.log(`Acknowledged. Next reminder in ${minutes} minutes.`);
      }
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_ID) return;

  chrome.storage.local.get(["alertPending"], (result) => {
    if (result.alertPending) {
      return;
    }
    chrome.storage.local.set({ alertPending: true });
    openAlertWindow();
  });
});
