import { msg, localized } from '@lit/localize';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../analyzing/impulse-response';
import { isFreeOfNullValues, mapArrayParam } from '../arrays';
import { Strengths } from '../analyzing/strength';
import {
  UNIT_DECIBELS,
  UNIT_DECIBELS_A,
  UNIT_MILLISECONDS,
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
        name: html`${msg('Reverb Time')} <i>T<sub>20</sub></i>`,
        badge: '500Hz - 1kHz',
        description: `${msg('according to')} ISO 3382-1`,
        unit: UNIT_SECONDS,
        responseValues: this.reverbTimes,
        position: 1,
      },
      {
        name: html`${msg('Centre Time')} <i>T<sub>S</sub></i>`,
        badge: '500Hz - 1kHz',
        description: `${msg(
          'Perceived clarity of sound, according to'
        )} ISO 3382-1`,
        unit: UNIT_MILLISECONDS,
        responseValues: this.centreTimes,
        position: 2,
      },
      {
        name: html`${msg('Clarity')} <i>C<sub>80</sub></i>`,
        badge: '500Hz - 1kHz',
        description: `${msg(
          'Perceived clarity of sound, according to'
        )} ISO 3382-1`,
        unit: UNIT_DECIBELS,
        responseValues: this.c80s,
        position: 5,
      },
      {
        name: html`${msg('Bass Ratio')} <i>BR</i>`,
        description: `${msg('as defined by')} L.L. Beranek`,
        responseValues: this.bassRatios,
        position: 8,
      },
      {
        name: msg('Interaural Cross Correlation'),
        badge: '125Hz - 4kHz',
        description: `${msg('according to')} ISO 3382-1`,
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
        name: html`${msg('Sound Strength')} <i>G</i>`,
        badge: '500Hz - 1kHz',
        description: `${msg(
          'Subjective level of sound, according to'
        )} ISO 3382-1`,
        responseValues: averageStrengths,
        unit: UNIT_DECIBELS,
        position: 3,
      });
      parameters.push({
        name: html`${msg('A-weighted Sound Strength')} <i>G(A)</i>`,
        badge: '500Hz - 1kHz',
        description: msg('as defined by Soulodre and Bradley (1995)'),
        responseValues: aWeighted,
        unit: UNIT_DECIBELS_A,
        position: 4,
      });
      parameters.push({
        name: html`${msg('Level-Adjusted')} C<sub>80</sub>`,
        badge: '500Hz - 1kHz',
        description: msg(
          'Perceived clarity rating, as defined by Soulodre and Bradley (1995)'
        ),
        responseValues: levelAdjustedC80,
        unit: UNIT_DECIBELS_A,
        position: 6,
      });
      parameters.push({
        name: msg('Treble Ratio'),
        description: msg('as defined by Soulodre and Bradley (1995)'),
        responseValues: trebleRatios,
        unit: UNIT_DECIBELS,
        position: 7,
      });
      parameters.push({
        name: msg('Early Bass Level'),
        description: msg('as defined by Soulodre and Bradley (1995)'),
        responseValues: earlyBassLevels,
        unit: UNIT_DECIBELS,
        position: 9,
      });
    }

    parameters.push({
      name: msg('Early Lateral Energy Fraction'),
      badge: '125Hz - 1kHz',
      description: `${msg('according to')} ISO 3382-1`,
      responseValues: this.earlyLateralEnergyFractions,
      position: 11,
    });
    parameters.push({
      name: msg('Late Lateral Sound Level'),
      badge: '125Hz - 1kHz',
      description: `${msg('according to')} ISO 3382-1`,
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
