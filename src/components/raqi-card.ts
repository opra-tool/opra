import {
  msg,
  localized,
  updateWhenLocaleChanges,
  LocaleStatusEventDetail,
} from '@lit/localize';
import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { SlSelect } from '@shoelace-style/shoelace';
import { Results } from '../analyzing/processing';
import { ImpulseResponseType } from '../analyzing/impulse-response';
import { RAQIParameter, RAQI_PARAMETERS } from '../raqi/raqi-data';
import { calculateRAQIParameter } from '../raqi/raqi-calculator';

@localized()
@customElement('raqi-card')
export class RAQICard extends LitElement {
  @property({ type: Array })
  impulseResponses: {
    type: ImpulseResponseType;
    fileName: string;
    color: string;
  }[] = [];

  @property({ type: Array })
  results: Results[] = [];

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
    const raqiPaper = html`<source-paper
      paper="weinzierl2018"
      parenthesis
    ></source-paper>`;

    return html`
      <titled-card cardTitle=${msg('RAQI Parameters')}>
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
                ${this.impulseResponses.map(
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
              ${RAQI_PARAMETERS.map(parameter =>
                this.renderRAQIParameter(parameter)
              )}
            </tbody>
          </table>
        </div>
      </titled-card>
    `;
  }

  private renderRAQIParameter(parameter: RAQIParameter) {
    const values = this.results.map((results, i) =>
      calculateRAQIParameter(
        parameter,
        this.impulseResponses[i].type,
        results,
        this.stimulus
      )
    );

    return html`
      <tr>
        <td>
          ${this.currentLocale === 'de'
            ? parameter.nameGerman
            : parameter.nameEnglish}
        </td>
        ${values.map(v => html`<td class="value">${v.toFixed(4)}</td>`)}
      </tr>
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
