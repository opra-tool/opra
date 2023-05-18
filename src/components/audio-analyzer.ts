import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { localized, msg } from '@lit/localize';
import { Exporter } from '../exporter';
import { Analyzer } from '../analyzing/analyzer';
import { FileListToggleEvent } from './file-list';
import {
  FileListMarkEvent,
  FileListRemoveEvent,
} from './file-list-entry-options';
import { FileDropChangeEvent } from './file-drop';
import {
  EnvironmentDialog,
  EnvironmentChangeEvent,
} from './environment-dialog';
import { notifySuccess, notifyWarning } from './notifications';
import { OctaveBandValues } from '../analyzing/octave-bands';
import { ImpulseResponse } from '../analyzing/impulse-response';
import { DiscardAllDialog } from './discard-all-dialog';

const COLOR_WHITE = 'rgba(255, 255, 255, 0.75)';
const COLOR_BLUE = 'rgba(153, 102, 255, 0.5)';
const COLOR_RED = 'rgba(255, 99, 132, 0.5)';
const COLOR_YELLOW = 'rgba(128, 128, 0, 0.5)';
const COLOR_GREEN = 'rgba(93, 163, 153, 0.5)';

const COLORS = [COLOR_WHITE, COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_GREEN];

const MAX_DISPLAY_COUNT = COLORS.length;

@localized()
@customElement('audio-analyzer')
export class AudioAnalyzer extends LitElement {
  private analyzer = new Analyzer();

  private exporter = new Exporter(this.analyzer);

  private enabledResponses = new Map<string, { color: string }>();

  private errors = new Map<string, Error>();

  @state()
  private error: Error | null = null;

  @query('.environment-dialog', true)
  private environmentDialog!: EnvironmentDialog;

  @query('.discard-all-dialog', true)
  private discardAllDialog!: DiscardAllDialog;

  constructor() {
    super();

    this.analyzer.addEventListener('change', () => this.requestUpdate()); // TODO: replace with more specific events
    this.analyzer.addEventListener('response-added', ({ id }) =>
      this.onResponseAdded(id)
    );
    this.analyzer.addEventListener('response-removed', ({ id }) =>
      this.onResponseRemoved(id)
    );
    this.analyzer.addEventListener(
      'file-adding-error',
      ({ fileName, error }) => {
        notifyWarning(
          `${fileName} ${msg('ignored')}: ${
            error.message || msg('Unknown error')
          }`
        );
      }
    );

    this.analyzer.addEventListener(
      'file-processing-error',
      ({ id, fileName, error }) => {
        notifyWarning(
          `${fileName} ${msg('ignored')}: ${
            error.message || msg('Unknown error')
          }`
        );
        this.errors.set(id, error);
      }
    );

    this.analyzer.addEventListener('environment-values-update', () =>
      notifySuccess(msg('Successfully set environment values'))
    );
  }

  protected render() {
    const fileListEntries = this.analyzer
      .getResponses()
      .map(({ type, id, duration, sampleRate, fileName }) => ({
        type,
        id,
        duration,
        isEnabled: this.enabledResponses.has(id),
        color: this.enabledResponses.get(id)?.color,
        sampleRate,
        fileName,
        hasResults: this.analyzer.hasResults(id),
        error: this.errors.get(id),
      }));

    const hasResponses = this.analyzer.getResponses().length > 0;

    return html`
      <section class="grid">
        <base-card class="controls-card">
          <section class="files">
            <file-drop
              label=${msg('Drop room impulse response files here')}
              @change=${this.onFilesAdded}
            ></file-drop>
            ${this.analyzer.getResponses().length > 0
              ? html`
                  <file-list
                    .entries=${fileListEntries}
                    .canEnableFiles=${this.enabledResponses.size <
                    MAX_DISPLAY_COUNT}
                    @toggle-file=${this.onToggleFile}
                    @remove-file=${this.onRemoveFile}
                    @mark-file=${this.onMarkFile}
                    @set-environment=${this.onShowEnvironmentDialog}
                  ></file-list>
                `
              : null}
          </section>
          <section class="settings">
            <environment-notice
              @show-dialog=${this.onShowEnvironmentDialog}
            ></environment-notice>
            <sl-button @click=${this.onExport} .disabled=${!hasResponses}>
              <sl-icon slot="prefix" name="download"></sl-icon>
              ${msg('Download Results')}
            </sl-button>
            <sl-button
              @click=${this.onDiscardAllResponses}
              .disabled=${!hasResponses}
            >
              <sl-icon slot="prefix" name="trash"></sl-icon>
              ${msg('Discard all responses')}
            </sl-button>
          </section>
        </base-card>
        ${this.renderResults()}
        <error-details .error=${this.error}></error-details>
      </section>

      ${this.analyzer.getResponses().length > 0
        ? html`<file-dropdown
            .entries=${fileListEntries}
            @toggle-file=${this.onToggleFile}
          ></file-dropdown>`
        : null}

      <environment-dialog
        .values=${this.analyzer.getEnvironmentValues()}
        class="environment-dialog"
        @change=${this.onEnvironmentChange}
      ></environment-dialog>

      <discard-all-dialog
        class="discard-all-dialog"
        @confirm=${this.onDiscardAllResponsesConfirmed}
        @cancel=${() => this.discardAllDialog.hide()}
      ></discard-all-dialog>
    `;
  }

