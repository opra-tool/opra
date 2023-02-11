import { msg, localized } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FileListEntry } from './file-list';

@localized()
@customElement('file-dropdown')
export class FileDropdown extends LitElement {
  @property()
  entries: FileListEntry[] = [];

  protected render() {
    const enabledFilesCount = this.entries.reduce(
      (prev, cur) => (cur.isEnabled ? prev + 1 : prev),
      0
    );

    return html`
      <div class="wrapper">
        <sl-dropdown placement="top-end" stayOpenOnSelect distance="16">
          <sl-button slot="trigger" caret
            >${enabledFilesCount}
            ${msg('room impulse response(s) enabled')}</sl-button
          >
          <div class="content">
            <file-list .entries=${this.entries} hideOptions></file-list>
          </div>
        </sl-dropdown>
      </div>
    `;
  }

  static styles = css`
    .wrapper {
      position: fixed;
      bottom: 0;
      right: 0;
      left: 0;
      margin: 0 auto;
      max-width: 1400px;
      height: 0;
    }

    .content {
      min-width: 400px;
      padding: 1rem;
      background-color: var(--sl-color-neutral-100);
      box-shadow: var(--sl-shadow-x-large);
      border-radius: 0.5rem;
    }

    sl-dropdown {
      position: absolute;
      right: 2rem;
      bottom: 0.5rem;
    }

    sl-button {
      box-shadow: var(--sl-shadow-x-large);
    }

    sl-button::part(caret) {
      transform: rotate(180deg);
    }
  `;
}
