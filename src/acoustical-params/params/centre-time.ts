import { msg } from '@lit/localize';
import { html } from 'lit';
import { createSingleFigureParameterDefinition } from '../param-definition';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const CENTRE_TIME_PARAMETER = createSingleFigureParameterDefinition(
  {
    id: 'centreTime',
    name: () => msg('Centre Time'),
    description: () => msg('Perceived clarity of sound'),
    symbol: html`T<sub>S</sub>`,
    unit: 's',
    source: REFERENCE_ISO_3382_1_2009,
    forType: 'omnidirectional',
    environmentDependent: false,
  },
  bands => {
    const centreTimes = [bands.band(500), bands.band(1000)].map(band => {
      const samples = band.getChannel(0);

      let numerator = 0;
      let denominator = 0;

      for (let i = 0; i < band.length; i++) {
        const t = i / bands.sampleRate;
        numerator += t * samples[i];
        denominator += samples[i];
      }

      return numerator / denominator;
    });

    return (centreTimes[0] + centreTimes[1]) / 2;
  }
);
