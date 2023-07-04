import { LocaleStatusEventDetail, localized, msg } from '@lit/localize';
import { SlSelect } from '@shoelace-style/shoelace';
import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

const REFERENCE_WEINZIERL_ET_AL_2018 = {
  url: 'https://doi.org/10.1121/1.5051453',
  shortName: 'Weinzierl et al., 2018',
  longName:
    'Weinzierl, S., Lepa, S., & Ackermann, D. (2018). A measuring instrument for the auditory perception of rooms: The Room Acoustical Quality Inventory (RAQI).',
};

type RAQIResults = {
  nameEnglish: string;
  nameGerman: string;
  irResults: {
    fileName: string;
    color: string;
    scorePerStimulus: Record<string, number>;
  }[];
}[];

@localized()
@customElement('raqi-card')
export class RAQICard extends LitElement {
  @property({ type: Array })
  results: RAQIResults = [];

  @state()
  private stimulus: string = 'soloInstrument';

  @query('#stimulus-select', true)
  private stimulusSelect!: SlSelect;

  private currentLocale: string | undefined;

  connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener('lit-localize-status', this.onLocaleChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    window.removeEventListener('lit-localize-status', this.onLocaleChange);
  }

  render() {
    if (!this.results.length) {
      return null;
    }

    const raqiPaper = html`<reference-paper
      .paper=${REFERENCE_WEINZIERL_ET_AL_2018}
      parenthesis
    ></reference-paper>`;

    return html`
      <base-card cardTitle=${msg('RAQI Parameters')}>
        <header>
          <p>
            ${msg(html`
              An early prediction model uses calculated technical parameters to
              infer Room Acoustical Quality Inventory (RAQI) parameters
              ${raqiPaper}. Different coefficients are used for monaural,
              binaural and mid/side impulse responses. Optimizing for specific
              stimuli allows for more accurat results. Select a stimulus, which
              best matches your needs.
            `)}
          </p>
          <sl-select
            id="stimulus-select"
            label=${msg('Select a stimulus')}
            value=${this.stimulus}
            @sl-change=${this.onStimulusChange}
          >
            <sl-option value="soloInstrument"
              >${msg('Solo Instrument')}</sl-option
            >
            <sl-option value="orchestra">${msg('Orchestra')}</sl-option>
            <sl-option value="speech">${msg('Speech')}</sl-option>
          </sl-select>
        </header>
        <div class="scroll-container">
          <table>
            <thead>
              <tr>
                <th></th>
                ${this.results[0].irResults.map(
                  r => html`
                    <th title=${r.fileName}>
                      <small class="legend-label">${r.fileName}</small>
                      <span
                        class="legend-color"
                        .style=${`background-color: ${r.color}`}
                      ></span>
                    </th>
                  `
                )}
              </tr>
            </thead>
            <tbody>
              ${this.results.map(
                ({
                  nameGerman: raqiParamNameGerman,
                  nameEnglish: raqiParamNameEnglish,
                  irResults,
                }) => html`
                  <tr>
                    <td>
                      ${this.currentLocale === 'de'
                        ? raqiParamNameGerman
                        : raqiParamNameEnglish}
                    </td>
                    ${irResults.map(
                      ({ scorePerStimulus }) =>
                        html`<td class="value">
                          ${scorePerStimulus[this.stimulus].toFixed(4)}
                        </td>`
                    )}
                  </tr>
                `
              )}
            </tbody>
          </table>
        </div>
      </base-card>
    `;
  }

  private onLocaleChange = (ev: CustomEvent<LocaleStatusEventDetail>) => {
    if (ev.detail.status === 'ready') {
      this.currentLocale = ev.detail.readyLocale;
    }
  };

  private onStimulusChange() {
    const { value } = this.stimulusSelect;
    this.stimulus = value instanceof Array ? value[0] : value;
  }

  static styles = css`
    header {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 4rem;
      margin-block-end: 2rem;
    }

    header p {
      margin: 0;
    }

    .scroll-container {
      overflow-x: auto;
      max-width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    tr:not(:last-child) {
      border-bottom: 2px solid var(--sl-color-neutral-200);
    }

    tr:not(.has-description) > td {
      padding: 1rem 0.5rem;
    }

    tr.has-description > td {
      padding: 0.5rem;
    }

    td:first-child {
      white-space: nowrap;
    }

    th,
    td {
      padding-inline: 0.5rem;
    }

    th {
      font-weight: normal;
    }

    .legend-label {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .legend-color {
      display: block;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      margin-top: 4px;
    }

    .value {
      text-align: right;
    }
  `;
}
