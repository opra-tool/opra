import { iacc as wasmIacc } from 'wasm-raqi-online-toolbox';
import { BinauralSamples } from './binaural-samples';

/**
 * Calculates the interaural cross correlation on binaural audio as defined in ISO 3382-1.
 *
 * @param audio Binaural audio
 * @returns IACC for the given audio channels
 */
export function calculateIacc({
  leftChannel,
  rightChannel,
}: BinauralSamples): number {
  return wasmIacc(leftChannel, rightChannel);
}
