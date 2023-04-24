import { IRBuffer } from '../analyzing/buffer';
import { OctaveBands } from '../analyzing/octave-bands';
import { octaveBandpassFilterCoefficients } from './bandpass';

const ZERO_PADDING_LENGTH = 10000;
const CENTER_FREQUENCIES = [62.5, 125, 250, 500, 1000, 2000, 4000, 8000];

/**
 * Perform octave band filtering.
 *
 * Returns octave bands from 62.5 Hz to 8 kHz.
 */
export async function octfilt(buffer: IRBuffer): Promise<OctaveBands> {
  const sourceBuffer = new AudioBuffer({
    numberOfChannels: buffer.numberOfChannels,
    length: buffer.length + ZERO_PADDING_LENGTH,
    sampleRate: buffer.sampleRate,
  });

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    sourceBuffer.copyToChannel(buffer.getChannel(i), i);
  }

  const resultBuffers = await Promise.all(
    CENTER_FREQUENCIES.map(f =>
      filterOctaveBand(sourceBuffer, f, sourceBuffer.sampleRate)
    )
  );

  return new OctaveBands(resultBuffers.map(IRBuffer.fromAudioBuffer));
}

function filterOctaveBand(
  buffer: AudioBuffer,
  centerFrequency: number,
  sampleRate: number
): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    sampleRate
  );

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

  return ctx.startRendering();
}
