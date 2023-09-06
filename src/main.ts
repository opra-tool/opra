import { AppLogic } from './app-logic';
import { CLARITY_GROUP } from './acoustical-param-definition/groups/clarity-group';
import { EARLY_LATERAL_ENERGY_FRACTION_GROUP } from './acoustical-param-definition/groups/early-lateral-energy-fraction-group';
import { IACC_GROUP } from './acoustical-param-definition/groups/iacc-group';
import { LATERAL_SOUND_LEVEL_GROUP } from './acoustical-param-definition/groups/lateral-sound-level-group';
import { REVERBERATION_GROUP } from './acoustical-param-definition/groups/reverberation-group';
import { SOUND_STRENGTH_GROUP } from './acoustical-param-definition/groups/sound-strength-group';
import { JSONFileExporter } from './exporter';
import { AppUI } from './ui/app-ui';
import { initUi } from './ui/init';
import { T20_PRESENTATION } from './acoustical-param-definition/params/reverberation';
import { BASS_RATIO_PRESENTATION } from './acoustical-param-definition/params/bass-ratio';
import {
  C50_PRESENTATION,
  C80_PRESENTATION,
} from './acoustical-param-definition/params/c50c80';
import { CENTRE_TIME_PRESENTATION } from './acoustical-param-definition/params/centre-time';
import { EARLY_LATERAL_ENERGY_FRACTION_PRESENTATION } from './acoustical-param-definition/params/early-lateral-energy-fraction';
import { IACC_PRESENTATION } from './acoustical-param-definition/params/iacc';
import { LATE_LATERAL_SOUND_LEVEL_PRESENTATION } from './acoustical-param-definition/params/lateral-sound-level';
import {
  SOUND_STRENGTH_PRESENTATION,
  A_WEIGHTED_SOUND_STRENGTH_PRESENTATION,
  LEVEL_ADJUSTED_C80_PRESENTATION,
  TREBLE_RATIO_PRESENTATION,
  EARLY_BASS_LEVEL_PRESENTATION,
} from './acoustical-param-definition/params/sound-strength';
import { ALL_PARAMS } from './acoustical-param-analyzing/params';
import { D50_PRESENTATION } from './acoustical-param-definition/params/d50';

const displayedParams = [
  T20_PRESENTATION,
  CENTRE_TIME_PRESENTATION,
  SOUND_STRENGTH_PRESENTATION,
  A_WEIGHTED_SOUND_STRENGTH_PRESENTATION,
  C50_PRESENTATION,
  C80_PRESENTATION,
  D50_PRESENTATION,
  LEVEL_ADJUSTED_C80_PRESENTATION,
  TREBLE_RATIO_PRESENTATION,
  BASS_RATIO_PRESENTATION,
  EARLY_BASS_LEVEL_PRESENTATION,
  IACC_PRESENTATION,
  EARLY_LATERAL_ENERGY_FRACTION_PRESENTATION,
  LATE_LATERAL_SOUND_LEVEL_PRESENTATION,
];

const displayedParamGroups = [
  REVERBERATION_GROUP,
  CLARITY_GROUP,
  SOUND_STRENGTH_GROUP,
  LATERAL_SOUND_LEVEL_GROUP,
  EARLY_LATERAL_ENERGY_FRACTION_GROUP,
  IACC_GROUP,
];

const appLogic = new AppLogic();
const exporter = new JSONFileExporter(
  ALL_PARAMS.map(({ id }) => id),
  appLogic
);

initUi(new AppUI(displayedParams, displayedParamGroups, appLogic, exporter));

// eslint-disable-next-line no-console
appLogic.init().catch(console.error);
