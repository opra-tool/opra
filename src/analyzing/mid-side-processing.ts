import { BinauralSamples } from './binaural-samples';
import { earlyLateFractions } from './early-late-fractions';
import { calculateEarlyLateralEnergyFraction } from './early-lateral-fraction';
import { arraySum } from '../math/arraySum';
import { MonauralResults, processChannel } from './monaural-processing';
import { octfiltBinaural } from '../octave-band-filtering/octave-band-filtering';
import { calculateSquaredIR } from './squared-impulse-response';
import { correctStarttimeBinaural } from './starttime';
import { meanDecibel } from '../math/decibels';

export type MidSideResults = MonauralResults & {
  earlyLateralEnergyFractionBands: number[];
  earlyLateralEnergyFraction: number;
  sideE80BandsSquaredSum: number[];
  sideL80BandsSquaredSum: number[];
};

export async function processMidSideAudio(
  samples: BinauralSamples,
  sampleRate: number
): Promise<MidSideResults> {
  const starttimeCorrected = correctStarttimeBinaural(samples);
  const bands = await octfiltBinaural(starttimeCorrected, sampleRate);

  const midBandsSquared = bands.map(b => calculateSquaredIR(b.leftChannel));
  const sideBandsSquared = bands.map(b => calculateSquaredIR(b.rightChannel));

  const squaredIR = calculateSquaredIR(starttimeCorrected.leftChannel);
  const monauralResults = await processChannel(
    squaredIR,
    midBandsSquared,
    sampleRate
  );

  const fractions = sideBandsSquared.map(band =>
    earlyLateFractions(band, sampleRate)
  );
  const sideE80BandsSquaredSum = fractions.map(val => val.e80).map(arraySum);
  const sideL80BandsSquaredSum = fractions.map(val => val.l80).map(arraySum);

  const earlyLateralEnergyFractionBands = calculateEarlyLateralEnergyFraction(
    midBandsSquared,
    sideBandsSquared,
    sampleRate
  );

  return {
    ...monauralResults,
    earlyLateralEnergyFractionBands,
    earlyLateralEnergyFraction: meanDecibel(
      earlyLateralEnergyFractionBands[1],
      earlyLateralEnergyFractionBands[2],
      earlyLateralEnergyFractionBands[3],
      earlyLateralEnergyFractionBands[4]
    ),
    sideE80BandsSquaredSum,
    sideL80BandsSquaredSum,
  };
}
