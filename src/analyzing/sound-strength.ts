import { calculateLpe10 } from './lpe10';
import { meanDecibel, meanDecibelEnergetic } from '../math/decibels';
import { safeLog10 } from '../math/safeLog10';
import { IRBuffer } from './buffer';
import { OctaveBandValues } from './octave-bands';

type SoundStrengths = {
  soundStrengthBands: OctaveBandValues;
  earlySoundStrengthBands: OctaveBandValues;
  lateSoundStrengthBands: OctaveBandValues;
  soundStrength: number;
  earlySoundStrength: number;
  lateSoundStrength: number;
  aWeightedSoundStrength: number;
  trebleRatio: number;
  earlyBassLevel: number;
  levelAdjustedC80: number;
  /* strength-based mid/side parameters */
  earlyLateralSoundLevelBands?: OctaveBandValues;
  lateLateralSoundLevelBands?: OctaveBandValues;
  earlyLateralSoundLevel?: number;
  lateLateralSoundLevel?: number;
};

type Input = {
  bandsSquaredSum: OctaveBandValues;
  e50BandsSquaredSum: OctaveBandValues;
  e80BandsSquaredSum: OctaveBandValues;
  l80BandsSquaredSum: OctaveBandValues;
  c80Bands: OctaveBandValues;
  sideE80BandsSquaredSum?: OctaveBandValues;
  sideL80BandsSquaredSum?: OctaveBandValues;
};

type EnvironmentParameters = {
  airTemperature: number;
  relativeHumidity: number;
  distanceFromSource: number;
};

/**
 * Calculated as defined in IEC 61672-1:2013.
 *
 * Note: The value for 1kHz has been rounded to 0
 */
const A_WEIGHTING_CORRECTIONS = [
  -26.3567, // 62.5 Hz
  -16.1897, // 125 Hz
  -8.67483, // 250 Hz
  -3.24781, // 500 Hz
  0, // 1000 Hz
  1.20167, // 2000 Hz
  0.963598, // 4000 Hz
  -1.14688, // 8000 Hz
];

export async function calculateStrengths(
  buffer: IRBuffer,
  {
    bandsSquaredSum,
    e50BandsSquaredSum,
    e80BandsSquaredSum,
    l80BandsSquaredSum,
    sideE80BandsSquaredSum,
    sideL80BandsSquaredSum,
    c80Bands,
  }: Input,
  environment: EnvironmentParameters
): Promise<SoundStrengths> {
  const lpe10 = await calculateLpe10(buffer, environment);

  const soundStrengthBands = calculateSoundStrength(bandsSquaredSum, lpe10);
  const earlySoundStrengthBands = calculateSoundStrength(
    e80BandsSquaredSum,
    lpe10
  );
  const lateSoundStrengthBands = calculateSoundStrength(
    l80BandsSquaredSum,
    lpe10
  );
  const soundStrength = calculateMeanSoundStrength(soundStrengthBands);
  const earlySoundStrength = calculateMeanSoundStrength(
    earlySoundStrengthBands
  );
  const lateSoundStrength = calculateMeanSoundStrength(lateSoundStrengthBands);
  const aWeightedSoundStrength =
    calculateAWeightedSoundStrength(soundStrengthBands);
  const trebleRatio = calculateTrebleRatio(lateSoundStrengthBands);
  const earlyBassLevel = calculateEarlyBassLevel(
    calculateSoundStrength(e50BandsSquaredSum, lpe10)
  );
  const levelAdjustedC80 = calculateLevelAdjustedC80(
    c80Bands,
    aWeightedSoundStrength
  );

  const earlyLateralSoundLevelBands = sideE80BandsSquaredSum
    ? calculateSoundStrength(sideE80BandsSquaredSum, lpe10)
    : undefined;
  const lateLateralSoundLevelBands = sideL80BandsSquaredSum
    ? calculateSoundStrength(sideL80BandsSquaredSum, lpe10)
    : undefined;
  const earlyLateralSoundLevel = earlyLateralSoundLevelBands
    ? meanDecibelEnergetic(
        earlyLateralSoundLevelBands.band(1),
        earlyLateralSoundLevelBands.band(2),
        earlyLateralSoundLevelBands.band(3),
        earlyLateralSoundLevelBands.band(4)
      )
    : undefined;
  const lateLateralSoundLevel = lateLateralSoundLevelBands
    ? meanDecibelEnergetic(
        lateLateralSoundLevelBands.band(1),
        lateLateralSoundLevelBands.band(2),
        lateLateralSoundLevelBands.band(3),
        lateLateralSoundLevelBands.band(4)
      )
    : undefined;

  return {
    soundStrengthBands,
    earlySoundStrengthBands,
    lateSoundStrengthBands,
    soundStrength,
    earlySoundStrength,
    lateSoundStrength,
    trebleRatio,
    earlyBassLevel,
    aWeightedSoundStrength,
    levelAdjustedC80,
    earlyLateralSoundLevelBands,
    lateLateralSoundLevelBands,
    earlyLateralSoundLevel,
    lateLateralSoundLevel,
  };
}

export function calculateSoundStrength(
  bandsSquaredSum: OctaveBandValues,
  lpe10: OctaveBandValues
): OctaveBandValues {
  return bandsSquaredSum.transform(
    (bandSum, i) => 10 * safeLog10(bandSum) - lpe10.band(i)
  );
}

export function calculateAWeightedSoundStrength(
  soundStrength: OctaveBandValues
): number {
  return calculateMeanSoundStrength(
    soundStrength.transform((val, i) => val + A_WEIGHTING_CORRECTIONS[i])
  );
}

export function calculateMeanSoundStrength(
  soundStrength: OctaveBandValues
): number {
  return meanDecibel(soundStrength.band(3), soundStrength.band(4));
}

/**
 * As defined in G.A. Soulodre and J. S. Bradley (1995): Subjective evaluation
of new room acoustic measures
 */
export function calculateTrebleRatio(
  lateSoundStrength: OctaveBandValues
): number {
  return (
    lateSoundStrength.band(6) -
    meanDecibel(lateSoundStrength.band(4), lateSoundStrength.band(5))
  );
}

/**
 * As defined in G.A. Soulodre and J. S. Bradley (1995): Subjective evaluation
of new room acoustic measures
 */
export function calculateEarlyBassLevel(
  earlySoundStrength: OctaveBandValues
): number {
  return meanDecibel(
    earlySoundStrength.band(1),
    earlySoundStrength.band(2),
    earlySoundStrength.band(3)
  );
}

/**
 * As defined in G.A. Soulodre and J. S. Bradley (1995): Subjective evaluation
of new room acoustic measures
 */
export function calculateLevelAdjustedC80(
  c80Bands: OctaveBandValues,
  aWeighted: number
): number {
  return (c80Bands.band(3) + c80Bands.band(4)) / 2 + 0.62 * aWeighted;
}
