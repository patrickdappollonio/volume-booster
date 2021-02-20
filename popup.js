let port = chrome.extension.connect();
let slide = document.getElementById('slide');
let button = document.getElementById('button');

port.postMessage({ init: true });

slide.onchange = function () {
  port.postMessage({ setvolume: this.value });
}

button.onclick = function () {
  port.postMessage({ destroy: true });
  window.close();
}
