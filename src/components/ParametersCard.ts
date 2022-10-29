import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

type Parameter = {
  name: string;
  value: number;
  unit?: string;
};

export class ParametersCard extends LitElement {
  @property({ type: Array, attribute: false }) parameters: Parameter[] = [];

  render() {
    const paramCount = this.parameters.length;
    const leftParams = this.parameters.slice(0, paramCount / 2);
    const rightParams = this.parameters.slice(paramCount / 2);

    function renderParams(params: Parameter[]) {
      return html`
        <table>
          ${params.map(
            param => html`
              <tr>
                <td>${param.name}</td>
                <td class="value">${param.value.toFixed(2)}</td>
                ${param.unit && html`<td class="unit">[${param.unit}]</td>`}
              </tr>
            `
          )}
        </table>
      `;
    }

    return html`
      <base-card cardTitle="Other Parameters">
        <div>${renderParams(leftParams)} ${renderParams(rightParams)}</div>
      </base-card>
    `;
  }

  static styles = css`
    div {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    tr:not(:last-child) {
      border-bottom: 2px solid rgba(255, 255, 255, 0.25);
    }

    td {
      padding-block: 0.5rem;
    }

    .value {
      font-weight: bold;
      text-align: right;
    }

    .unit {
      opacity: 0.75;
      padding-inline-start: 0.5rem;
      text-align: right;
    }
  `;
}
