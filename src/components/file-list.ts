import { localized, msg } from '@lit/localize';
import { SlSwitch } from '@shoelace-style/shoelace';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatResponseSummary } from '../presentation/room-response-format';

export type FileListEntry = {
  type: 'monaural' | 'binaural' | 'mid-side';
  id: string;
  fileName: string;
  hasResults: boolean;
  isEnabled: boolean;
  color: string;
  duration: number;
  sampleRate: number;
};

export class FileListToggleEvent extends CustomEvent<{
  id: string;
}> {
  constructor(id: string) {
    super('toggle-file', {
      detail: {
        id,
      },
      bubbles: true,
      composed: true,
    });
  }
}

export class FileListRemoveEvent extends CustomEvent<{
  id: string;
}> {
  constructor(id: string) {
    super('remove-file', {
      detail: {
        id,
      },
      bubbles: true,
      composed: true,
    });
  }
}

@localized()
@customElement('file-list')
export class FileList extends LitElement {
  @property({ type: Array })
  entries: FileListEntry[] = [];

  @property({ type: Boolean })
  hideOptions = false;

  protected render() {
    const enabledCount = this.entries.reduce(
      (count, file) => (file.isEnabled ? count + 1 : count),
      0
    );

    return html`
      <section>
        ${this.entries.map(file => this.renderListEntry(file, enabledCount))}
      </section>
    `;
  }

  private renderListEntry(
    { id, fileName, hasResults, isEnabled, color, ...details }: FileListEntry,
    enabledCount: number
  ) {
    const cannotToggle = isEnabled && enabledCount === 1;

    const toggleTitle = cannotToggle
      ? msg('Cannot deactivate, as this is the only active impulse response')
      : msg('Toggle visibility in graphs');

    return html`
      <div class="file-list-entry" title=${fileName}>
        <div class="head">
          ${hasResults
            ? html`<sl-switch
                ?checked=${isEnabled}
                ?disabled=${cannotToggle}
                title=${toggleTitle}
                value=${id}
                @sl-change=${this.onSwitch}
              ></sl-switch>`
            : html`<sl-spinner></sl-spinner>`}
        </div>
        <div>
          <p>${fileName}</p>
          <small>${formatResponseSummary(details)}</small>
        </div>
        <div class="color" .style=${`background-color: ${color}`}></div>
        ${this.renderFileOptions(details.type, id)}
      </div>
    `;
  }

  private renderFileOptions(
    type: 'monaural' | 'binaural' | 'mid-side',
    id: string
  ) {
    if (this.hideOptions) {
      return null;
    }

    if (type === 'monaural') {
      return html`
        <sl-icon-button
          name="trash"
          title=${msg('Discard')}
          @click=${() => this.dispatchEvent(new FileListRemoveEvent(id))}
        ></sl-icon-button>
      `;
    }

    return html`
      <file-list-entry-options
        .id=${id}
        .type=${type}
      ></file-list-entry-options>
    `;
  }

  private onSwitch(ev: CustomEvent) {
    const target = ev.target as SlSwitch;

    this.dispatchEvent(new FileListToggleEvent(target.value));
  }

  static styles = css`
    section {
      background: var(--sl-color-neutral-100);
      border-radius: 0.5rem;
      padding: 0.25rem;
      height: 100%;
      box-sizing: border-box;
    }

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
