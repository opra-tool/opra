import { arrayMaxAbs } from '../math/arrays';
import { CustomAudioBuffer } from '../transfer-objects/audio-buffer';

/**
 * Returns the samples after the signal intensity first rises above
 * a value of 20dB below the maximum intensity (according to ISO 3382-1).
 *
 * In case a stereo buffer has different starttimes for each channel,
 * the earlier is used for both channels.
 */
export function correctStarttime(buffer: CustomAudioBuffer): CustomAudioBuffer {
  let index = +Infinity;
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    index = Math.min(
      index,
      findIndexOfFirstSample20dBBelowMax(buffer.getChannel(i))
    );
  }

  return buffer.transform(channel => trimSamples(channel, index));
}

function findIndexOfFirstSample20dBBelowMax(samples: Float32Array): number {
  const max = arrayMaxAbs(samples);

  return samples.findIndex(el => Math.abs(el) > 0.01 * max);
}

function trimSamples(samples: Float32Array, index: number): Float32Array {
  return samples.subarray(index);
}
