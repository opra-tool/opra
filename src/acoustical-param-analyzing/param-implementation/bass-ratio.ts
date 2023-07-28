import { createSingleFigureParameterImplementation } from '../param-implementation';
import { T20 } from './reverberation';

export const BASS_RATIO = createSingleFigureParameterImplementation(
  'bassRatio',
  'omnidirectional',
  (_, { lookupOctaveBands }) => {
    const t20Bands = lookupOctaveBands(T20.id);

    return (
      (t20Bands.band(125) + t20Bands.band(250)) /
      (t20Bands.band(500) + t20Bands.band(1000))
    );
  }
);
