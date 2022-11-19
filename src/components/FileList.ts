import { SlSwitch } from '@shoelace-style/shoelace';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { formatFileDetails } from '../audio/formatFileDetails';
import { RoomImpulseFile } from '../audio/RoomImpulseFile';

export class FileListToggleEvent extends CustomEvent<{
  id: string;
}> {}

export class FileListRemoveEvent extends CustomEvent<{
  id: string;
}> {}

@customElement('file-list')
export class FileList extends LitElement {
  @property({ type: Array }) files: RoomImpulseFile[] = [];

  protected render() {
    const enabledCount = this.files.reduce(
      (count, file) => (file.isEnabled ? count + 1 : count),
      0
    );

    return html`
      <section>
        ${this.files.map(file => this.renderFile(file, enabledCount))}
      </section>
    `;
  }

  private renderFile(
    {
      id,
      fileName,
      isProcessing,
      isEnabled,
      color,
      ...details
    }: RoomImpulseFile,
    enabledCount: number
  ) {
    const cannotToggle = isEnabled && enabledCount === 1;

    const toggleTitle = cannotToggle
      ? 'Cannot toggle as it is the only one active'
      : 'Toggle visibility in graphs';

    return html`
      <div class="file-list-entry" title=${fileName}>
        <div class="head">
          ${when(
            isProcessing,
            () => html`<sl-spinner></sl-spinner>`,
            () => html`<sl-switch
              ?checked=${isEnabled}
              ?disabled=${cannotToggle}
              title=${toggleTitle}
              value=${id}
              @sl-change=${this.onSwitch}
            ></sl-switch>`
          )}
        </div>
        <div>
          <p>${fileName}</p>
          <small>${formatFileDetails(details)}</small>
        </div>

        <div class="color" .style=${`background-color: ${color}`}></div>
        <sl-icon-button
          name="trash"
          @click=${() => this.emitRemoveEvent(id)}
        ></sl-icon-button>
      </div>
    `;
  }

  private emitRemoveEvent(id: string) {
    this.dispatchEvent(
      new FileListRemoveEvent('remove-file', {
        detail: {
          id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private onSwitch(ev: CustomEvent) {
    const target = ev.target as SlSwitch;

    this.dispatchEvent(
      new FileListToggleEvent('toggle-file', {
        detail: {
          id: target.value,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = css`
    .file-list-entry {
      display: grid;
      grid-template-columns: 2.4rem minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
    }

    .file-list-entry:not(:last-child) {
      border-bottom: 1px solid var(--sl-color-neutral-200);
    }

    .file-list-entry p {
      margin: 0;

      overflow: hidden;
      text-overflow: ellipsis;
    }

    .head {
      display: flex;
      justify-content: center;
    }

    sl-switch::part(label) {
      display: none;
      margin: 0;
    }

    .color {
      margin-left: auto;
      width: 1rem;
      height: 1rem;
      border-radius: 999px;
    }
  `;
}