  private renderResults() {
    if (!this.analyzer.getResponses().length) {
      return null;
    }

    const responses: (ImpulseResponse & { color: string })[] = this.analyzer
      .getResponses()
      .filter(
        r => this.enabledResponses.has(r.id) && this.analyzer.hasResults(r.id)
      )
      .map(r => ({
        ...r,
        color: this.enabledResponses.get(r.id)?.color as string,
      }));

    if (!responses.length) {
      return html`<progress-indicator></progress-indicator>`;
    }

    const binauralResponses = responses.filter(
      ({ type }) => type === 'binaural'
    );
    const notMonauralResponses = responses.filter(
      ({ type }) => type === 'binaural' || type === 'mid-side'
    );

    const hasBinauralResponses = binauralResponses.length > 0;

    const results = responses.map(r => this.analyzer.getResultsOrThrow(r.id));

    const edtBands = results.map(r => r.edtBands);
    const reverbTimeBands = results.map(r => r.reverbTimeBands);
    const c50Bands = results.map(r => r.c50Bands);
    const c80Bands = results.map(r => r.c80Bands);
    const soundStrengthBands = results
      .map(r => r.soundStrengthBands)
      .filter(isDefined);
    const earlySoundStrengthBands = results
      .map(r => r.earlySoundStrengthBands)
      .filter(isDefined);
    const lateSoundStrengthBands = results
      .map(r => r.lateSoundStrengthBands)
      .filter(isDefined);
    const iaccBands = results.map(r => r.iaccBands).filter(isDefined);
    const eiaccBands = results.map(r => r.eiaccBands).filter(isDefined);
    const earlyLateralEnergyFractionBands = results
      .map(r => r.earlyLateralEnergyFractionBands)
      .filter(isDefined);
    const earlyLateralSoundLevelBands = results
      .map(r => r.earlyLateralSoundLevelBands)
      .filter(isDefined);
    const lateLateralSoundLevelBands = results
      .map(r => r.lateLateralSoundLevelBands)
      .filter(isDefined);

    return html`
      ${hasBinauralResponses
        ? html`<binaural-note-card></binaural-note-card>`
        : null}
      <impulse-response-graph
        .impulseResponses=${responses}
        .analyzer=${this.analyzer}
      ></impulse-response-graph>

      <parameters-card
        .impulseResponses=${responses}
        .results=${results}
      ></parameters-card>

      <raqi-card .impulseResponses=${responses} .results=${results}></raqi-card>

      <reverb-graph
        .impulseResponses=${responses}
        .edt=${edtBands}
        .reverbTime=${reverbTimeBands}
      ></reverb-graph>

      <c50c80-graph
        .impulseResponses=${responses}
        .c50=${c50Bands}
        .c80=${c80Bands}
      ></c50c80-graph>

      <strengths-graph
        .impulseResponses=${responses}
        .soundStrengths=${soundStrengthBands}
        .earlySoundStrengths=${earlySoundStrengthBands}
        .lateSoundStrengths=${lateSoundStrengthBands}
      ></strengths-graph>

      ${earlyLateralSoundLevelBands.length > 0
        ? html`
            <lateral-sound-level-graph
              .impulseResponses=${notMonauralResponses}
              .earlyLateralSoundLevels=${earlyLateralSoundLevelBands}
              .lateLateralSoundLevels=${lateLateralSoundLevelBands}
            ></lateral-sound-level-graph>
          `
        : null}
      ${earlyLateralEnergyFractionBands.length > 0
        ? html`
            <early-lateral-fraction-graph
              .impulseResponses=${notMonauralResponses}
              .earlyLateralEnergyFraction=${earlyLateralEnergyFractionBands}
            ></early-lateral-fraction-graph>
          `
        : null}
      ${iaccBands.length > 0
        ? html`<iacc-graph
            .impulseResponses=${binauralResponses}
            .iacc=${iaccBands}
            .eiacc=${eiaccBands}
          ></iacc-graph>`
        : null}

      <convolver-card
        class=${classMap({ expand: hasBinauralResponses })}
        .responses=${responses}
      ></convolver-card>
    `;
  }

