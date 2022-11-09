import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type Parameter = {
  name: string;
  // description?: string;
  unit?: string;
  value: number;
};

@customElement('parameters-card')
export class ParametersCard extends LitElement {
  @property({ type: Array, attribute: false }) parameters: Parameter[] = [];

  render() {
    return html`
      <base-card>
        <div class="wrapper">
          ${this.parameters.map(param => this.renderParameter(param))}
        </div>
      </base-card>
    `;
  }

  // eslint-disable-next-line class-methods-use-this
  private renderParameter({ name, unit, value }: Parameter) {
    return html`
      <div class="parameter">
        <span class="name">${name}${this.renderUnit(unit)}</span>
        <span class="value">${value.toFixed(2)}</span>
      </div>
    `;
  }

  // eslint-disable-next-line class-methods-use-this
  private renderUnit(unit: string | undefined) {
    if (!unit) {
      return null;
    }

    return html` <span class="unit">[${unit}]</span>`;
  }

  static styles = css`
    .wrapper {
      display: flex;
      justify-content: space-around;
    }

    .parameter {
      display: grid;
      gap: 0.125rem;
    }

    .name {
      color: var(--sl-color-neutral-600);
    }

    .value {
      font-size: 1.25rem;
    }
  `;
}
