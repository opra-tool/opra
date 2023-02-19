import { calculate_reverberation as wasmCalculateReverberation } from 'wasm-raqi-online-toolbox';

export function calculateReverberation(
  bandsSquared: Float32Array[],
  tc: number,
  fs: number
): { edtBands: number[]; reverbTimeBands: number[] } {
  const edtBands = [];
  const reverbTimeBands = [];

  for (const band of bandsSquared) {
    const result = wasmCalculateReverberation(band, tc, fs);

    edtBands.push(result[0]);
    reverbTimeBands.push(result[1]);
  }

  return { edtBands, reverbTimeBands };
}
