// myscript.js
const alarm_id = "alarm_001";

// Load state from storage when the script starts
chrome.storage.local.get(["alarmSet", "remainingMinutes"], function (result) {
  if (result.alarmSet) {
    document.getElementById("setReminder").style.display = "none";
    document.getElementById("remainingTime").style.display = "block";
    document.getElementById("time").innerText =
      result.remainingMinutes + " minutes";
  }
});

document.getElementById("id_Set").onclick = () => {
  let min = document.getElementById("id_Sec").value;
  let sec = min ; 
  chrome.runtime.sendMessage({
    action: "setAlarm",
    alarm_id: alarm_id,
    sec: sec,
  });

  // Hide setReminder div and show remainingTime div
  document.getElementById("setReminder").style.display = "none";
  document.getElementById("remainingTime").style.display = "block";
  document.getElementById("time").innerText = min + " minutes";

  // Save state to storage
  chrome.storage.local.set({ alarmSet: true, remainingMinutes: min });
};

document.getElementById("id_Clear").onclick = () => {
  chrome.runtime.sendMessage({ action: "clearAlarm", alarm_id: alarm_id });

  // Show setReminder div and hide remainingTime div
  document.getElementById("setReminder").style.display = "block";
  document.getElementById("remainingTime").style.display = "none";

  // Clear state from storage
  chrome.storage.local.set({ alarmSet: false, remainingMinutes: null });
};
