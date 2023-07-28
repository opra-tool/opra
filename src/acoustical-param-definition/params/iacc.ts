import { msg } from '@lit/localize';
import { html } from 'lit';
import { createParam } from '../param';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const IACC_PRESENTATION = createParam({
  id: 'iacc',
  name: () => msg('Interaural Cross Correlation'),
  description: () => msg('Spatial impression'),
  symbol: () => 'IACC',
  source: REFERENCE_ISO_3382_1_2009,
});

export const EARLY_IACC_PRESENTATION = createParam({
  id: 'eiacc',
  name: () => msg('Early Interaural Cross Correlation'),
  description: () => msg('Spatial impression'),
  symbol: () => html`IACC<sub>early</sub>`,
  source: REFERENCE_ISO_3382_1_2009,
});
