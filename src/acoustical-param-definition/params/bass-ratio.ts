import { msg } from '@lit/localize';
import { createParam } from '../param';
import { REFERENCE_BERANEK_1962 } from '../references';

export const BASS_RATIO_PRESENTATION = createParam({
  id: 'bassRatio',
  name: () => msg('Bass Ratio'),
  description: () => msg('Perceived bass'),
  symbol: () => 'BR',
  source: REFERENCE_BERANEK_1962,
});
