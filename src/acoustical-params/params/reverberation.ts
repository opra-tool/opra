import { msg } from '@lit/localize';
import { html } from 'lit';
import {
  calculate_early_decay_time as wasmCalculateEarlyDecayTime,
  calculate_t20 as wasmCalculateT20,
} from 'wasm-raqi-online-toolbox';
import { createOctaveBandParameterDefinition } from '../param-definition';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const EARLY_DECAY_TIME_PARAMETER = createOctaveBandParameterDefinition(
  {
    id: 'earlyDecayTime',
    symbol: 'EDT',
    name: () => msg('Early Decay Time'),
    description: () => msg('Perceived reverberance'),
    unit: 's',
    source: REFERENCE_ISO_3382_1_2009,
    forType: 'monaural',
    environmentDependent: false,
  },
  bands =>
    bands.collect(buffer =>
      wasmCalculateEarlyDecayTime(buffer.getChannel(0), buffer.sampleRate)
    ),
  octaveBandValues =>
    (octaveBandValues.band(500) + octaveBandValues.band(1000)) / 2
);

export const T20_PARAMETER = createOctaveBandParameterDefinition(
  {
    id: 't20',
    symbol: html`T<sub>20</sub>`,
    name: () => msg('Reverberation Time'),
    description: () => msg('Perceived reverberance'),
    unit: 's',
    source: REFERENCE_ISO_3382_1_2009,
    forType: 'monaural',
    environmentDependent: false,
  },
  bands =>
    bands.collect(buffer =>
      wasmCalculateT20(buffer.getChannel(0), buffer.sampleRate)
    ),
  octaveBandValues =>
    (octaveBandValues.band(500) + octaveBandValues.band(1000)) / 2
);
