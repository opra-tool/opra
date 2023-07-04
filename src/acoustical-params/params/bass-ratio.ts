import { msg } from '@lit/localize';
import { createSingleFigureParameterDefinition } from '../param-definition';
import { REFERENCE_BERANEK_1962 } from '../references';
import { T20_PARAMETER } from './reverberation';

export const BASS_RATIO_PARAMETER = createSingleFigureParameterDefinition(
  {
    id: 'bassRatio',
    name: () => msg('Bass Ratio'),
    description: () => msg('Perceived bass'),
    symbol: 'BR',
    source: REFERENCE_BERANEK_1962,
    forType: 'monaural',
    environmentDependent: false,
  },
  (_, { lookupOctaveBands }) => {
    const t20Bands = lookupOctaveBands(T20_PARAMETER.id);

    return (
      (t20Bands.band(125) + t20Bands.band(250)) /
      (t20Bands.band(500) + t20Bands.band(1000))
    );
  }
);
