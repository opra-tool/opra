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
const A_WEIGHTING_CORRECTIONS = new OctaveBandValues([
  -26.3567, // 62.5 Hz
  -16.1897, // 125 Hz
  -8.67483, // 250 Hz
  -3.24781, // 500 Hz
  0, // 1000 Hz
  1.20167, // 2000 Hz
  0.963598, // 4000 Hz
  -1.14688, // 8000 Hz
]);

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
        earlyLateralSoundLevelBands.band(125),
        earlyLateralSoundLevelBands.band(250),
        earlyLateralSoundLevelBands.band(500),
        earlyLateralSoundLevelBands.band(1000)
      )
    : undefined;
  const lateLateralSoundLevel = lateLateralSoundLevelBands
    ? meanDecibelEnergetic(
        lateLateralSoundLevelBands.band(125),
        lateLateralSoundLevelBands.band(250),
        lateLateralSoundLevelBands.band(500),
        lateLateralSoundLevelBands.band(1000)
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
  return bandsSquaredSum.combine(
    lpe10,
    (value, lpe10Value) => 10 * safeLog10(value) - lpe10Value
  );
}

export function calculateAWeightedSoundStrength(
  soundStrength: OctaveBandValues
): number {
  return calculateMeanSoundStrength(
    soundStrength.combine(
      A_WEIGHTING_CORRECTIONS,
      (value, correction) => value + correction
    )
  );
}

export function calculateMeanSoundStrength(
  soundStrength: OctaveBandValues
): number {
  return meanDecibel(soundStrength.band(500), soundStrength.band(1000));
}

/**
 * As defined in G.A. Soulodre and J. S. Bradley (1995): Subjective evaluation
of new room acoustic measures
 */
export function calculateTrebleRatio(
  lateSoundStrength: OctaveBandValues
): number {
  return (
    lateSoundStrength.band(4000) -
    meanDecibel(lateSoundStrength.band(1000), lateSoundStrength.band(2000))
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
    earlySoundStrength.band(125),
    earlySoundStrength.band(250),
    earlySoundStrength.band(500)
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
  return (c80Bands.band(500) + c80Bands.band(1000)) / 2 + 0.62 * aWeighted;
}
