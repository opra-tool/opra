import { BinauralSamples } from './audio/binaural-samples';
import { e80 } from './early-late-fractions';
import { calculateIacc } from './iacc';
import {
  calculateMeanSquaredIR,
  calculateSquaredIR,
} from './squared-impulse-response';
import { MonauralResults, processChannel } from './monaural-processing';
import { octfiltBinaural } from './octfilt';
import { correctStarttimeBinaural } from './starttime';

export type BinauralResults = MonauralResults & {
  iaccBands: number[];
  eiaccBands: number[];
};

export async function processBinauralAudio(
  samples: BinauralSamples,
  sampleRate: number
): Promise<BinauralResults> {
  const starttimeCorrected = correctStarttimeBinaural(samples);
  const bands = await octfiltBinaural(starttimeCorrected, sampleRate);

  const iacc = [];
  const eiacc = [];
  for (const band of bands) {
    const earlyBand = new BinauralSamples(
      e80(band.leftChannel, sampleRate),
      e80(band.rightChannel, sampleRate)
    );

    iacc.push(calculateIacc(band));
    eiacc.push(calculateIacc(earlyBand));
  }

  // calculate squared impulse response of binaural audio by taking
  // the arithmetic mean of the squared IR of each channel
  const squaredIR = calculateMeanSquaredIR(starttimeCorrected);

  const meanSquaredBands = bands.map(band => {
    const meanBand = new Float32Array(band.length);
    for (let i = 0; i < band.length; i += 1) {
      meanBand[i] = (band.leftChannel[i] ** 2 + band.rightChannel[i] ** 2) / 2;
    }
    return meanBand;
  });

  const meanResults = await processChannel(
    squaredIR,
    meanSquaredBands,
    sampleRate
  );

  return {
    iaccBands: iacc,
    eiaccBands: eiacc,
    ...meanResults,
  };
}
