import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { isFreeOfNullValues, mapArrayParam } from '../arrays';
import { ResponseDetail } from '../audio/response-detail';
import { Strengths } from '../strength';
import { UNIT_DECIBELS, UNIT_MILLISECONDS } from '../units';
import { Parameter } from './parameters-table';

@customElement('parameters-card')
export class ParametersCard extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array })
  schwerpunktzeiten: number[] = [];

  @property({ type: Array })
  bassRatios: number[] = [];

  @property({ type: Array })
  strengths: (Strengths | null)[] = [];

  render() {
    const parameters: Parameter[] = [
      {
        name: 'Schwerpunktzeit',
        description: 'according to ISO 3382-1',
        unit: UNIT_MILLISECONDS,
        responseValues: this.schwerpunktzeiten,
      },
      {
        name: 'Bass Ratio',
        responseValues: this.bassRatios,
      },
    ];

    if (isFreeOfNullValues(this.strengths)) {
      const averageStrengths = mapArrayParam(this.strengths, 'averageStrength');
      const trebleRatios = mapArrayParam(this.strengths, 'trebleRatio');
      const earlyBassStrengths = mapArrayParam(
        this.strengths,
        'earlyBassStrength'
      );
      const aWeighted = mapArrayParam(this.strengths, 'aWeighted');
      const aWeightedC80 = mapArrayParam(this.strengths, 'aWeightedC80');

      parameters.push({
        name: 'Avg. Strength',
        description: 'according to ISO 3382-1',
        responseValues: averageStrengths,
        unit: UNIT_DECIBELS,
      });
      parameters.push({
        name: 'Treble Ratio',
        responseValues: trebleRatios,
      });
      parameters.push({
        name: 'Early Bass Strength',
        responseValues: earlyBassStrengths,
        unit: UNIT_DECIBELS,
      });
      parameters.push({
        name: 'A-Weighted Avg. Strength',
        description: 'parameter is currently not reliably calculated',
        responseValues: aWeighted,
        unit: UNIT_DECIBELS,
      });
      parameters.push({
        name: 'A-Weighted Avg. C80',
        description: 'parameter is currently not reliably calculated',
        responseValues: aWeightedC80,
        unit: UNIT_DECIBELS,
      });
    }

    return html`
      <base-card>
        <parameters-table
          .responseDetails=${this.responseDetails}
          .parameters=${parameters}
        ></parameters-table>
        <slot></slot>
      </base-card>
    `;
  }
}
