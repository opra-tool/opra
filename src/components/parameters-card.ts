import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { isFreeOfNullValues, mapArrayParam } from '../arrays';
import { ResponseDetail } from '../audio/response-detail';
import { Strengths } from '../strength';
import {
  UNIT_DECIBELS,
  UNIT_DECIBELS_A,
  UNIT_MILLISECONDS,
  UNIT_SECONDS,
} from '../units';
import { Parameter } from './parameters-table';

@customElement('parameters-card')
export class ParametersCard extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

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

  render() {
    const parameters: Parameter[] = [
      {
        name: 'Reverb Time', // TODO: translate: Nachhallzeit
        description: 'according to ISO 3382-1 (500-1000Hz)',
        unit: UNIT_SECONDS,
        responseValues: this.reverbTimes,
        position: 1,
      },
      {
        name: 'Centre Time', // TODO: translate: Schwerpunktzeit
        description: 'according to ISO 3382-1',
        unit: UNIT_MILLISECONDS,
        responseValues: this.centreTimes,
        position: 2,
      },
      {
        name: html`Clarity C<sub>80</sub>`, // TODO: translate: Klarheitsmaß C80
        description: 'according to ISO 3382-1 (500-1000Hz)',
        unit: UNIT_DECIBELS,
        responseValues: this.c80s,
        position: 5,
      },
      {
        name: 'Bass Ratio',
        responseValues: this.bassRatios,
        position: 8,
      },
      {
        name: 'Interaural Cross Correlation', // TODO: translate: Interaurale Kreuzkorrelation
        description: '125Hz - 4kHz, according to ISO 3382-1',
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
        name: 'Stärkemaß',
        description: 'according to ISO 3382-1',
        responseValues: averageStrengths,
        unit: UNIT_DECIBELS,
        position: 3,
      });
      parameters.push({
        name: 'A-Gewichtetes Stärkemaß',
        description: 'as defined by Soulodre and Bradley (1995)',
        responseValues: aWeighted,
        unit: UNIT_DECIBELS_A,
        position: 4,
      });
      parameters.push({
        name: html`Level adjusted C<sub>80</sub>`, // TODO: translation: Lautheitskorrigiertes Klarheitsmaß C80
        description:
          'Perceived clarity rating defined by Soulodre and Bradley (1995)',
        responseValues: levelAdjustedC80,
        unit: UNIT_DECIBELS_A,
        position: 6,
      });
      parameters.push({
        name: 'Treble Ratio',
        description: 'as defined by Soulodre and Bradley (1995)',
        responseValues: trebleRatios,
        unit: UNIT_DECIBELS,
        position: 7,
      });
      parameters.push({
        name: 'Early Bass Level',
        description: 'as defined by Soulodre and Bradley (1995)',
        responseValues: earlyBassLevels,
        unit: UNIT_DECIBELS,
        position: 9,
      });
    }

    return html`
      <base-card cardTitle="Single-Figure Parameters">
        <parameters-table
          .responseDetails=${this.responseDetails}
          .parameters=${parameters}
        ></parameters-table>
        <slot></slot>
      </base-card>
    `;
  }
}
