import { BinauralAudio } from './audio/BinauralAudio';
import {
  earlyInterauralCrossCorrelation,
  interauralCrossCorrelation,
} from './interauralCrossCorrelation';
import { arraysMean, mean } from './math/mean';
import {
  MonauralAnalyzeResults,
  processMonauralAudio,
} from './monauralAudioProcessing';
import { octfiltBinaural } from './octfilt';
import { trimStarttimeBinaural } from './starttimeDetection';

export type BinauralAnalyzeResults = MonauralAnalyzeResults & {
  iacc: Float64Array;
  eiacc: Float64Array;
};

export async function processBinauralAudio(
  audio: BinauralAudio
): Promise<BinauralAnalyzeResults> {
  const trimmed = trimStarttimeBinaural(audio);

  const octaves = await octfiltBinaural(trimmed);

  const iacc = await interauralCrossCorrelation(octaves);
  const eiacc = await earlyInterauralCrossCorrelation(octaves);

  const resultsLeft = await processMonauralAudio(
    audio.leftSamples,
    audio.sampleRate
  );
  const resultsRight = await processMonauralAudio(
    audio.rightSamples,
    audio.sampleRate
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
