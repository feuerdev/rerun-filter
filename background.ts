let reruns = [];

//receive info to content script
chrome.runtime.onMessage.addListener(function (request, sender) {
  reruns = request.message;
  setPageActionIcon(sender.tab);
});



chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") { //URL has changed. clear reruns and update icon
    chrome.tabs.sendMessage(tabId, "onNavigate");
    reruns = [];
    setPageActionIcon(tab);
  }
}
);

function setPageActionIcon(tab) {
  var canvas = document.createElement('canvas');
  var img = document.createElement('img');
  img.onload = function () {

    /* Draw the background image */
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 2);

    if (reruns.length > 0) {
      /* Draw the "badge" */
      var grd = context.createLinearGradient(0, 10, 0, 19);
      grd.addColorStop(0, 'rgb(255, 100, 100)');
      grd.addColorStop(1, 'rgb(150,  50,  50)');

      context.fillStyle = grd;
      context.fillRect(11, 9, 19, 10);

      context.strokeStyle = 'rgb(255, 255, 255)';
      context.strokeRect(11, 10, 1, 1);
      context.strokeRect(11, 19, 1, 1);
      context.strokeRect(19, 10, 1, 1);
      context.strokeRect(19, 19, 1, 1);

      /* Draw some text */
      context.fillStyle = "white";
      context.font = "bold 10px Sans-Serif";
      context.fillText("" + reruns.length, 12, 17, 5);
    }

    chrome.pageAction.setIcon({
      imageData: context.getImageData(0, 0, 19, 19),
      tabId: tab.id
    });
  };
  img.src = "images/get_started16.png";
}

