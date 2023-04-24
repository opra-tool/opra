import { iacc as wasmIacc } from 'wasm-raqi-online-toolbox';
import { IRBuffer } from './buffer';

/**
 * Calculates the interaural cross correlation as defined in ISO 3382-1.
 */
export function calculateIacc(buffer: IRBuffer): number {
  buffer.assertStereo();

  return wasmIacc(buffer.getChannel(0), buffer.getChannel(1));
}
