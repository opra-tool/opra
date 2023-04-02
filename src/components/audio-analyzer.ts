import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { localized, msg, str } from '@lit/localize';
import { Exporter } from '../exporter';
import { Analyzer, MaximumFileCountReachedError } from '../analyzing/analyzer';
import { UNIT_CELCIUS } from '../presentation/units';
import { FileListToggleEvent, FileListRemoveEvent } from './file-list';
import {
  FileListConvertEvent,
  FileListMarkEvent,
} from './file-list-entry-options';
import { FileDropChangeEvent } from './file-drop';
import { P0SettingChangeEvent } from './p0-setting';
import { P0Dialog, P0DialogChangeEvent } from './p0-dialog';
import { toastSuccess, toastWarning } from './toast';
import { P0_VAR } from '../presentation/p0-format';

@localized()
@customElement('audio-analyzer')
export class AudioAnalyzer extends LitElement {
  private analyzer = new Analyzer();

  private exporter = new Exporter(this.analyzer);

  private hiddenResponses = new Map<string, true>();

  private errors = new Map<string, Error>();

  @state()
  private error: Error | null = null;

  @query('.p0-dialog', true)
  private p0Dialog!: P0Dialog;

  constructor() {
    super();

    this.analyzer.addEventListener('change', () => this.requestUpdate());
    this.analyzer.addEventListener(
      'file-adding-error',
      ({ fileName, error }) => {
        toastWarning(
          `${fileName} ${msg('ignored')}: ${
            error.message || msg('Unknown error')
          }`
        );
      }
    );

    this.analyzer.addEventListener(
      'file-processing-error',
      ({ id, fileName, error }) => {
        toastWarning(
          `${fileName} ${msg('ignored')}: ${
            error.message || msg('Unknown error')
          }`
        );
        this.errors.set(id, error);
      }
    );

    this.analyzer.addEventListener(
      'p0-air-values-update',
      ({ p0, temperature, humidity }) =>
        toastSuccess(
          html`${msg('Successfully set')} ${P0_VAR} = ${p0},
          ${temperature}${UNIT_CELCIUS}, ${humidity}%`
        )
    );
  }

  protected render() {
    const fileListEntries = this.analyzer
      .getResponses()
      .map(
        ({
          type,
          id,
          color,
          duration,
          sampleRate,
          fileName,
          originalBuffer,
        }) => ({
          type,
          id,
          color,
          duration,
          isEnabled: !this.hiddenResponses.has(id),
          sampleRate,
          fileName,
          hasResults: this.analyzer.hasResults(id),
          error: this.errors.get(id),
          converted: !!originalBuffer,
        })
      );

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
                    @toggle-file=${this.onToggleFile}
                    @remove-file=${this.onRemoveFile}
                    @mark-file=${this.onMarkFile}
                    @convert-file=${this.onConvertFile}
                  ></file-list>
                `
              : null}
          </section>
          <section class="settings">
            <p0-setting
              .p0=${this.analyzer.getP0()}
              @change=${this.onP0SettingChange}
            ></p0-setting>
            <sl-button @click=${this.onExport}>
              <sl-icon slot="prefix" name="download"></sl-icon>
              ${msg('Download Results')}
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

      <p0-dialog
        .p0=${this.analyzer.getP0()}
        relativeHumidity=${this.analyzer.getRelativeHumidity()}
        temperature=${this.analyzer.getAirTemperature()}
        class="p0-dialog"
        @change=${this.onP0DialogChange}
      ></p0-dialog>
    `;
  }

