import { msg } from '@lit/localize';
import { html } from 'lit';
import { REFERENCE_ISO_3382_1_2009 } from '../references';
import { createParam } from '../param';

export const CENTRE_TIME_PRESENTATION = createParam({
  id: 'centreTime',
  name: () => msg('Centre Time'),
  description: () => msg('Perceived clarity of sound'),
  symbol: () => html`T<sub>S</sub>`,
  unit: 's',
  source: REFERENCE_ISO_3382_1_2009,
});
