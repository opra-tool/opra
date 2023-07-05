import { msg } from '@lit/localize';
import { html } from 'lit';
import { iacc as wasmIacc } from 'opra-wasm-module';
import { createOctaveBandParameterDefinition } from '../param-definition';
import { e80Calc } from '../early-late-fractions';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const IACC_PARAMETER = createOctaveBandParameterDefinition(
  {
    id: 'iacc',
    name: () => msg('Interaural Cross Correlation'),
    description: () => msg('Spatial impression'),
    symbol: 'IACC',
    source: REFERENCE_ISO_3382_1_2009,
    forType: 'binaural',
    environmentDependent: false,
  },
  bands =>
    bands.collect(band => wasmIacc(band.getChannel(0), band.getChannel(1))),
  octaveBandValues =>
    (octaveBandValues.band(125) +
      octaveBandValues.band(250) +
      octaveBandValues.band(500) +
      octaveBandValues.band(1000) +
      octaveBandValues.band(2000) +
      octaveBandValues.band(4000)) /
    6
);

export const EARLY_IACC_PARAMETER = createOctaveBandParameterDefinition(
  {
    id: 'eiacc',
    name: () => msg('Early Interaural Cross Correlation'),
    description: () => msg('Spatial impression'),
    symbol: html`IACC<sub>early</sub>`,
    source: REFERENCE_ISO_3382_1_2009,
    forType: 'binaural',
    environmentDependent: false,
  },
  bands =>
    bands.collect(band => {
      const e80 = e80Calc(band);

      return wasmIacc(e80.getChannel(0), e80.getChannel(1));
    }),
  octaveBandValues =>
    (octaveBandValues.band(125) +
      octaveBandValues.band(250) +
      octaveBandValues.band(500) +
      octaveBandValues.band(1000) +
      octaveBandValues.band(2000) +
      octaveBandValues.band(4000)) /
    6
);
