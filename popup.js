const alarm_id = "alarm_001";
document.getElementById("id_Set").onclick = () => {
  let dt = new Date();
  let sec = document.getElementById("id_Sec").value;
  dt.setSeconds(dt.getSeconds() + parseInt(sec));
  chrome.alarms.create(alarm_id, { when: dt.getTime() });
};
document.getElementById("id_Clear").onclick = () => {
  chrome.alarms.clear(alarm_id);
};
