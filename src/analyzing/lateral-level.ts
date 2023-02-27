import { meanDecibelEnergetic } from '../math/decibels';
import { calculateSoundDampingInAir } from './dampening';
import { calculateLpe10 } from './lpe10';
import { MidSideResults } from './mid-side-processing';
import { getFrequencyValues } from './octave-band-frequencies';
import { calculateSoundStrength } from './strength';

export type LateralLevel = {
  earlyLateralLevelBands: number[];
  lateLateralLevelBands: number[];
  lateLateralLevel: number;
};

type Options = {
  p0: number;
  temperature: number;
  relativeHumidity: number;
};

export async function calculateLateralLevel(
  { sideE80BandsSquaredSum, sideL80BandsSquaredSum }: MidSideResults,
  { p0, temperature, relativeHumidity }: Options
): Promise<LateralLevel> {
  const airCoeffs = getFrequencyValues().map(frequency =>
    calculateSoundDampingInAir(temperature, relativeHumidity, frequency)
  );
  const lpe10 = await calculateLpe10(airCoeffs);

  const lateLateralLevelBands = calculateSoundStrength(
    sideL80BandsSquaredSum,
    p0,
    lpe10
  );

  return {
    earlyLateralLevelBands: calculateSoundStrength(
      sideE80BandsSquaredSum,
      p0,
      lpe10
    ),
    lateLateralLevelBands,
    lateLateralLevel: meanDecibelEnergetic(
      lateLateralLevelBands[1],
      lateLateralLevelBands[2],
      lateLateralLevelBands[3],
      lateLateralLevelBands[4]
    ),
  };
}