  private onEnvironmentChange({ detail }: EnvironmentChangeEvent) {
    this.analyzer.setEnvironmentValues(detail);
    this.environmentDialog.hide();
  }

  private onShowEnvironmentDialog() {
    this.environmentDialog.show();
  }

  private onRemoveFile({ detail: { id } }: FileListRemoveEvent) {
    this.analyzer.removeResponse(id);
  }

  private onMarkFile({ detail: { id, markAs } }: FileListMarkEvent) {
    this.analyzer.markResponseAs(id, markAs);
  }

  private onToggleFile({ detail: { id } }: FileListToggleEvent) {
    if (this.enabledResponses.has(id)) {
      this.enabledResponses.delete(id);
    } else {
      this.enabledResponses.set(id, { color: this.findAvailableColor() });
    }

    this.requestUpdate();
  }

  private async onFilesAdded({ detail: { files } }: FileDropChangeEvent) {
    await this.analyzer.addResponseFiles(files);
  }

  private onResponseAdded(id: string) {
    if (this.enabledResponses.size < MAX_DISPLAY_COUNT) {
      this.enabledResponses.set(id, { color: this.findAvailableColor() });
    }

    this.requestUpdate();
  }

  private onResponseRemoved(id: string) {
    this.enabledResponses.delete(id);

    this.requestUpdate();
  }

  private onDiscardAllResponses() {
    this.discardAllDialog.show();
  }

  private onDiscardAllResponsesConfirmed() {
    this.discardAllDialog.hide();
    this.analyzer.removeAllResponses();
  }

  private onExport() {
    const json = this.exporter.generateExportFile();
    const blob = new Blob([json], {
      type: 'application/json',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `raqi-export-${new Date().toISOString()}.json`;

    link.click();
  }

  private findAvailableColor(): string {
    const takenColors: string[] = [];
    for (const { color } of this.enabledResponses.values()) {
      takenColors.push(color);
    }
    const color = COLORS.find(c => !takenColors.includes(c));

    if (!color) {
      throw new Error(
        `could not find available color takenColors=${takenColors}`
      );
    }

    return color;
  }

  static styles = css`
    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    }

    .grid > * {
      /* prevent stretching of parent */
      min-width: 0;
    }

    section.files {
      display: grid;
      grid-template-rows: auto;
      gap: 1rem;
    }

    @media screen and (min-width: 40rem) {
      section.files {
        grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
      }
    }

    section.settings {
      display: grid;
      grid-template-columns: 1fr min-content min-content;
      gap: 1rem;
      margin-block-start: 1rem;
    }

    .controls-card,
    binaural-note-card,
    impulse-response-graph,
    parameters-card,
    raqi-card {
      grid-column: 1 / -1;
    }

    /* allow stretching to full width if on its own row */
    convolver-card.expand {
      grid-column: 1 / -1;
    }

    /* allow stretching to full width */
    progress-indicator {
      grid-column: 1 / -1;
    }
  `;
}

function isDefined(v: OctaveBandValues | undefined): v is OctaveBandValues {
  return v !== undefined;
}
