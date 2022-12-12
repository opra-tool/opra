import { BinauralSamples } from './audio/binaural-samples';
import { e80 } from './early-late-fractions';
import { calculateIacc } from './iacc';
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
  const t1 = performance.now();
  const squaredIR = new Float32Array(starttimeCorrected.length);
  for (let i = 0; i < starttimeCorrected.length; i += 1) {
    squaredIR[i] =
      (starttimeCorrected.leftChannel[i] ** 2 +
        starttimeCorrected.rightChannel[i] ** 2) /
      2;
  }

  const meanBands = bands.map(band => {
    const meanBand = new Float32Array(band.length);
    for (let i = 0; i < band.length; i += 1) {
      meanBand[i] =
        (Math.abs(band.leftChannel[i]) + Math.abs(band.rightChannel[i])) / 2;
    }
    return meanBand;
  });
  console.log('took ', performance.now() - t1, 'ms');

  const t2 = performance.now();
  const meanResults = await processChannel(squaredIR, meanBands, sampleRate);
  console.log('channel took ', performance.now() - t2, 'ms');

  return {
    iaccBands: iacc,
    eiaccBands: eiacc,
    ...meanResults,
  };
}
