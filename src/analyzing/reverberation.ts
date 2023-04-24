import { calculate_reverberation as wasmCalculateReverberation } from 'wasm-raqi-online-toolbox';
import { OctaveBands, OctaveBandValues } from './octave-bands';

// TODO: only calculate for a single octave band
export function reverberationTimes(bands: OctaveBands): {
  edtBands: OctaveBandValues;
  reverbTimeBands: OctaveBandValues;
} {
  const edtBands = [];
  const reverbTimeBands = [];

  for (const band of bands) {
    band.assertMono();

    const result = wasmCalculateReverberation(
      band.getChannel(0),
      bands.sampleRate
    );

    edtBands.push(result[0]);
    reverbTimeBands.push(result[1]);
  }

  return {
    edtBands: new OctaveBandValues(edtBands),
    reverbTimeBands: new OctaveBandValues(reverbTimeBands),
  };
}
