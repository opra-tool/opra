import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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

const SOURCE_RAQI = {
  url: 'https://doi.org/10.1121/1.5051453',
  shortName: 'Weinzierl et al., 2018',
  longName:
    'Weinzierl, S., Lepa, S., & Ackermann, D. (2018). A measuring instrument for the auditory perception of rooms: The Room Acoustical Quality Inventory (RAQI).',
};

const sources = new Map([
  ['iso3382-1', SOURCE_ISO_3382_1],
  ['soulodre-bradley1995', SOURCE_SOULODRE_BRADLEY],
  ['beranek1962', SOURCE_BERANEK],
  ['weinzierl2018', SOURCE_RAQI],
]);

@customElement('source-paper')
export class SourcePaper extends LitElement {
  @property({ type: String })
  paper = '';

  @property({ type: Boolean })
  parenthesis = false;

  render() {
    const source = sources.get(this.paper);

    if (!source) {
      throw new Error(`unknown paper: ${this.paper}`);
    }

    let link = html`<a href=${source.url}>${source.shortName}</a>`;

    if (this.parenthesis) {
      link = html`(${link})`;
    }

    return html`<sl-tooltip hoist content=${source.longName}
      >${link}</sl-tooltip
    >`;
  }

  static styles = css`
    a {
      color: inherit;
    }

    sl-tooltip {
      --max-width: none;
    }
  `;
}
