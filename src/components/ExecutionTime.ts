import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class ExecutionTime extends LitElement {
  @property({ type: Number }) milliseconds: number = 0;

  render() {
    return html`
      <div class="execution-details">
        <small>Analyzing took <b>${Math.round(this.milliseconds)}ms</b></small>
      </div>
    `;
  }

  static styles = css`
    .execution-details {
      padding: 0 1rem;
    }
  `;
}
