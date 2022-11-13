import { BinauralAudio } from './audio/BinauralAudio';
import { e80 } from './earlyLateFractions';
import { interauralCrossCorrelation } from './interauralCrossCorrelation';
import { arraysMean, mean } from './math/mean';
import {
  MonauralAnalyzeResults,
  processMonauralAudio,
} from './monauralAudioProcessing';
import { octfiltBinaural } from './octfilt';
import { correctStarttimeBinaural } from './starttime';

export type BinauralAnalyzeResults = MonauralAnalyzeResults & {
  iacc: number[];
  eiacc: number[];
};

export async function processBinauralAudio(
  audio: BinauralAudio,
  sampleRate: number
): Promise<BinauralAnalyzeResults> {
  const trimmed = correctStarttimeBinaural(audio);

  const bands = await octfiltBinaural(trimmed, sampleRate);

  const iacc = [];
  const eiacc = [];
  for (const band of bands) {
    const earlyBand = new BinauralAudio(
      e80(band.leftSamples, sampleRate),
      e80(band.rightSamples, sampleRate)
    );

    iacc.push(interauralCrossCorrelation(band));
    eiacc.push(interauralCrossCorrelation(earlyBand));
  }

  const resultsLeft = await processMonauralAudio(audio.leftSamples, sampleRate);
  const resultsRight = await processMonauralAudio(
    audio.rightSamples,
    sampleRate
  );

  const meanResults: MonauralAnalyzeResults = {
    bassRatio: mean(resultsLeft.bassRatio, resultsRight.bassRatio),
    aWeightedSquaredSum: mean(
      resultsLeft.aWeightedSquaredSum,
      resultsRight.aWeightedSquaredSum
    ),
    centerTime: mean(resultsLeft.centerTime, resultsRight.centerTime),
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
