import { AppLogic } from './app-logic';
import { CLARITY_GROUP } from './acoustical-params/groups/clarity-group';
import { EARLY_LATERAL_ENERGY_FRACTION_GROUP } from './acoustical-params/groups/early-lateral-energy-fraction-group';
import { IACC_GROUP } from './acoustical-params/groups/iacc-group';
import { LATERAL_SOUND_LEVEL_GROUP } from './acoustical-params/groups/lateral-sound-level-group';
import { REVERBERATION_GROUP } from './acoustical-params/groups/reverberation-group';
import { SOUND_STRENGTH_GROUP } from './acoustical-params/groups/sound-strength-group';
import { BASS_RATIO_PARAMETER } from './acoustical-params/params/bass-ratio';
import {
  C50_PARAMETER,
  C80_PARAMETER,
} from './acoustical-params/params/c50c80';
import { CENTRE_TIME_PARAMETER } from './acoustical-params/params/centre-time';
import { EARLY_LATERAL_ENERGY_FRACTION_PARAMETER } from './acoustical-params/params/early-lateral-energy-fraction';
import {
  EARLY_IACC_PARAMETER,
  IACC_PARAMETER,
} from './acoustical-params/params/iacc';
import {
  EARLY_LATERAL_SOUND_LEVEL_PARAMETER,
  LATE_LATERAL_SOUND_LEVEL_PARAMETER,
} from './acoustical-params/params/lateral-sound-level';
import {
  EARLY_DECAY_TIME_PARAMETER,
  T20_PARAMETER,
} from './acoustical-params/params/reverberation';
import {
  A_WEIGHTED_SOUND_STRENGTH_PARAMETER,
  EARLY_BASS_LEVEL_PARAMETER,
  EARLY_SOUND_STRENGTH_PARAMETER,
  LATE_SOUND_STRENGTH_PARAMETER,
  LEVEL_ADJUSTED_C80_PARAMETER,
  SOUND_STRENGTH_PARAMETER,
  TREBLE_RATIO_PARAMETER,
} from './acoustical-params/params/sound-strength';
import { JSONFileExporter } from './exporter';
import { AppUI } from './ui/app-ui';
import { initUi } from './ui/init';

const allParams = [
  EARLY_DECAY_TIME_PARAMETER,
  T20_PARAMETER,
  CENTRE_TIME_PARAMETER,
  C50_PARAMETER,
  C80_PARAMETER,
  SOUND_STRENGTH_PARAMETER,
  EARLY_SOUND_STRENGTH_PARAMETER,
  LATE_SOUND_STRENGTH_PARAMETER,
  A_WEIGHTED_SOUND_STRENGTH_PARAMETER,
  LEVEL_ADJUSTED_C80_PARAMETER,
  TREBLE_RATIO_PARAMETER,
  BASS_RATIO_PARAMETER,
  EARLY_BASS_LEVEL_PARAMETER,
  EARLY_LATERAL_SOUND_LEVEL_PARAMETER,
  LATE_LATERAL_SOUND_LEVEL_PARAMETER,
  EARLY_LATERAL_ENERGY_FRACTION_PARAMETER,
  IACC_PARAMETER,
  EARLY_IACC_PARAMETER,
];

const displayedParams = [
  T20_PARAMETER,
  CENTRE_TIME_PARAMETER,
  SOUND_STRENGTH_PARAMETER,
  A_WEIGHTED_SOUND_STRENGTH_PARAMETER,
  C50_PARAMETER,
  C80_PARAMETER,
  LEVEL_ADJUSTED_C80_PARAMETER,
  TREBLE_RATIO_PARAMETER,
  BASS_RATIO_PARAMETER,
  EARLY_BASS_LEVEL_PARAMETER,
  IACC_PARAMETER,
  EARLY_LATERAL_ENERGY_FRACTION_PARAMETER,
  LATE_LATERAL_SOUND_LEVEL_PARAMETER,
];

const displayedParamGroups = [
  REVERBERATION_GROUP,
  CLARITY_GROUP,
  SOUND_STRENGTH_GROUP,
  LATERAL_SOUND_LEVEL_GROUP,
  EARLY_LATERAL_ENERGY_FRACTION_GROUP,
  IACC_GROUP,
];

const appLogic = new AppLogic(allParams);
const exporter = new JSONFileExporter(allParams, appLogic);

initUi(new AppUI(displayedParams, displayedParamGroups, appLogic, exporter));

// eslint-disable-next-line no-console
appLogic.init().catch(console.error);
