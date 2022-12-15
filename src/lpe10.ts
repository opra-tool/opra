import { calculateSquaredIR } from './squared-impulse-response';
import { arraySum } from './math/arraySum';
import { safeLog10 } from './math/safeLog10';
import { octfilt } from './octfilt';

const SAMPLE_RATE = 48_000;

export async function calculateLpe10(
  airCoefficients: number[]
): Promise<number[]> {
  const samples = new Float32Array(SAMPLE_RATE);
  samples[9999] = 1;

  const bands = await octfilt(samples, SAMPLE_RATE);

  return bands.map((band, i) => {
    const sum = arraySum(calculateSquaredIR(band));
    const dodb = 10 * safeLog10(sum);

    return 100 + dodb - 10 * airCoefficients[i];
  });
}
