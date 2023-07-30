import { meanDecibel } from '../../math/decibels';
import { safeLog10 } from '../../math/safeLog10';
import { OctaveBandValues } from '../../transfer-objects/octave-bands';
import { e50Calc, e80Calc, l80Calc } from '../early-late-fractions';
import {
  createOctaveBandParameterImplementation,
  createSingleFigureParameterImplementation,
} from '../param-implementation';
import { C80 } from './c50c80';

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

export const SOUND_STRENGTH = createOctaveBandParameterImplementation(
  'soundStrength',
  'omnidirectional',
  (bands, _, lpe10) =>
    bands.collect(
      (band, centerFrequency) =>
        10 * safeLog10(band.squaredSum()) - lpe10.band(centerFrequency)
    ),
  octaveBandValues =>
    meanDecibel(octaveBandValues.band(500), octaveBandValues.band(1000))
);

export const EARLY_SOUND_STRENGTH = createOctaveBandParameterImplementation(
  'earlySoundStrength',
  'omnidirectional',
  (bands, _, lpe10) =>
    bands.collect(
      (band, centerFrequency) =>
        10 * safeLog10(e80Calc(band).squaredSum()) - lpe10.band(centerFrequency)
    ),
  octaveBandValues =>
    meanDecibel(octaveBandValues.band(500), octaveBandValues.band(1000))
);

export const LATE_SOUND_STRENGTH = createOctaveBandParameterImplementation(
  'lateSoundStrength',
  'omnidirectional',
  (bands, _, lpe10) =>
    bands.collect(
      (band, centerFrequency) =>
        10 * safeLog10(l80Calc(band).squaredSum()) - lpe10.band(centerFrequency)
    ),
  octaveBandValues =>
    meanDecibel(octaveBandValues.band(500), octaveBandValues.band(1000))
);

export const A_WEIGHTED_SOUND_STRENGTH =
  createSingleFigureParameterImplementation(
    'aWeightedSoundStrength',
    'omnidirectional',
    (_, { lookupOctaveBands }) => {
      const soundStrength = lookupOctaveBands(SOUND_STRENGTH.id);

      const aWeighted = soundStrength.transform(
        (val, centerFrequency) =>
          val + A_WEIGHTING_CORRECTIONS.band(centerFrequency)
      );

      return meanDecibel(aWeighted.band(500), aWeighted.band(1000));
    }
  );

export const TREBLE_RATIO = createSingleFigureParameterImplementation(
  'trebleRatio',
  'omnidirectional',
  (_, { lookupOctaveBands }) => {
    const lateSoundStrength = lookupOctaveBands(LATE_SOUND_STRENGTH.id);

    return (
      lateSoundStrength.band(4000) -
      meanDecibel(lateSoundStrength.band(1000), lateSoundStrength.band(2000))
    );
  }
);

export const EARLY_BASS_LEVEL = createSingleFigureParameterImplementation(
  'earlyBassLevel',
  'omnidirectional',
  (bands, _, lpe10) => {
    const e50SoundStrength = bands.collect(
      (band, centerFrequency) =>
        10 * safeLog10(e50Calc(band).squaredSum()) - lpe10.band(centerFrequency)
    );

    return meanDecibel(
      e50SoundStrength.band(125),
      e50SoundStrength.band(250),
      e50SoundStrength.band(500)
    );
  }
);

export const LEVEL_ADJUSTED_C80 = createSingleFigureParameterImplementation(
  'levelAdjustedC80',
  'omnidirectional',
  (_, { lookupSingleFigure, lookupOctaveBands }) => {
    const c80 = lookupOctaveBands(C80.id);
    const aWeighted = lookupSingleFigure(A_WEIGHTED_SOUND_STRENGTH.id);

    return (c80.band(500) + c80.band(1000)) / 2 + 0.62 * aWeighted;
  }
);
