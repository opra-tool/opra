import { arrayFilledWithZeros } from './math/arrayFilledWithZeros';
import { arraySumSquared } from './math/arraySumSquared';
import { safeLog10 } from './math/safeLog10';
import { octfilt } from './octfilt';

const SAMPLE_RATE = 48_000;

export async function calculateLpe10(
  airCoefficients: number[]
): Promise<number[]> {
  const samples = arrayFilledWithZeros(SAMPLE_RATE);
  samples[9999] = 1;

  const bands = await octfilt(samples, SAMPLE_RATE);

  return bands.map((band, i) => {
    const sumSquared = arraySumSquared(band);
    const dodb = 10 * safeLog10(sumSquared);
    const rel = 100 + dodb - 10 * airCoefficients[i];

    // TODO: is rounding to one decimal place desired?
    return Math.round(rel * 10) / 10;
  });
}
