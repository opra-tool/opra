import { CustomAudioBuffer } from '../../transfer-objects/audio-buffer';
import {
  CENTER_FREQUENCIES,
  OctaveBands,
} from '../../transfer-objects/octave-bands';
import { octaveBandpassFilterCoefficients } from './bandpass';

const ZERO_PADDING_LENGTH = 10000;

/**
 * Perform octave band filtering.
 *
 * Returns octave bands from 62.5 Hz to 8 kHz.
 */
export async function octfilt(buffer: CustomAudioBuffer): Promise<OctaveBands> {
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

  return new OctaveBands(
    resultBuffers.map(CustomAudioBuffer.fromNativeAudioBuffer)
  );
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

  /* console.log(`fs=${sampleRate}Hz; fc=${centerFrequency}Hz, coeffs=${octaveBandpassFilterCoefficients(
  centerFrequency,
  sampleRate
).map(({ feedback, feedforward }) => `[a0=${feedback[0]}, a1=${feedback[1]}, a2=${feedback[2]}, b0=${feedforward[0]}, b1=${feedforward[1]}, b2=${feedforward[2]}]`)}`)
 */
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
