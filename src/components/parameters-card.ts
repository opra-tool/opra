import { msg, localized } from '@lit/localize';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Results } from '../analyzing/analyzer';
import { ImpulseResponse } from '../analyzing/impulse-response';
import {
  UNIT_DECIBELS,
  UNIT_DECIBELS_A,
  UNIT_SECONDS,
} from '../presentation/units';
import { Parameter } from './parameters-table';

@localized()
@customElement('parameters-card')
export class ParametersCard extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  results: Results[] = [];

  render() {
    const parameters: Parameter[] = [
      {
        name: html`${msg('Reverb Time')}, T<sub>20</sub>`,
        description: `${msg('Perceived reverberance')} • ISO 3382-1`,
        unit: UNIT_SECONDS,
        responseValues: this.results.map(r => r.reverbTime),
      },
      {
        name: html`${msg('Centre Time')}, T<sub>S</sub>`,
        description: `${msg('Perceived clarity of sound')} • ISO 3382-1`,
        unit: UNIT_SECONDS,
        responseValues: this.results.map(r => r.centreTime),
      },
      {
        name: html`${msg('Sound Strength')}, G`,
        description: `${msg('Subjective level of sound')} • ISO 3382-1`,
        responseValues: this.results.map(r => r.strength),
        unit: UNIT_DECIBELS,
      },
      {
        name: html`${msg('A-weighted Sound Strength')}, G(A)`,
        description: `${msg('Subjective level of sound')} • ${msg(
          'Soulodre and Bradley (1995)'
        )}`,
        responseValues: this.results.map(r => r.aWeightedStrength),
        unit: UNIT_DECIBELS_A,
      },
      {
        name: html`${msg('Clarity')}, C<sub>80</sub>`,
        description: `${msg('Perceived clarity of sound')} • ISO 3382-1`,
        unit: UNIT_DECIBELS,
        responseValues: this.results.map(r => r.c80),
      },
      {
        name: html`${msg('Level-Adjusted')} C<sub>80</sub>`,
        description: `${msg('Perceived clarity of sound')} • ${msg(
          'Soulodre and Bradley (1995)'
        )}`,
        responseValues: this.results.map(r => r.levelAdjustedC80),
        unit: UNIT_DECIBELS_A,
      },
      {
        name: msg('Treble Ratio'),
        description: `${msg('Perceived treble')} • ${msg(
          'Soulodre and Bradley (1995)'
        )}`,
        responseValues: this.results.map(r => r.trebleRatio),
        unit: UNIT_DECIBELS,
      },
      {
        name: `${msg('Bass Ratio')}, BR`,
        description: `${msg('Perceived bass')} • L.L. Beranek`,
        responseValues: this.results.map(r => r.bassRatio),
      },
      {
        name: msg('Early Bass Level'),
        description: `${msg('Perceived bass')} • ${msg(
          'Soulodre and Bradley (1995)'
        )}`,
        responseValues: this.results.map(r => r.earlyBassLevel),
        unit: UNIT_DECIBELS,
      },
      {
        name: `${msg('Interaural Cross Correlation')}, IACC`,
        description: `${msg('Spatial impression')} • ISO 3382-1`,
        responseValues: this.results.map(r => r.iacc),
      },
      {
        name: html`${msg('Early Lateral Energy Fraction')}, J<sub>LF</sub>`,
        description: `${msg('Apparent source width (ASW)')} • ISO 3382-1`,
        responseValues: this.results.map(r => r.earlyLateralEnergyFraction),
      },
      {
        name: html`${msg('Late Lateral Sound Level')}, L<sub>J</sub>`,
        description: `${msg('Listener envelopment (LEV)')} • ISO 3382-1`,
        responseValues: this.results.map(r => r.lateLateralSoundLevel),
        unit: UNIT_DECIBELS,
      },
    ];

    return html`
      <titled-card cardTitle=${msg('Single-Figure Parameters')}>
        <parameters-table
          .impulseResponses=${this.impulseResponses}
          .parameters=${parameters}
        ></parameters-table>
        <slot></slot>
      </titled-card>
    `;
  }
}
