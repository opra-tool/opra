import { BASS_RATIO } from './param-implementation/bass-ratio';
import { C50, C80 } from './param-implementation/c50c80';
import { CENTRE_TIME } from './param-implementation/centre-time';
import { D50 } from './param-implementation/d50';
import { EARLY_LATERAL_ENERGY_FRACTION } from './param-implementation/early-lateral-energy-fraction';
import { IACC, EARLY_IACC } from './param-implementation/iacc';
import {
  EARLY_LATERAL_SOUND_LEVEL,
  LATE_LATERAL_SOUND_LEVEL,
} from './param-implementation/lateral-sound-level';
import { EARLY_DECAY_TIME, T20 } from './param-implementation/reverberation';
import {
  SOUND_STRENGTH,
  EARLY_SOUND_STRENGTH,
  LATE_SOUND_STRENGTH,
  A_WEIGHTED_SOUND_STRENGTH,
  LEVEL_ADJUSTED_C80,
  TREBLE_RATIO,
  EARLY_BASS_LEVEL,
} from './param-implementation/sound-strength';

export const ALL_PARAMS = [
  EARLY_DECAY_TIME,
  T20,
  CENTRE_TIME,
  C50,
  C80,
  D50,
  SOUND_STRENGTH,
  EARLY_SOUND_STRENGTH,
  LATE_SOUND_STRENGTH,
  A_WEIGHTED_SOUND_STRENGTH,
  LEVEL_ADJUSTED_C80,
  TREBLE_RATIO,
  BASS_RATIO,
  EARLY_BASS_LEVEL,
  EARLY_LATERAL_SOUND_LEVEL,
  LATE_LATERAL_SOUND_LEVEL,
  EARLY_LATERAL_ENERGY_FRACTION,
  IACC,
  EARLY_IACC,
];

export const ENVIRONMENT_DEPENDENT_PARAMS = [
  SOUND_STRENGTH,
  EARLY_SOUND_STRENGTH,
  LATE_SOUND_STRENGTH,
  A_WEIGHTED_SOUND_STRENGTH,
  LEVEL_ADJUSTED_C80,
  EARLY_BASS_LEVEL,
  EARLY_LATERAL_SOUND_LEVEL,
  LATE_LATERAL_SOUND_LEVEL,
];
