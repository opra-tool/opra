import { BinauralAudio } from './audio/BinauralAudio';
import { bandpass } from './filtering/bandpass';

const FREQUENCIES_IEC61672 = [
  44.6683592150963, 89.1250938133746, 177.827941003892, 354.813389233576,
  707.945784384138, 1412.53754462275, 2818.38293126445, 5623.41325190349,
  11220.1845430196,
];

/**
 * Perform octave band filtering on binaural audio
 * @see octfilt
 *
 * @param audio
 */
export async function octfiltBinaural({
  leftSamples,
  rightSamples,
  sampleRate,
}: BinauralAudio): Promise<BinauralAudio[]> {
  const leftOctaves = await octfilt(leftSamples, sampleRate);
  const rightOctaves = await octfilt(rightSamples, sampleRate);

  const res = [];
  for (let i = 0; i < leftOctaves.length; i += 1) {
    res.push(new BinauralAudio(leftOctaves[i], rightOctaves[i], sampleRate));
  }

  return res;
}

/**
 *  Perform octave band filtering as specified in IEC 61672.
 *
 * @param data
 * @param fs
 * @returns
 */
export async function octfilt(
  data: Float64Array,
  fs: number
): Promise<Float64Array[]> {
  const audioBuffer = new AudioBuffer({
    numberOfChannels: 1,
    length: data.length,
    sampleRate: fs,
  });

  // TODO: copyChannelData()?
  const channel = audioBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    channel[i] = data[i];
  }

  const promises = [];
  for (let i = 0; i < FREQUENCIES_IEC61672.length - 1; i += 1) {
    const f1 = FREQUENCIES_IEC61672[i];
    const f2 = FREQUENCIES_IEC61672[i + 1];

    promises.push(calc(audioBuffer, f1, f2, fs));
  }

  return Promise.all(promises);
}

function calc(
  buffer: AudioBuffer,
  f1: number,
  f2: number,
  fs: number
): Promise<Float64Array> {
  const offlineCtx = new OfflineAudioContext(1, buffer.length, fs);

  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;

  const b = [1, 0, -1];
  const filterOrder = 6;

  const { feedbacks, gains } = bandpass(filterOrder, f1, f2, fs);

  const filters = [];
  for (let ii = 0; ii < filterOrder / 2; ii += 1) {
    const feedback = feedbacks[ii];
    const feedforward = b.map(val => val * gains[ii]);
    const filter = offlineCtx.createIIRFilter(feedforward, feedback);
    filters.push(filter);
  }
  source.connect(filters[0]);
  for (let ii = 1; ii < filters.length; ii += 1) {
    filters[ii - 1].connect(filters[ii]);
  }
  filters[filters.length - 1].connect(offlineCtx.destination);

  source.start();

  return new Promise(resolve => {
    offlineCtx.startRendering().then(renderedBuffer => {
      resolve(Float64Array.from(renderedBuffer.getChannelData(0)));
    });
  });
}
