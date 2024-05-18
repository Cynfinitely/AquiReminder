chrome.runtime.onInstalled.addListener(function () {
  // Create an alarm that fires every 10 seconds
  chrome.alarms.create("Water Reminder", { periodInMinutes: 1 / 6 });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "Water Reminder") {
    console.log("FIRED");
    // Show a notification when the alarm fires
    chrome.notifications.create("Water Reminder", {
      type: "basic",
      iconUrl: chrome.runtime.getURL("icon.png"),
      title: "Water Reminder",
      message: "Time to drink water!",
    });
  }
});
