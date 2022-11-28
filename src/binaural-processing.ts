import { BinauralAudio } from './audio/BinauralAudio';
import { e80 } from './earlyLateFractions';
import { calculateIacc } from './iacc';
import { arraysMean, mean } from './math/mean';
import { MonauralResults, processMonauralAudio } from './monaural-processing';
import { octfiltBinaural } from './octfilt';
import { correctStarttimeBinaural } from './starttime';

export type BinauralResults = MonauralResults & {
  iacc: number[];
  eiacc: number[];
};

export async function processBinauralAudio(
  audio: BinauralAudio,
  sampleRate: number
): Promise<BinauralResults> {
  const trimmed = correctStarttimeBinaural(audio);

  const bands = await octfiltBinaural(trimmed, sampleRate);

  const iacc = [];
  const eiacc = [];
  for (const band of bands) {
    const earlyBand = new BinauralAudio(
      e80(band.leftSamples, sampleRate),
      e80(band.rightSamples, sampleRate)
    );

    iacc.push(calculateIacc(band));
    eiacc.push(calculateIacc(earlyBand));
  }

  const resultsLeft = await processMonauralAudio(audio.leftSamples, sampleRate);
  const resultsRight = await processMonauralAudio(
    audio.rightSamples,
    sampleRate
  );

  const meanResults: MonauralResults = {
    bassRatio: mean(resultsLeft.bassRatio, resultsRight.bassRatio),
    aWeightedSquaredSum: mean(
      resultsLeft.aWeightedSquaredSum,
      resultsRight.aWeightedSquaredSum
    ),
    schwerpunktzeit: mean(
      resultsLeft.schwerpunktzeit,
      resultsRight.schwerpunktzeit
    ),
    reverbTime: arraysMean(resultsLeft.reverbTime, resultsRight.reverbTime),
    bandsSquaredSum: arraysMean(
      resultsLeft.bandsSquaredSum,
      resultsRight.bandsSquaredSum
    ),
    e80BandsSquaredSum: arraysMean(
      resultsLeft.e80BandsSquaredSum,
      resultsRight.e80BandsSquaredSum
    ),
    l80BandsSquaredSum: arraysMean(
      resultsLeft.l80BandsSquaredSum,
      resultsRight.l80BandsSquaredSum
    ),
    c50Values: arraysMean(resultsLeft.c50Values, resultsRight.c50Values),
    c80Values: arraysMean(resultsLeft.c80Values, resultsRight.c80Values),
    edtValues: arraysMean(resultsLeft.edtValues, resultsRight.edtValues),
    squaredImpulseResponse: resultsLeft.squaredImpulseResponse.map(
      ({ x, y }, i) => ({
        x,
        y: (y + resultsRight.squaredImpulseResponse[i].y) / 2,
      })
    ),
  };

  return {
    iacc,
    eiacc,
    ...meanResults,
  };
}
