import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

type EventDetail = {
  files: FileList;
};

export type FileDropChangeEvent = CustomEvent<EventDetail>;

@customElement('file-drop')
export class FileDrop extends LitElement {
  @state()
  private isDraggingOver = false;

  @query('#file-input')
  private fileInput!: HTMLInputElement;

  render() {
    return html`
      <section
        class=${classMap({
          'file-drop': true,
          'dragging-over': this.isDraggingOver,
        })}
        @drop=${this.onDrop}
        @dragenter=${this.onDragEnter}
        @dragleave=${this.onDragLeave}
        @dragover=${this.onDragOver}
      >
        <span>Drop room response files here</span>
        <span>or</span>
        <sl-button @click=${this.onFileUploadButtonCLicked}>
          Choose file(s)
        </sl-button>
        <input
          id="file-input"
          type="file"
          accept=".wav"
          multiple
          @change=${this.onFileInputChange}
        />
      </section>
    `;
  }

  private onDragEnter(ev: DragEvent) {
    ev.preventDefault();

    this.isDraggingOver = true;
  }

  private onDragLeave(ev: DragEvent) {
    ev.preventDefault();

    this.isDraggingOver = false;
  }

  private onDragOver(ev: DragEvent) {
    ev.preventDefault();

    this.isDraggingOver = true;
  }

  private onDrop(ev: DragEvent) {
    ev.preventDefault();

    this.isDraggingOver = false;

    const files = ev.dataTransfer?.files;
    if (!files) {
      return;
    }

    this.dispatchChangeEvent(files);
  }

  private dispatchChangeEvent(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<EventDetail>('change', {
        detail: {
          files,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private onFileInputChange() {
    this.dispatchChangeEvent(this.fileInput.files);
  }

  private onFileUploadButtonCLicked() {
    this.fileInput.click();
  }

  static styles = css`
    .file-drop {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;

      box-sizing: border-box;
      height: 100%;

      padding: 1.5rem;

      outline: 2px dashed var(--sl-color-neutral-200);
      transition: outline-color 0.15s, background-color 0.15s;
    }

    .dragging-over {
      background-color: var(--sl-color-neutral-100);
      outline-color: var(--sl-color-neutral-500);
    }

    #file-input {
      visibility: hidden;
      position: absolute;
    }
  `;
}
