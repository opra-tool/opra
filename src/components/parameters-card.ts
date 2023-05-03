import { msg, localized } from '@lit/localize';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Results } from '../analyzing/processing';
import { ImpulseResponse } from '../analyzing/impulse-response';
import { Parameter } from './parameters-table';

const SOURCE_ISO_3382_1 = {
  url: 'https://www.iso.org/standard/40979.html',
  shortName: 'ISO 3382-1',
  longName:
    'ISO 3382-1. (2009). Acoustics - Measurement of room acoustic parameters - Part 1: Performance spaces',
};

const SOURCE_SOULODRE_BRADLEY = {
  url: 'https://doi.org/10.1121/1.413735',
  shortName: 'Soulodre & Bradley (1995)',
  longName:
    'Soulodre, G. A., & Bradley, J. S. (1995). Subjective evaluation of new room acoustic measures.',
};

const SOURCE_BERANEK = {
  url: 'https://link.springer.com/book/10.1007/978-0-387-21636-2',
  shortName: 'Beranek (1962)',
  longName:
    'Beranek, L. L. (1962). Concert Halls and Opera Houses Music, Acoustics, and Architecture',
};

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
        description: msg('Perceived reverberance'),
        source: SOURCE_ISO_3382_1,
        unit: 's',
        responseValues: this.results.map(r => r.reverbTime),
      },
      {
        name: html`${msg('Centre Time')}, T<sub>S</sub>`,
        description: msg('Perceived clarity of sound'),
        source: SOURCE_ISO_3382_1,
        unit: 's',
        responseValues: this.results.map(r => r.centreTime),
      },
      {
        name: html`${msg('Sound Strength')}, G`,
        description: msg('Subjective level of sound'),
        source: SOURCE_ISO_3382_1,
        responseValues: this.results.map(r => r.soundStrength),
        unit: 'dB',
      },
      {
        name: html`${msg('A-weighted Sound Strength')}, G(A)`,
        description: msg('Subjective level of sound'),
        source: SOURCE_SOULODRE_BRADLEY,
        responseValues: this.results.map(r => r.aWeightedSoundStrength),
        unit: 'dB',
      },
      {
        name: html`${msg('Clarity')}, C<sub>80</sub>`,
        description: msg('Perceived clarity of sound'),
        source: SOURCE_ISO_3382_1,
        unit: 'dB',
        responseValues: this.results.map(r => r.c80),
      },
      {
        name: html`${msg('Level-Adjusted')} C<sub>80</sub>`,
        description: msg('Perceived clarity of sound'),
        source: SOURCE_SOULODRE_BRADLEY,
        responseValues: this.results.map(r => r.levelAdjustedC80),
        unit: 'dB',
      },
      {
        name: msg('Treble Ratio'),
        description: msg('Perceived treble'),
        source: SOURCE_SOULODRE_BRADLEY,
        responseValues: this.results.map(r => r.trebleRatio),
        unit: 'dB',
      },
      {
        name: `${msg('Bass Ratio')}, BR`,
        description: msg('Perceived bass'),
        source: SOURCE_BERANEK,
        responseValues: this.results.map(r => r.bassRatio),
      },
      {
        name: msg('Early Bass Level'),
        description: msg('Perceived bass'),
        source: SOURCE_SOULODRE_BRADLEY,
        responseValues: this.results.map(r => r.earlyBassLevel),
        unit: 'dB',
      },
      {
        name: `${msg('Interaural Cross Correlation')}, IACC`,
        description: 'Spatial impression',
        source: SOURCE_ISO_3382_1,
        responseValues: this.results.map(r => r.iacc),
      },
      {
        name: html`${msg('Early Lateral Energy Fraction')}, J<sub>LF</sub>`,
        description: msg('Apparent source width (ASW)'),
        source: SOURCE_ISO_3382_1,
        responseValues: this.results.map(r => r.earlyLateralEnergyFraction),
      },
      {
        name: html`${msg('Late Lateral Sound Level')}, L<sub>J</sub>`,
        description: msg('Listener envelopment (LEV)'),
        source: SOURCE_ISO_3382_1,
        responseValues: this.results.map(r => r.lateLateralSoundLevel),
        unit: 'dB',
      },
    ];

    return html`
      <titled-card cardTitle=${msg('Single-Figure Parameters')}>
        <parameters-table
          .impulseResponses=${this.impulseResponses}
          .parameters=${parameters}
        ></parameters-table>
      </titled-card>
    `;
  }
}
