import { msg } from '@lit/localize';
import { html } from 'lit';
import { AcousticalParamGroup } from '../param-group';
import { REFERENCE_ISO_3382_1_2009 } from '../references';
import {
  EARLY_DECAY_TIME_PRESENTATION,
  T20_PRESENTATION,
} from '../params/reverberation';

export const REVERBERATION_GROUP: AcousticalParamGroup = {
  id: 'reverberation',
  params: [EARLY_DECAY_TIME_PRESENTATION, T20_PRESENTATION],
  name: () => msg('Reverberation'),
  description: () => html`
    <div>
      <p>
        ${msg(`
          The Reverberation time has been a popular parameter to rate room acoustical impressions for well over a century.
          It describes the time needed, until the sound energy has decreased by 60 dB after the source emission stopped
        `)}
        <reference-paper
          .paper=${REFERENCE_ISO_3382_1_2009}
          parenthesis
        ></reference-paper
        >.
      </p>

      <p>
        ${msg(html`
          It is usually infeasible to measure a sound energy decrease of 60 dB.
          The reverberation time is thus measured by extrapolating a linear
          regression line fitted to the decrease from -5dB to -25dB. The early
          decay time is similarly calculated using 0 and -10dB to fit the
          regression line.
        `)}
      </p>
    </div>
  `,
};
