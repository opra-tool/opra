import { calculate_reverberation as wasmCalculateReverberation } from 'wasm-raqi-online-toolbox';

export function calculateReverberation(
  bandsSquared: Float32Array[],
  tc: number,
  fs: number
): { edt: number[]; reverbTime: number[] } {
  const edt = [];
  const reverbTime = [];

  for (const band of bandsSquared) {
    const result = wasmCalculateReverberation(band, tc, fs);

    edt.push(result[0]);
    reverbTime.push(result[1]);
  }

  return { edt, reverbTime };
}