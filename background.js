chrome.alarms.onAlarm.addListener((alarm) => {
  //alert('Alret');
  chrome.windows.create({
    width : 200,
    height : 100,
    type : 'popup',
    url : 'alert.html'
  });
});