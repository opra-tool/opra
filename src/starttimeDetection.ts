import { BinauralAudio } from './audio/BinauralAudio';
import { arrayMaxAbs } from './math/arrayMaxAbs';

function findIndexOfFirstValue20dBUnderMax(audio: Float64Array): number {
  const max = arrayMaxAbs(audio);

  return audio.findIndex(el => Math.abs(el) > 0.01 * max);
}

function trimAudio(audio: Float64Array, toas: number): Float64Array {
  return audio.slice(toas - 1);
}

/**
 * Performs starttime detection on the given audio.
 * Returns the audio from the point where it first had an intensity of max(audio) - 20dB.
 *
 * TODO: rename to starttime correction?
 *
 * @param audio Audio as Float64Array
 * @returns Trimmed audio
 */
export function trimStarttimeMonaural(audio: Float64Array): Float64Array {
  const toas = findIndexOfFirstValue20dBUnderMax(audio);

  return trimAudio(audio, toas);
}

/**
 * Performs starttime detection and trimming on binaural audio.
 * In case the channels have different starttimes, the first is used.
 *
 * @see trimStarttimeMonaural
 *
 * @param channels Audio channels to be trimmed
 * @returns Trimmed audio channels
 */
export function trimStarttimeBinaural({
  leftSamples,
  rightSamples,
  sampleRate,
}: BinauralAudio): BinauralAudio {
  const leftIndex = findIndexOfFirstValue20dBUnderMax(leftSamples);
  const rightIndex = findIndexOfFirstValue20dBUnderMax(rightSamples);

  const index = Math.min(leftIndex, rightIndex);

  return new BinauralAudio(
    trimAudio(leftSamples, index),
    trimAudio(rightSamples, index),
    sampleRate
  );
}
