import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ResponseDetail } from '../audio/response-detail';

export type Parameter = {
  name: string;
  description?: string;
  unit?: string;
  responseValues: number[];
};

/**
 * TODO: set a max-width of (100 - 20) / numResponses in percent
 * TODO: set a max-width of the table to a sensible value depending on numResponses
 */
@customElement('parameters-table')
export class ParametersTable extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array, attribute: false })
  parameters: Parameter[] = [];

  render() {
    if (!this.parameters.length) {
      return null;
    }

    const { responseValues: firstResponseValues } = this.parameters[0];

    return html`
      <div class="scroll-container">
        <table>
          ${firstResponseValues.length > 1
            ? html`
                <thead>
                  <tr>
                    <th></th>
                    ${firstResponseValues.map((_, index) =>
                      this.renderLegend(index)
                    )}
                  </tr>
                </thead>
              `
            : null}
          <tbody>
            ${this.parameters.map(ParametersTable.renderParameter)}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderLegend(currentIndex: number) {
    const { color, fileName } = this.responseDetails[currentIndex];

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
    unit,
    responseValues: coloredValues,
  }: Parameter) {
    const classes = classMap({
      'has-description': !!description,
    });

    return html`
      <tr class=${classes}>
        <td>
          <span>${name}${ParametersTable.renderUnit(unit)}</span>
          ${description
            ? html`
                <br />
                <small>${description}</small>
              `
            : null}
        </td>
        ${coloredValues.map(
          value => html`<td class="value">${value.toFixed(2)}</td>`
        )}
      </tr>
    `;
  }

  private static renderUnit(unit: string | undefined) {
    if (!unit) {
      return null;
    }

    return html`<span class="unit">[${unit}]</span>`;
  }

  static styles = css`
    .scroll-container {
      overflow-x: auto;
      max-width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
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
      margin-inline-start: 1ch;
      color: var(--sl-color-neutral-600);
    }
  `;
}
