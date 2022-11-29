import { iacc as wasmIacc } from 'wasm-raqi-online-toolbox';
import { BinauralAudio } from './audio/binaural-audio';

/**
 * Calculates the interaural cross correlation on binaural audio as defined in ISO 3382-1.
 *
 * @param audio Binaural audio
 * @returns IACC for the given audio channels
 */
export function calculateIacc({
  leftSamples,
  rightSamples,
}: BinauralAudio): number {
  return wasmIacc(leftSamples, rightSamples);
}
