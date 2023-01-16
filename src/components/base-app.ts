import initWasm from 'wasm-raqi-online-toolbox';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('base-app')
export class BaseApp extends LitElement {
  @state()
  private isAppReady = false;

  @state()
  private error: Error | null = null;

  constructor() {
    super();

    initWasm()
      .catch(e => {
        this.error = new Error(`could not init web assembly: ${e.message}`);
      })
      .finally(() => {
        this.isAppReady = true;
      });
  }

  protected render() {
    if (!this.isAppReady) {
      return html`<sl-spinner></sl-spinner>`;
    }

    if (this.error) {
      return html`<error-details .error=${this.error}></error-details>`;
    }

    return html`<audio-analyzer></audio-analyzer>`;
  }
}
