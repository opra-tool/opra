import { requireElement } from "./dom/requireElement";
import { earlyInterauralCrossCorrelation, interauralCrossCorrelation } from "./interauralCrossCorrelation";
import { octfilt } from "./octfilt";


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

  const start = Date.now();
  
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(bytes);
  const fs = audioBuffer.sampleRate;

  resultsBox.innerHTML = `
    <span>Sample Rate: ${audioBuffer.sampleRate}Hz</span><br />
    <span>Channels: ${audioBuffer.numberOfChannels}</span><br />
    <span>Duration: ${audioBuffer.duration}s</span><br />
  `;
  
  if (audioBuffer.numberOfChannels === 1) {
    // const rawAudio = audioBuffer.getChannelData(0);
    // const octaveBands = await octfilt(rawAudio, fs);
  
    // const trimmedOctaveBands = [];
    // for (let i = 0; i < octaveBands.length; i += 1) {
    //   trimmedOctaveBands[i] = starttimeDetection(octaveBands[i]);
    // }

    // TODO: Aweight() - weighting filter scheint recht kompliziert
    // https://www.mathworks.com/help/audio/ref/weightingfilter-system-object.html

    // TODO: ELF() - recht unkompliziert

    // TODO: C5080CALC() - auch sehr entspannt

    // TODO: EDT() - polyfit() wird verwendet, könnte eklig werden, sum() und cumsum() müssen auch implementiert werden

    alert("monaural audio is not implemented, yet");
  } else if(audioBuffer.numberOfChannels === 2) {
    const left = Float64Array.from(audioBuffer.getChannelData(0));
    const right = Float64Array.from(audioBuffer.getChannelData(1));

    const toasLeft = findFirstOver20dBUnderMax(left);
    const toasRight = findFirstOver20dBUnderMax(right);

    // start times could be different per channel, use the shorter
    const toas = Math.min(toasLeft, toasRight);

    const trimmedLeft = left.slice(toas - 1);
    const trimmedRight = right.slice(toas - 1);

    const octavesLeft = await octfilt(trimmedLeft, fs);
    const octavesRight = await octfilt(trimmedRight, fs);

    const crossCorrelated = await interauralCrossCorrelation(
      octavesLeft,
      octavesRight,
    );
    const earlyCrossCorrelated = await earlyInterauralCrossCorrelation(
      octavesLeft,
      octavesRight,
      fs
    );

    console.log({
      crossCorrelated,
      earlyCrossCorrelated
    });
  } else {
    alert("only monaural or binaural audio is supported");
  }

  resultsBox.innerHTML += `FINISHED, took ${Date.now() - start}ms`;
}

function findFirstOver20dBUnderMax(rawAudio: Float64Array) {
  const max = getMaxAbs(rawAudio);
  const normalized = normalizeArray(rawAudio, max);
  return normalized.findIndex(el => Math.abs(el) > 0.1);
}

function normalizeArray(array: Float64Array, maxValue: number) {
  return array.map(el => el / maxValue);
}

function getMaxAbs(array: Float64Array) {
  let max = 0;

  for (let i = 0; i < array.length; i += 1) {
    if (Math.abs(array[i]) > max) {
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
