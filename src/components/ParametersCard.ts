import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Parameter } from './ParametersTable';

@customElement('parameters-card')
export class ParametersCard extends LitElement {
  @property({ type: Array, attribute: false }) parameters: Parameter[] = [];

  render() {
    return html`
      <base-card>
        <parameters-table .parameters=${this.parameters}></parameters-table>
      </base-card>
    `;
  }
}
