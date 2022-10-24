/* eslint-disable import/extensions */
import { arrayMaxAbs } from './math/arrayMaxAbs';
import { normalizeArray } from './math/normalizeArray';

type BinauralAudio = {
  leftChannel: Float64Array;
  rightChannel: Float64Array;
};

function findIndexOfFirstValue20dBUnderMax(audio: Float64Array): number {
  const max = arrayMaxAbs(audio);
  const normalized = normalizeArray(audio, max);

  return normalized.findIndex(el => Math.abs(el) > 0.1);
}

function trimAudio(audio: Float64Array, toas: number): Float64Array {
  return audio.slice(toas - 1);
}

/**
 * Performs starttime detection on the given audio.
 * Returns the audio from the point where it first had an intensity of max(audio) - 20dB.
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
  leftChannel,
  rightChannel,
}: BinauralAudio): BinauralAudio {
  const toasLeft = findIndexOfFirstValue20dBUnderMax(leftChannel);
  const toasRight = findIndexOfFirstValue20dBUnderMax(rightChannel);

  const toas = Math.min(toasLeft, toasRight);

  return {
    leftChannel: trimAudio(leftChannel, toas),
    rightChannel: trimAudio(rightChannel, toas),
  };
}
