import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

type Parameter = {
  name: string;
  value: number;
  unit?: string;
};

@customElement('parameters-card')
export class ParametersCard extends LitElement {
  @property({ type: Array, attribute: false }) parameters: Parameter[] = [];

  render() {
    function renderUnit(unit: string | undefined) {
      if (!unit) {
        return null;
      }

      return `[${unit}]`;
    }

    return html`
      <base-card cardTitle="Other Parameters">
        <table>
          ${this.parameters.map(
            param => html`
              <tr>
                <td>${param.name} ${renderUnit(param.unit)}</td>
                <td class="value">${param.value.toFixed(2)}</td>
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
      text-align: right;
    }
  `;
}
