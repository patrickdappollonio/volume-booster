let context;
let gain;
let stream;
let operatingSystem;
let warned = false;

chrome.runtime.getPlatformInfo(function (info) { operatingSystem = info.os });
chrome.tabCapture.onStatusChanged.addListener(handleFullScreen);
chrome.extension.onConnect.addListener(function (port) { port.onMessage.addListener(handleMessage) });

function isNumeric (n) {
  return !isNaN(parseInt(n)) && isFinite(n);
}

function handleMessage (msg) {
  console.info("received message:", msg);

  if (msg.init) {
    if (context) return;
    context = new (window.AudioContext)();
    gain = context.createGain();

    chrome.tabCapture.capture({ audio: true, video: false }, function (streamInput) {
      stream = streamInput;
      let source = context.createMediaStreamSource(stream);
      source.connect(gain);
      gain.connect(context.destination);
      handleMessage({ setvolume: '2' });
    });
    return;
  }

  if (isNumeric(msg.setvolume)) {
    gain.gain.value = 2 * parseInt(msg.setvolume);
    return;
  }

  if (msg.destroy) {
    if (!stream || !context) {
      console.warn("nothing to close!", stream, context);
      return;
    };

    stream.getAudioTracks()[0].stop();
    context.close();
    stream = null;
    context = null;
    return;
  }
}

function handleFullScreen (info) {
  if (info.fullscreen && !warned) {
    warned = true;

    if (operatingSystem === 'mac') {
      alert('for full screen: maximize the Chrome window then press cmd+shift+f');
      return;
    }

    alert('for full screen: press F11');
  }
}
