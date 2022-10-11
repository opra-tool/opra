const form = document.getElementById('form');
const soundfileInput = document.getElementById('soundfile-input');
const resultsBox = document.getElementById('results-box');

async function processFile(e) {
  const bytes = e.target.result;
  
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(bytes);

  const rawAudio = audioBuffer.getChannelData(0);
  
  const trimmedAudio = starttimeDetection(rawAudio);

  console.log(earlyLateFractions(trimmedAudio));

  resultsBox.innerHTML = `
    <span>Sample Rate: ${audioBuffer.sampleRate}Hz</span><br />
    <span>Channels: ${audioBuffer.numberOfChannels}</span><br />
    <span>Duration: ${audioBuffer.duration}s</span>
  `
}

function earlyLateFractions(rawAudio) {

}

function starttimeDetection(rawAudio) {
  const max = getMaxAbs(rawAudio);

  const firstOver20dBUnderMax = findFirstOver20dBUnderMax(rawAudio, max);

  return rawAudio.slice(firstOver20dBUnderMax - 1);
}

function findFirstOver20dBUnderMax(rawAudio, max) {
  const normalized = normalizeArray(rawAudio, max);
  return normalized.findIndex(el => Math.abs(el) > 0.1);
}

function normalizeArray(array, maxValue) {
  return array.map(el => el / maxValue);
}

function getMaxAbs(array) {
  let max = 0;

  for (let i = 0; i < array.length; i++) {
    if (max < Math.abs(array[i])) {
      max = Math.abs(array[i]);
    }
  }

  return max;
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();

  const reader = new FileReader();
  reader.onload = processFile;
  reader.readAsArrayBuffer(soundfileInput.files[0]);

});
