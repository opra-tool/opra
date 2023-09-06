import { msg, localized } from '@lit/localize';
import { SlSelect } from '@shoelace-style/shoelace';
import { LitElement, html, css, TemplateResult, PropertyValueMap } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

type Parameter = {
  name: string | TemplateResult;
  description: string | TemplateResult;
  source: {
    url: string;
    shortName: string;
    longName: string;
  };
  symbol?: string | TemplateResult;
  unit?: string;
  responseValues: (number | undefined)[];
};

type Results = {
  id: string;
  name: () => string | TemplateResult;
  description: () => string | TemplateResult;
  source: {
    url: string;
    shortName: string;
    longName: string;
  };
  symbol?: () => string | TemplateResult;
  unit?: string;
  irResults: {
    color: string;
    fileName: string;
    result: number | undefined;
  }[];
}[];

@localized()
@customElement('parameters-card')
export class ParametersCard extends LitElement {
  @property({ type: Array })
  results: Results = [];

  @query('#param-select')
  private paramSelect!: SlSelect;

  @state()
  private enabledParams: string[] = [];

  protected willUpdate(_changedProperties: PropertyValueMap<this>): void {
    if (
      _changedProperties.has('results') &&
      this.results.length > 0 &&
      this.enabledParams.length === 0
    ) {
      this.enabledParams = this.results.map(r => r.id);
    }
  }

  render() {
    if (!this.results.length) {
      return null;
    }

    const parameters: Parameter[] = this.results
      .filter(r => this.enabledParams.includes(r.id))
      .map(r => ({
        name: r.name(),
        description: r.description(),
        source: r.source,
        unit: r.unit,
        symbol: r.symbol ? r.symbol() : undefined,
        responseValues: r.irResults.map(res => res.result),
      }));

    const { irResults: firstResponseResults } = this.results[0];

    return html`
      <base-card cardTitle=${msg('Single-Figure Parameters')}>
        <div class="container">
          <sl-select
            id="param-select"
            label=${msg('Select parameters to display')}
            value=${this.enabledParams.join(' ')}
            multiple
            max-options-visible="6"
            size="small"
            @sl-change=${this.onParamSelectChange}
          >
            ${this.results.map(
              r =>
                html`<sl-option value="${r.id}"
                  >${ParametersCard.renderParameterName(
                    r.name(),
                    r.symbol ? r.symbol() : undefined
                  )}</sl-option
                >`
            )}
          </sl-select>
          <sl-divider></sl-divider>
          <div class="scroll-container">
            <table>
              ${firstResponseResults.length > 1
                ? html`
                    <thead>
                      <tr>
                        <th></th>
                        ${firstResponseResults.map(ParametersCard.renderLegend)}
                      </tr>
                    </thead>
                  `
                : null}
              <tbody>
                ${parameters.map(ParametersCard.renderParameter)}
              </tbody>
            </table>
          </div>
        </div>
      </base-card>
    `;
  }

  private onParamSelectChange() {
    const { value } = this.paramSelect;
    this.enabledParams = value instanceof Array ? value : [value];
  }

  private static renderLegend({
    fileName,
    color,
  }: {
    fileName: string;
    color: string;
  }) {
    return html`
      <th title=${fileName}>
        <small class="legend-label">${fileName}</small>
        <span
          class="legend-color"
          .style=${`background-color: ${color}`}
        ></span>
      </th>
    `;
  }

  private static renderParameter({
    name,
    description,
    source,
    symbol,
    unit,
    responseValues,
  }: Parameter) {
    const classes = classMap({
      'has-description': !!description,
    });

    return html`
      <tr class=${classes}>
        <td>
          <span>${ParametersCard.renderParameterName(name, symbol)}</span>
          <br />
          <small
            >${description} •
            <reference-paper .paper=${source}></reference-paper
          ></small>
        </td>
        ${responseValues.map(
          value =>
            html`<td class="value">
              ${value !== undefined
                ? html`${value.toFixed(2)}${ParametersCard.renderUnit(unit)}`
                : html`&mdash;`}
            </td>`
        )}
      </tr>
    `;
  }

  private static renderParameterName(
    name: string | TemplateResult,
    symbol: string | TemplateResult | undefined
  ) {
    return html`${name}${symbol ? html`, <i>${symbol}</i>` : null}`;
  }

  private static renderUnit(unit: string | undefined) {
    if (!unit) {
      return null;
    }

    return html`<span class="unit"> ${unit}</span>`;
  }

  static styles = css`
    .container {
      display: grid;
      gap: 1rem;
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

    .unit {
      color: var(--sl-color-neutral-600);
    }
  `;
}
