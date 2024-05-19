// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setAlarm") {
    let dt = new Date();
    dt.setMinutes(dt.getMinutes() + parseInt(request.sec)); // change setSeconds to setMinutes
    chrome.alarms.create(request.alarm_id, { when: dt.getTime() });
    console.log(`Alarm set for ${request.sec} minutes from now.`);
  } else if (request.action === "clearAlarm") {
    chrome.alarms.clear(request.alarm_id);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.windows.create({
    width: 400,
    height: 400,
    type: "popup",
    url: "alert.html",
  });
  chrome.storage.local.set({ alarmSet: false, remainingMinutes: null });
});
