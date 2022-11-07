import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type Parameter = {
  name: string;
  description?: string;
  unit?: string;
  value: number;
};

@customElement('parameters-table')
export class ParametersTable extends LitElement {
  @property({ type: Array, attribute: false }) parameters: Parameter[] = [];

  render() {
    return html`
      <table>
        ${this.parameters.map(param => this.renderParameter(param))}
      </table>
    `;
  }

  // eslint-disable-next-line class-methods-use-this
  private renderParameter({ name, description, unit, value }: Parameter) {
    const classes = classMap({
      'has-description': !!description,
    });

    return html`
      <tr class=${classes}>
        <td>
          <span>${name}${this.renderUnit(unit)}</span>
          ${description
            ? html`
                <br />
                <small>${description}</small>
              `
            : null}
        </td>
        <td class="value">${value.toFixed(2)}</td>
      </tr>
    `;
  }

  // eslint-disable-next-line class-methods-use-this
  private renderUnit(unit: string | undefined) {
    if (!unit) {
      return null;
    }

    return html`<span class="unit">[${unit}]</span>`;
  }

  static styles = css`
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

    .value {
      text-align: right;
    }

    .unit {
      margin-inline-start: 1ch;
    }
  `;
}
