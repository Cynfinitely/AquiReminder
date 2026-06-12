const MIN_MINUTES = 1;
const MAX_MINUTES = 480;

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "setAlarm") {
    const minutes = parseInt(request.minutes, 10);
    if (isNaN(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
      return;
    }
    chrome.alarms.clear(request.alarm_id);
    chrome.alarms.create(request.alarm_id, {
      delayInMinutes: minutes,
      periodInMinutes: minutes,
    });
    chrome.storage.local.set({ intervalMinutes: minutes });
    console.log(`Alarm set every ${minutes} minutes.`);
  } else if (request.action === "clearAlarm") {
    chrome.alarms.clear(request.alarm_id);
    chrome.storage.local.set({ intervalMinutes: null });
  }
});

chrome.alarms.onAlarm.addListener(() => {
  chrome.windows.create({
    width: 380,
    height: 420,
    type: "popup",
    url: "alert.html",
    focused: true,
  });
});
