import { LitElement, html, css } from 'lit';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { property } from 'lit/decorators.js';

type Parameter = {
  name: string;
  value: number;
  unit?: string;
};

export class ParametersCard extends LitElement {
  @property({ type: Array, attribute: false }) parameters: Parameter[] = [];

  render() {
    return html`
      <base-card>
        <h3>Other Parameters</h3>
        <table>
          ${this.parameters.map(
            param => html`
              <tr>
                <td>${param.name}</td>
                <td class="value">${param.value.toFixed(2)}</td>
                ${param.unit && html`<td class="unit">[${param.unit}]</td>`}
              </tr>
            `
          )}
        </table>
      </base-card>
    `;
  }

  static styles = css`
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
