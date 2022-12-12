import { BinauralAudio } from './audio/binaural-audio';
import { e80 } from './early-late-fractions';
import { calculateIacc } from './iacc';
import { arraysMean, mean } from './math/mean';
import { MonauralResults, processMonauralAudio } from './monaural-processing';
import { octfiltBinaural } from './octfilt';
import { correctStarttimeBinaural } from './starttime';

export type BinauralResults = MonauralResults & {
  iaccBands: number[];
  eiaccBands: number[];
};

export async function processBinauralAudio(
  audio: BinauralAudio,
  sampleRate: number
): Promise<BinauralResults> {
  const starttimeCorrected = correctStarttimeBinaural(audio);

  const bands = await octfiltBinaural(starttimeCorrected, sampleRate);

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
    schwerpunktzeit: mean(
      resultsLeft.schwerpunktzeit,
      resultsRight.schwerpunktzeit
    ),
    reverbTimeBands: arraysMean(
      resultsLeft.reverbTimeBands,
      resultsRight.reverbTimeBands
    ),
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
    c50Bands: arraysMean(resultsLeft.c50Bands, resultsRight.c50Bands),
    c80Bands: arraysMean(resultsLeft.c80Bands, resultsRight.c80Bands),
    edtBands: arraysMean(resultsLeft.edtBands, resultsRight.edtBands),
    squaredImpulseResponse: resultsLeft.squaredImpulseResponse.map(
      ({ x, y }, i) => ({
        x,
        y: (y + resultsRight.squaredImpulseResponse[i].y) / 2,
      })
    ),
  };

  return {
    iaccBands: iacc,
    eiaccBands: eiacc,
    ...meanResults,
  };
}
