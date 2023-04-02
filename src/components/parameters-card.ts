import { msg, localized } from '@lit/localize';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../analyzing/impulse-response';
import { isFreeOfNullValues, mapArrayParam } from '../arrays';
import { Strengths } from '../analyzing/strength';
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
  centreTimes: number[] = [];

  @property({ type: Array })
  bassRatios: number[] = [];

  @property({ type: Array })
  c80s: number[] = [];

  @property({ type: Array })
  reverbTimes: number[] = [];

  @property({ type: Array })
  iaccs: (number | null)[] = [];

  @property({ type: Array })
  strengths: (Strengths | null)[] = [];

  @property({ type: Array })
  earlyLateralEnergyFractions: (number | null)[] = [];

  @property({ type: Array })
  lateLateralLevels: (number | null)[] = [];

  render() {
    const parameters: Parameter[] = [
      {
        name: html`${msg('Reverb Time')}, T<sub>20</sub>`,
        description: `${msg('Perceived reverberance')} • ISO 3382-1`,
        unit: UNIT_SECONDS,
        responseValues: this.reverbTimes,
        position: 1,
      },
      {
        name: html`${msg('Centre Time')}, T<sub>S</sub>`,
        description: `${msg('Perceived clarity of sound')} • ISO 3382-1`,
        unit: UNIT_SECONDS,
        responseValues: this.centreTimes,
        position: 2,
      },
      {
        name: html`${msg('Clarity')}, C<sub>80</sub>`,
        description: `${msg('Perceived clarity of sound')} • ISO 3382-1`,
        unit: UNIT_DECIBELS,
        responseValues: this.c80s,
        position: 5,
      },
      {
        name: `${msg('Bass Ratio')}, BR`,
        description: `${msg('Perceived bass')} • L.L. Beranek`,
        responseValues: this.bassRatios,
        position: 8,
      },
      {
        name: `${msg('Interaural Cross Correlation')}, IACC`,
        description: `${msg('Spatial impression')} • ISO 3382-1`,
        responseValues: this.iaccs,
        position: 10,
      },
    ];

    if (isFreeOfNullValues(this.strengths)) {
      const averageStrengths = mapArrayParam(this.strengths, 'averageStrength');
      const trebleRatios = mapArrayParam(this.strengths, 'trebleRatio');
      const earlyBassLevels = mapArrayParam(this.strengths, 'earlyBassLevel');
      const aWeighted = mapArrayParam(this.strengths, 'aWeighted');
      const levelAdjustedC80 = mapArrayParam(
        this.strengths,
        'levelAdjustedC80'
      );

      parameters.push({
        name: html`${msg('Sound Strength')}, G`,
        description: `${msg('Subjective level of sound')} • ISO 3382-1`,
        responseValues: averageStrengths,
        unit: UNIT_DECIBELS,
        position: 3,
      });
      parameters.push({
        name: html`${msg('A-weighted Sound Strength')}, G(A)`,
        description: `${msg('Subjective level of sound')} • ${msg(
          'Soulodre and Bradley (1995)'
        )}`,
        responseValues: aWeighted,
        unit: UNIT_DECIBELS_A,
        position: 4,
      });
      parameters.push({
        name: html`${msg('Level-Adjusted')} C<sub>80</sub>`,
        description: `${msg('Perceived clarity of sound')} • ${msg(
          'Soulodre and Bradley (1995)'
        )}`,
        responseValues: levelAdjustedC80,
        unit: UNIT_DECIBELS_A,
        position: 6,
      });
      parameters.push({
        name: msg('Treble Ratio'),
        description: `${msg('Perceived treble')} • ${msg(
          'Soulodre and Bradley (1995)'
        )}`,
        responseValues: trebleRatios,
        unit: UNIT_DECIBELS,
        position: 7,
      });
      parameters.push({
        name: msg('Early Bass Level'),
        description: `${msg('Perceived bass')} • ${msg(
          'Soulodre and Bradley (1995)'
        )}`,
        responseValues: earlyBassLevels,
        unit: UNIT_DECIBELS,
        position: 9,
      });
    }

    parameters.push({
      name: html`${msg('Early Lateral Energy Fraction')}, J<sub>LF</sub>`,
      description: `${msg('Apparent source width (ASW)')} • ISO 3382-1`,
      responseValues: this.earlyLateralEnergyFractions,
      position: 11,
    });
    parameters.push({
      name: html`${msg('Late Lateral Sound Level')}, L<sub>J</sub>`,
      description: `${msg('Listener envelopment (LEV)')} • ISO 3382-1`,
      responseValues: this.lateLateralLevels,
      unit: UNIT_DECIBELS,
      position: 12,
    });

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
