import { elf } from "./elf";
import { arrayMax } from "./math/arrayMax";
import { xcorr } from "./xcorr";

/**
 * Performs interaural cross correlation on two channels, which previously have been separated into their octave bands.
 * 
 * @param leftBands Octave bands of left channel
 * @param rightBands Octave bands of right channel
 * @returns 
 */
export async function interauralCrossCorrelation(leftBands: Float64Array[], rightBands: Float64Array[]): Promise<Float64Array> {
  if (leftBands.length !== rightBands.length) {
    throw new Error("expected left and right channel to have the same number of octave bands")
  }

  const numOctaveBands = leftBands.length;

  const res = new Float64Array(numOctaveBands);
  for (let i = 0; i < numOctaveBands; i += 1) {
    const leftChannel = leftBands[i];
    const rightChannel = rightBands[i];

    const leftSum = leftChannel.reduce((prev, cur) => prev + cur ** 2);
    const rightSum = rightChannel.reduce((prev, cur) => prev + cur ** 2);
    
    const length = Math.sqrt(leftSum * rightSum);
    const crossCorrelated = await xcorr(leftChannel, rightChannel);
    
    const normalized = crossCorrelated.map(val => val / length);

    res[i] = arrayMax(normalized);
  }

  return res;
}

export async function earlyInterauralCrossCorrelation(leftBands: Float64Array[], rightBands: Float64Array[], fs: number) {
  if (leftBands.length !== rightBands.length) {
    throw new Error("expected left and right channel to have the same number of octave bands")
  }

  const numOctaveBands = leftBands.length;
  const res = new Float64Array(numOctaveBands);
  for (let i = 0; i < numOctaveBands; i += 1) {
    const leftChannel = leftBands[i];
    const rightChannel = rightBands[i];

    const { e80: e80Left } = elf(leftChannel, fs);
    const { e80: e80Right } = elf(rightChannel, fs);

    
    const leftSum = e80Left.reduce((prev, cur) => prev + cur ** 2);
    const rightSum = e80Right.reduce((prev, cur) => prev + cur ** 2);
    
    const length = Math.sqrt(leftSum * rightSum);
    const crossCorrelated = await xcorr(leftChannel, rightChannel);
    
    const normalized = crossCorrelated.map(val => val / length);

    // TODO: use arrayMax() method
    res[i] = 1 - arrayMax(normalized);
  }

  return res;
}