  private renderResults() {
    if (!this.analyzer.getResponses().length) {
      return null;
    }

    const responses = this.analyzer
      .getResponses()
      .filter(
        r => !this.hiddenResponses.has(r.id) && this.analyzer.hasResults(r.id)
      );

    if (!responses.length) {
      return html`<progress-indicator></progress-indicator>`;
    }

    const binauralResponses = responses.filter(
      ({ type }) => type === 'binaural'
    );
    const midSideResponses = responses.filter(
      ({ type }) => type === 'mid-side'
    );

    const hasBinauralResponses = binauralResponses.length > 0;
    const hasMidSideResults = midSideResponses.length > 0;

    const results = responses.map(r => this.analyzer.getResultsOrThrow(r.id));

    const edtBands = results.map(r => r.edtBands);
    const reverbTimeBands = results.map(r => r.reverbTimeBands);
    const c50Bands = results.map(r => r.c50Bands);
    const c80Bands = results.map(r => r.c80Bands);
    const strengthBands = results.map(r => r.strengthBands).filter(isDefined);
    const earlyStrengthBands = results
      .map(r => r.earlyStrengthBands)
      .filter(isDefined);
    const lateStrengthBands = results
      .map(r => r.lateStrengthBands)
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
      ></impulse-response-graph>

      <parameters-card .impulseResponses=${responses} .results=${results}>
        <p0-notice
          .p0=${this.analyzer.getP0()}
          .temperature=${this.analyzer.getAirTemperature()}
          .relativeHumidity=${this.analyzer.getRelativeHumidity()}
          @show-p0-dialog=${this.onShowP0Dialog}
        ></p0-notice>
      </parameters-card>

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

      <strengths-card
        .p0=${this.analyzer.getP0()}
        .impulseResponses=${responses}
        .strengths=${strengthBands}
        .earlyStrengths=${earlyStrengthBands}
        .lateStrengths=${lateStrengthBands}
      >
        <p0-notice
          slot="p0-notice"
          .p0=${this.analyzer.getP0()}
          .temperature=${this.analyzer.getAirTemperature()}
          .relativeHumidity=${this.analyzer.getRelativeHumidity()}
          @show-p0-dialog=${this.onShowP0Dialog}
        ></p0-notice>
        <p0-setting
          slot="p0-setting"
          .p0=${this.analyzer.getP0()}
          @change=${this.onP0SettingChange}
        ></p0-setting>
      </strengths-card>

      ${hasMidSideResults
        ? html`
            <lateral-level-card
              .p0=${this.analyzer.getP0()}
              .impulseResponses=${midSideResponses}
              .earlyLateralSoundLevels=${earlyLateralSoundLevelBands}
              .lateLateralSoundLevels=${lateLateralSoundLevelBands}
            >
              <p0-notice
                slot="p0-notice"
                .p0=${this.analyzer.getP0()}
                .temperature=${this.analyzer.getAirTemperature()}
                .relativeHumidity=${this.analyzer.getRelativeHumidity()}
                @show-p0-dialog=${this.onShowP0Dialog}
              ></p0-notice>
              <p0-setting
                slot="p0-setting"
                .p0=${this.analyzer.getP0()}
                @change=${this.onP0SettingChange}
              ></p0-setting>
            </lateral-level-card>
            <early-lateral-fraction-graph
              .impulseResponses=${midSideResponses}
              .earlyLateralEnergyFraction=${earlyLateralEnergyFractionBands}
            ></early-lateral-fraction-graph>
          `
        : null}
      ${hasBinauralResponses
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

  private onP0SettingChange({ detail: { p0 } }: P0SettingChangeEvent) {
    this.analyzer.setP0(p0);

    this.p0Dialog.hide();
  }

  private onP0DialogChange({
    detail: { p0, relativeHumidity, temperature },
  }: P0DialogChangeEvent) {
    this.analyzer.setP0AndAirValues(p0, temperature, relativeHumidity);

    this.p0Dialog.hide();
  }

  private onShowP0Dialog() {
    this.p0Dialog.show();
  }

  private onRemoveFile({ detail: { id } }: FileListRemoveEvent) {
    this.analyzer.removeResponse(id);
  }

  private onMarkFile({ detail: { id, markAs } }: FileListMarkEvent) {
    this.analyzer.markResponseAs(id, markAs);
  }

  private onConvertFile({ detail: { id } }: FileListConvertEvent) {
    this.analyzer.convertResponse(id);
  }

  private onToggleFile({ detail: { id } }: FileListToggleEvent) {
    if (this.hiddenResponses.has(id)) {
      this.hiddenResponses.delete(id);
    } else {
      this.hiddenResponses.set(id, true);
    }

    this.requestUpdate();
  }

  private async onFilesAdded({ detail: { files } }: FileDropChangeEvent) {
    try {
      await this.analyzer.addResponseFiles(files);
    } catch (err) {
      if (err instanceof MaximumFileCountReachedError) {
        toastWarning(
          msg(
            str`Maximum file count (${err.maxFileCount}) reached. Skipped ${err.skippedFileCount} files.`
          )
        );
      } else {
        throw err;
      }
    }
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
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-block-start: 1rem;
    }

    .controls-card,
    binaural-note-card,
    impulse-response-graph,
    parameters-card {
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

function isDefined(v: number[] | undefined): v is number[] {
  return v !== undefined;
}
