const MIN_MINUTES = 1;
const MAX_MINUTES = 480;
const ALARM_ID = "alarm_001";
const SNOOZE_MINUTES = 5;
const ALERT_WIDTH = 360;
const ALERT_HEIGHT = 400;
const BADGE_COLOR = "#0277bd";

function scheduleNextAlarm(minutes) {
  chrome.alarms.clear(ALARM_ID, () => {
    chrome.alarms.create(ALARM_ID, { delayInMinutes: minutes });
  });
}

function setDueBadge(isDue) {
  chrome.action.setBadgeText({ text: isDue ? "!" : "" });
  if (isDue) {
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR });
  }
}

function openAlertWindow() {
  chrome.windows.create(
    {
      width: ALERT_WIDTH,
      height: ALERT_HEIGHT,
      type: "popup",
      url: "alert.html",
      focused: true,
    },
    (win) => {
      if (win?.id) {
        chrome.storage.local.set({ alertWindowId: win.id });
      }
    }
  );
}

function closeAlertWindow(callback) {
  chrome.storage.local.get(["alertWindowId"], (result) => {
    const id = result.alertWindowId;
    const finish = () => {
      chrome.storage.local.remove("alertWindowId", () => {
        if (callback) callback();
      });
    };

    if (typeof id !== "number") {
      finish();
      return;
    }

    chrome.windows.remove(id, () => {
      void chrome.runtime.lastError;
      finish();
    });
  });
}

function focusOrOpenAlert() {
  chrome.storage.local.get(["alertWindowId"], (result) => {
    const id = result.alertWindowId;
    if (typeof id !== "number") {
      openAlertWindow();
      return;
    }

    chrome.windows.update(id, { focused: true }, () => {
      if (chrome.runtime.lastError) {
        openAlertWindow();
      }
    });
  });
}

function clearDueState(callback) {
  chrome.storage.local.set({ alertPending: false }, () => {
    setDueBadge(false);
    if (callback) callback();
  });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "setAlarm") {
    const minutes = parseInt(request.minutes, 10);
    if (isNaN(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
      return;
    }
    closeAlertWindow(() => {
      chrome.storage.local.set(
        {
          intervalMinutes: minutes,
          alertPending: false,
        },
        () => {
          setDueBadge(false);
          scheduleNextAlarm(minutes);
        }
      );
    });
  } else if (request.action === "clearAlarm") {
    chrome.alarms.clear(ALARM_ID);
    closeAlertWindow(() => {
      chrome.storage.local.set(
        {
          intervalMinutes: null,
          alertPending: false,
        },
        () => setDueBadge(false)
      );
    });
  } else if (request.action === "acknowledgeReminder") {
    chrome.storage.local.get(["intervalMinutes"], (result) => {
      closeAlertWindow(() => {
        clearDueState(() => {
          if (result.intervalMinutes) {
            scheduleNextAlarm(result.intervalMinutes);
          }
        });
      });
    });
  } else if (request.action === "snoozeReminder") {
    chrome.storage.local.get(["intervalMinutes"], (result) => {
      if (!result.intervalMinutes) return;
      closeAlertWindow(() => {
        clearDueState(() => {
          scheduleNextAlarm(SNOOZE_MINUTES);
        });
      });
    });
  } else if (request.action === "reopenAlert") {
    chrome.storage.local.get(["alertPending"], (result) => {
      if (result.alertPending) {
        focusOrOpenAlert();
      }
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_ID) return;

  chrome.storage.local.get(["alertPending", "intervalMinutes"], (result) => {
    if (!result.intervalMinutes) return;
    if (result.alertPending) {
      focusOrOpenAlert();
      return;
    }
    chrome.storage.local.set({ alertPending: true }, () => {
      setDueBadge(true);
      focusOrOpenAlert();
    });
  });
});

chrome.windows.onRemoved.addListener((windowId) => {
  chrome.storage.local.get(["alertWindowId"], (result) => {
    if (result.alertWindowId !== windowId) return;
    chrome.storage.local.remove("alertWindowId");
  });
});

function repairSchedule() {
  chrome.storage.local.get(["intervalMinutes", "alertPending"], (result) => {
    const { intervalMinutes, alertPending } = result;
    if (!intervalMinutes) {
      setDueBadge(false);
      return;
    }
    if (alertPending) {
      setDueBadge(true);
      focusOrOpenAlert();
      return;
    }
    setDueBadge(false);
    chrome.alarms.get(ALARM_ID, (alarm) => {
      if (!alarm) {
        scheduleNextAlarm(intervalMinutes);
      }
    });
  });
}

chrome.runtime.onStartup.addListener(repairSchedule);
chrome.runtime.onInstalled.addListener(repairSchedule);
