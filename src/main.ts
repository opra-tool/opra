/* eslint-disable import/extensions */
import { Chart, registerables } from 'chart.js';
import initWasm from 'wasm-raqi-online-toolbox';
import { GraphCard } from './components/GraphCard';
import { parseSampleRate } from './audio_parsing/parseSampleRate';
import { requireElement } from './dom/requireElement';
import {
  earlyInterauralCrossCorrelation,
  interauralCrossCorrelation,
} from './interauralCrossCorrelation';
import { arrayMaxAbs } from './math/arrayMaxAbs';
import { normalizeArray } from './math/normalizeArray';
import { octfilt } from './octfilt';

// init web assembly module
initWasm().catch(console.error);

// register web components
declare global {
  interface HTMLElementTagNameMap {
    'graph-card': GraphCard;
  }
}

customElements.define('graph-card', GraphCard);

// prepare chart.js library
// TODO: only register components actually in use to reduce bundle size
Chart.register(...registerables);

const form = requireElement<HTMLFormElement>('form');
const soundfileInput = requireElement<HTMLInputElement>('soundfile-input');
const resultsBox = requireElement('results-box');

async function processFile(e: ProgressEvent<FileReader>) {
  if (!e.target) {
    return;
  }

  const bytes = e.target.result;
  if (bytes === null || typeof bytes === 'string') {
    throw new Error('invalid data read from audio file');
  }

  const fs = parseSampleRate('wav', bytes);

  const start = Date.now();

  const audioCtx = new AudioContext({ sampleRate: fs });
  const audioBuffer = await audioCtx.decodeAudioData(bytes);

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

    alert('monaural audio is not implemented, yet');
  } else if (audioBuffer.numberOfChannels === 2) {
    const left = Float64Array.from(audioBuffer.getChannelData(0));
    const right = Float64Array.from(audioBuffer.getChannelData(1));

    // eslint-disable-next-line no-use-before-define
    const toasLeft = findFirstOver20dBUnderMax(left);
    // eslint-disable-next-line no-use-before-define
    const toasRight = findFirstOver20dBUnderMax(right);

    // start times could be different per channel, use the shorter
    const toas = Math.min(toasLeft, toasRight);

    const trimmedLeft = left.slice(toas - 1);
    const trimmedRight = right.slice(toas - 1);

    const octavesLeft = await octfilt(trimmedLeft, fs);
    const octavesRight = await octfilt(trimmedRight, fs);

    const crossCorrelated = await interauralCrossCorrelation(
      octavesLeft,
      octavesRight
    );
    const earlyCrossCorrelated = await earlyInterauralCrossCorrelation(
      octavesLeft,
      octavesRight,
      fs
    );

    // eslint-disable-next-line no-use-before-define
    drawBinauralCrossCorrelationGraph({
      crossCorrelated,
      earlyCrossCorrelated,
    });
  } else {
    alert('only monaural or binaural audio is supported');
  }

  resultsBox.innerHTML += `FINISHED, took ${Date.now() - start}ms`;
}

function findFirstOver20dBUnderMax(rawAudio: Float64Array) {
  const max = arrayMaxAbs(rawAudio);
  const normalized = normalizeArray(rawAudio, max);
  return normalized.findIndex(el => Math.abs(el) > 0.1);
}

form.addEventListener('submit', ev => {
  ev.preventDefault();

  const reader = new FileReader();
  reader.onload = processFile;
  if (soundfileInput.files !== null && soundfileInput.files.length > 0) {
    reader.readAsArrayBuffer(soundfileInput.files[0]);
  } else {
    throw new Error('no files in input');
  }
});

function drawBinauralCrossCorrelationGraph({
  crossCorrelated,
  earlyCrossCorrelated,
}: {
  crossCorrelated: Float64Array;
  earlyCrossCorrelated: Float64Array;
}) {
  const graphContainer = requireElement('graph-container');

  const freqValues = [62.5, 125, 250, 500, 1000, 2000, 4000, 8000];
  const card = document.createElement('graph-card');
  card.title = 'Binaural Cross Correlation';
  card.labels = freqValues.map(v => `${v}Hz`);
  card.datasets = [
    {
      label: 'Binaural Cross Correlation',
      data: crossCorrelated,
      fill: false,
      borderColor: 'rgba(153, 102, 255, 0.5)',
    },
    {
      label: 'Early Binaural Cross Correlation',
      data: earlyCrossCorrelated,
      fill: false,
      borderColor: 'rgba(255, 99, 132, 0.5)',
    },
  ];

  graphContainer.appendChild(card);
}
