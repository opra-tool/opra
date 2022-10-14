import { requireElement } from "./helpers";

const form = requireElement<HTMLFormElement>('form');
const soundfileInput = requireElement<HTMLInputElement>('soundfile-input');
const resultsBox = requireElement('results-box');


async function processFile(e: ProgressEvent<FileReader>) {
  if (!e.target) {
    return;
  }

  const bytes = e.target.result;

  if (bytes === null || typeof bytes === "string") {
    throw new Error("invalid data read from audio file")
  }
  
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(bytes);

  const rawAudio = audioBuffer.getChannelData(0);
  
  const trimmedAudio = starttimeDetection(rawAudio);

  console.log(trimmedAudio)

  // console.log(earlyLateFractions(trimmedAudio));

  resultsBox.innerHTML = `
    <span>Sample Rate: ${audioBuffer.sampleRate}Hz</span><br />
    <span>Channels: ${audioBuffer.numberOfChannels}</span><br />
    <span>Duration: ${audioBuffer.duration}s</span>
  `
}

// function earlyLateFractions(rawAudio) {

// }

// function octfilt(sampleRate) {
//   const factors = [
//     44.6683592150963,
//     89.1250938133746,
//     177.827941003892,
//     354.813389233576,
//     707.945784384138,
//     1412.53754462275,
//     2818.38293126445,
//     5623.41325190349,
//     11220.1845430196
//   ];

//   // Fili macht wohl nur iir, das passt dann denk ich
//   const irrCalculator = new Fili.CalcCascades().available();
//   const irrFilterCOeffs = iirCalculator.bandpass({
//     order: 6,
//     characteristic: '?',
//     FS: sampleRate,// sampling frequency
//     Fc: ?, // cutoff frequency
//     BW: ?, // bandwith for bandpass filter
//   });


function starttimeDetection(rawAudio: Float32Array) {
  const max = getMaxAbs(rawAudio);

  const firstOver20dBUnderMax = findFirstOver20dBUnderMax(rawAudio, max);

  return rawAudio.slice(firstOver20dBUnderMax - 1);
}

function findFirstOver20dBUnderMax(rawAudio: Float32Array, max: number) {
  const normalized = normalizeArray(rawAudio, max);
  return normalized.findIndex(el => Math.abs(el) > 0.1);
}

function normalizeArray(array: Float32Array, maxValue: number) {
  return array.map(el => el / maxValue);
}

function getMaxAbs(array: Float32Array) {
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
  if (soundfileInput.files !== null && soundfileInput.files.length > 0) {
    reader.readAsArrayBuffer(soundfileInput.files[0]);
  } else {
    console.warn("no files in input");
  }
});
