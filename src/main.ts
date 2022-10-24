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
import { octfilt } from './octfilt';
import { elf } from './elf';
import { c50c80Calculation } from './c50c80Calculation';
import { createInterauralCrossCorrelationGraph } from './graphs/interauralCrossCorrelationGraph';
import { createC50C80Graph } from './graphs/c50c80Graph';
import {
  trimStarttimeBinaural,
  trimStarttimeMonaural,
} from './starttimeDetection';
import { arrayFilledWithZeros } from './math/arrayFilledWithZeros';

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
const graphContainer = requireElement('graph-container');

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

  graphContainer.innerHTML = '';
  resultsBox.innerHTML = `
    <span>Sample Rate: ${audioBuffer.sampleRate}Hz</span><br />
    <span>Channels: ${audioBuffer.numberOfChannels}</span><br />
    <span>Duration: ${audioBuffer.duration}s</span><br />
  `;

  if (audioBuffer.numberOfChannels === 1) {
    // TODO: rename: raw audio
    const miror = Float64Array.from(audioBuffer.getChannelData(0));
    // TODO: rename: starttime trimmed raw audio
    // const mir = trimStarttimeMonaural(miror);
    // TODO: rename: raw audio padded at its end with 10000 zeros
    const mirf = new Float64Array([...miror, ...arrayFilledWithZeros(10000)]);

    // octave band filtering
    const octaveBands = await octfilt(mirf, fs);
    // TODO: rename: individually startime trimmed and zero-padded octave bands
    const miro = octaveBands.map(band => {
      const trimmedBand = trimStarttimeMonaural(band);
      return new Float64Array([
        ...trimmedBand,
        ...arrayFilledWithZeros(band.length - trimmedBand.length),
      ]);
    });

    // TODO: Aweight() - weighting filter scheint recht kompliziert
    // https://www.mathworks.com/help/audio/ref/weightingfilter-system-object.html
    // const mira = trimStarttimeMonaural(aWeight(mirf, fs));

    const c50Values = new Float64Array(miro.length);
    const c80Values = new Float64Array(miro.length);
    for (let i = 0; i < miro.length; i += 1) {
      const earlyLateFractions = elf(miro[i], fs);
      const { c50, c80 } = c50c80Calculation(earlyLateFractions);
      c50Values[i] = c50;
      c80Values[i] = c80;
    }

    graphContainer.appendChild(createC50C80Graph(c50Values, c80Values));

    // TODO: EDT() - polyfit() wird verwendet, könnte eklig werden, sum() und cumsum() müssen auch implementiert werden
  } else if (audioBuffer.numberOfChannels === 2) {
    const leftChannel = Float64Array.from(audioBuffer.getChannelData(0));
    const rightChannel = Float64Array.from(audioBuffer.getChannelData(1));

    const { leftChannel: trimmedLeft, rightChannel: trimmedRight } =
      trimStarttimeBinaural({
        leftChannel,
        rightChannel,
      });

    const octavesLeft = await octfilt(trimmedLeft, fs);
    const octavesRight = await octfilt(trimmedRight, fs);

    const iacc = await interauralCrossCorrelation(octavesLeft, octavesRight);
    const eiacc = await earlyInterauralCrossCorrelation(
      octavesLeft,
      octavesRight,
      fs
    );

    graphContainer.appendChild(
      createInterauralCrossCorrelationGraph(iacc, eiacc)
    );
  } else {
    alert('only monaural or binaural audio is supported');
  }

  resultsBox.innerHTML += `FINISHED, took ${Date.now() - start}ms`;
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
