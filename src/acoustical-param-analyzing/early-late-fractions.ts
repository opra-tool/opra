import { CustomAudioBuffer } from '../transfer-objects/audio-buffer';

/**
 * Returns samples before the 50ms mark.
 */
export function e50Calc(buffer: CustomAudioBuffer): CustomAudioBuffer {
  const index = Math.round(0.05 * buffer.sampleRate);

  return buffer.transform(channel => channel.subarray(0, index));
}

/**
 * Returns samples after the 50ms mark.
 */
export function l50Calc(buffer: CustomAudioBuffer): CustomAudioBuffer {
  const index = Math.round(0.05 * buffer.sampleRate);

  return buffer.transform(channel => channel.subarray(index));
}

/**
 * Returns samples before the 80ms mark.
 */
export function e80Calc(buffer: CustomAudioBuffer): CustomAudioBuffer {
  const index = Math.round(0.08 * buffer.sampleRate);

  return buffer.transform(channel => channel.subarray(0, index));
}

/**
 * Returns samples after the 80ms mark.
 */
export function l80Calc(buffer: CustomAudioBuffer): CustomAudioBuffer {
  const index = Math.round(0.08 * buffer.sampleRate);

  return buffer.transform(channel => channel.subarray(index));
}
