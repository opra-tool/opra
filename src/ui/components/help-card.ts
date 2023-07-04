import { msg, localized } from '@lit/localize';
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@localized()
@customElement('help-card')
export class HelpCard extends LitElement {
  @property({ type: String }) cardTitle: string | TemplateResult | undefined;

  @state()
  private showHelp: boolean = false;

  render() {
    return html`
      <base-card>
        <header>
          ${this.cardTitle && html`<h3>${this.cardTitle}</h3>`}

          <sl-button
            class="toggle-button"
            pill
            size="small"
            @click=${this.onToggle}
          >
            ${this.showHelp
              ? html`
                  ${msg('Close help')}
                  <sl-icon slot="suffix" name="x-lg"></sl-icon>
                `
              : html`
                  ${msg('What is this?')}
                  <sl-icon slot="suffix" name="info-circle"></sl-icon>
                `}
          </sl-button>
        </header>

        <div class="content-wrapper">
          <slot></slot>

          ${this.showHelp
            ? html`<section class="help">
                <div>
                  <slot name="help">
                    <p>${msg('There is no help available for this item.')}</p>
                  </slot>
                </div>
              </section>`
            : null}
        </div>
      </base-card>
    `;
  }

  private onToggle() {
    this.showHelp = !this.showHelp;
  }

  static styles = css`
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      margin: 0.5rem 0 1rem 0;
    }

    header > h3 {
      margin: 0;
      font-size: 1rem;
      letter-spacing: 1px;
    }

    .content-wrapper {
      position: relative;
    }

    .help {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      box-shadow: var(--sl-shadow-medium);
    }

    .help > div {
      position: relative;

      box-sizing: border-box;
      overflow-y: auto;
      height: 100%;
      padding: 1rem;
      border-radius: 0.5rem;

      background-color: var(--sl-color-neutral-100);
    }

    .help::before {
      content: '';
      position: absolute;
      right: 2rem;
      top: -0.5rem;
      width: 1rem;
      height: 1rem;

      transform: rotate(-45deg);
      border-radius: 3px;

      background-color: var(--sl-color-neutral-100);
      box-shadow: var(--sl-shadow-medium);
    }
  `;
}
