import { BinauralSamples } from '../analyzing/binaural-samples';
import { octaveBandpassFilterCoefficients } from './bandpass';

const ZERO_PADDING_LENGTH = 10000;
const CENTER_FREQUENCIES = [62.5, 125, 250, 500, 1000, 2000, 4000, 8000];

/**
 * Perform octave band filtering on binaural audio
 *
 * @see octfilt
 */
export async function octfiltBinaural(
  { leftChannel: leftSamples, rightChannel: rightSamples }: BinauralSamples,
  sampleRate: number
): Promise<BinauralSamples[]> {
  const leftOctaves = await octfilt(leftSamples, sampleRate);
  const rightOctaves = await octfilt(rightSamples, sampleRate);

  const res = [];
  for (let i = 0; i < leftOctaves.length; i += 1) {
    res.push(new BinauralSamples(leftOctaves[i], rightOctaves[i]));
  }

  return res;
}

/**
 *  Perform octave band filtering.
 *
 * // TODO: pass in audio buffer directly?
 */
export function octfilt(
  samples: Float32Array,
  sampleRate: number
): Promise<Float32Array[]> {
  const buffer = new AudioBuffer({
    numberOfChannels: 1,
    length: samples.length + ZERO_PADDING_LENGTH,
    sampleRate,
  });

  buffer.copyToChannel(samples, 0);

  return Promise.all(
    CENTER_FREQUENCIES.map(f => filterOctaveBand(buffer, f, sampleRate))
  );
}

function filterOctaveBand(
  buffer: AudioBuffer,
  centerFrequency: number,
  sampleRate: number
): Promise<Float32Array> {
  const ctx = new OfflineAudioContext(1, buffer.length, sampleRate);

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filters = octaveBandpassFilterCoefficients(
    centerFrequency,
    sampleRate
  ).map(c => ctx.createIIRFilter(c.feedforward, c.feedback));

  if (filters.length !== 3) {
    throw new Error('expected three filters for octave bandpass filter');
  }

  // create filter processing chain
  // source -> filter[0] -> filter[1] -> filter[2] -> destination
  source.connect(filters[0]);
  filters[0].connect(filters[1]);
  filters[1].connect(filters[2]);
  filters[2].connect(ctx.destination);

  source.start();

  return new Promise(resolve => {
    ctx.startRendering().then(renderedBuffer => {
      resolve(renderedBuffer.getChannelData(0));
    });
  });
}
