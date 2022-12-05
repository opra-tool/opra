import SlInput from '@shoelace-style/shoelace/dist/components/input/input.js';
import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { formatP0, P0_VAR } from '../presentation/p0-format';

export class P0SettingChangeEvent extends CustomEvent<{
  p0: number;
}> {}

@customElement('p0-setting')
export class P0Setting extends LitElement {
  @property({ type: Number })
  p0: number | null = null;

  @query('.p0-input')
  private p0Input!: SlInput;

  protected render() {
    return html`
      <div class="p0-setting">
        <!-- TODO: add link to explain what p0 is -->
        <p>${P0_VAR} is required for strength-based calculations.</p>
        <form @submit=${this.onSubmitP0}>
          <sl-input
            class="p0-input"
            type="number"
            placeholder="e.g. 0.015 or 1e-6"
            filled
            min="0"
            step="any"
            required
            value=${this.p0 ? formatP0(this.p0) : ''}
          ></sl-input>
          <sl-button type="submit">Set ${P0_VAR}</sl-button>
        </form>
      </div>
    `;
  }

  private onSubmitP0(ev: SubmitEvent) {
    ev.preventDefault();

    if (!this.p0Input.invalid) {
      this.dispatchEvent(
        new P0SettingChangeEvent('change', {
          detail: {
            p0: parseFloat(this.p0Input.value),
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  static styles = css`
    .p0-setting {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }

    form {
      display: flex;
      gap: 0.5rem;
    }
  `;
}
