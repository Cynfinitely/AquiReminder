// Shared by background.js (importScripts) and popup.js (<script>).
const ALARM_ID = "alarm_001";
const MIN_MINUTES = 1;
const MAX_MINUTES = 480;
const SNOOZE_MINUTES = 5;

function validateMinutes(value) {
  const minutes = Number(value);
  if (
    value === "" ||
    value === null ||
    !Number.isInteger(minutes) ||
    minutes < MIN_MINUTES ||
    minutes > MAX_MINUTES
  ) {
    return null;
  }
  return minutes;
}
