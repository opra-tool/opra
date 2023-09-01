import { readAudioFile } from './audio-files/audio-file-reading';
import { EventEmitter } from './event-emitter';
import { ImpulseResponseFile } from './transfer-objects/impulse-response-file';
import { OctaveBandValues } from './transfer-objects/octave-bands';
import { Persistence } from './persistence';
import { EnvironmentValues } from './transfer-objects/environment-values';
import { calcRAQIScore } from './raqi/raqi-calculation';
import { RAQI_PARAMETERS } from './raqi/raqi-data';
import { CustomAudioBuffer } from './transfer-objects/audio-buffer';
import { calculateLpe10 } from './acoustical-param-analyzing/lpe10';
import { separateIntoBandsAndSquaredIR } from './acoustical-param-analyzing/buffer-separation';
import { analyzingQueue } from './acoustical-param-analyzing/queue/analyzing-queue';

const DEFAULT_RELATIVE_HUMIDITY = 50;
const DEFAULT_AIR_TEMPERATURE = 20;
const DEFAULT_DISTANCE_FROM_SOURCE = 10;
const DEFAULT_AIR_DENSITY = 1.2;

type EventMap = {
  initialized: {};
  'file-added': { id: string };
  'file-changed': { id: string };
  'file-removed': { id: string };
  'file-processing-error': { id: string; fileName: string; error: Error };
  'file-results-available': { id: string };
};

type RAQIResults = {
  paramId: string;
  scorePerStimulus: Record<string, number>;
}[];

export class AppLogic extends EventEmitter<EventMap> {
  private persistence: Persistence;

  private environmentValues: EnvironmentValues = {
    airTemperature: DEFAULT_AIR_TEMPERATURE,
    relativeHumidity: DEFAULT_RELATIVE_HUMIDITY,
    distanceFromSource: DEFAULT_DISTANCE_FROM_SOURCE,
    airDensity: DEFAULT_AIR_DENSITY,
  };

  private results = new Map<
    string,
    {
      paramId: string;
      singleFigure: number;
      octaveBandValues?: OctaveBandValues;
    }[]
  >();

  private raqiResults = new Map<string, RAQIResults>();

  private files = new Map<string, ImpulseResponseFile>();

  private irSamples = new Map<string, Float32Array>();

  private analyzingQueue = analyzingQueue();

  constructor() {
    super();

    this.persistence = new Persistence();
  }

  async init() {
    await this.persistence.init();

    const storedFiles = await this.persistence.getFiles();

    const environment = await this.persistence.getEnvironmentValues();
    if (environment) {
      this.environmentValues = environment;
    }

    for (const file of storedFiles) {
      // eslint-disable-next-line no-await-in-loop
      await this.addImpulseResponseFile(file, true);
    }

    this.dispatchEvent('initialized', {});
  }

  getSingleFigureParamResult(
    paramId: string,
    fileId: string
  ): number | undefined {
    return this.results.get(fileId)?.find(r => r.paramId === paramId)
      ?.singleFigure;
  }

  getOctaveBandParamResult(
    paramId: string,
    fileId: string
  ): OctaveBandValues | undefined {
    return this.results.get(fileId)?.find(r => r.paramId === paramId)
      ?.octaveBandValues;
  }

  getRAQIResults(
    paramId: string,
    fileId: string
  ): Record<string, number> | undefined {
    return this.raqiResults.get(fileId)?.find(r => r.paramId === paramId)
      ?.scorePerStimulus;
  }

  getEnvironmentValues(): EnvironmentValues {
    return this.environmentValues;
  }

  setEnvironmentValues(values: EnvironmentValues) {
    this.environmentValues = values;

    setTimeout(() => {
      this.recalculateEnvironmentBasedParams();

      this.persistence.saveEnvironmentValues(values);
    }, 0);
  }

  getIRSamples(fileId: string): Float32Array | undefined {
    return this.irSamples.get(fileId);
  }

  getAllImpulseResponseFiles(): ImpulseResponseFile[] {
    return Array.from(this.files.values());
  }

  async addAudioFile(audioFile: File): Promise<void> {
    const buffer = await readAudioFile(audioFile);

    if (buffer.numberOfChannels < 1 || buffer.numberOfChannels > 2) {
      throw new Error(`unsupported channel count: ${buffer.numberOfChannels}`);
    }

    let id;
    do {
      id = randomId();
    } while (this.files.has(id));

    this.addImpulseResponseFile({
      type: buffer.numberOfChannels === 1 ? 'omnidirectional' : 'binaural',
      id,
      fileName: audioFile.name,
      buffer,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
    });
  }

  markFileAs(fileId: string, markAsType: 'binaural' | 'mid-side') {
    const file = this.files.get(fileId);

    if (!file) {
      throw new Error(
        `expected to find impulse response file with id '${fileId}' to mark as '${markAsType}'`
      );
    }

    const newFile = {
      ...file,
      type: markAsType,
    };

    this.files.set(fileId, newFile);

    this.results.delete(fileId);
    this.analyzeFile(newFile, { onlyEnvironmentBasedParams: false });
    this.persistence.saveResponse(newFile);

    this.dispatchEvent('file-changed', { id: fileId });
  }

  removeAllImpulseResponseFiles() {
    for (const id of this.files.keys()) {
      this.removeFile(id);
    }
  }

  removeFile(fileId: string) {
    this.files.delete(fileId);

    this.results.delete(fileId);
    this.persistence.deleteResponse(fileId);

    this.dispatchEvent('file-removed', { id: fileId });
  }

  hasResultsForFile(fileId: string): boolean {
    return this.results.has(fileId);
  }

  private async addImpulseResponseFile(
    file: ImpulseResponseFile,
    skipPersistence: boolean = false
  ) {
    this.files.set(file.id, file);

    await this.analyzeFile(file, { onlyEnvironmentBasedParams: false });

    if (!skipPersistence) {
      await this.persistence.saveResponse(file);
    }

    this.dispatchEvent('file-added', { id: file.id });
  }

  private async analyzeFile(
    file: ImpulseResponseFile,
    { onlyEnvironmentBasedParams }: { onlyEnvironmentBasedParams: boolean }
  ) {
    try {
      const previousResults = this.results.get(file.id) || [];

      const buffer = CustomAudioBuffer.fromNativeAudioBuffer(file.buffer);
      const lpe10 = await calculateLpe10(
        file.type,
        buffer,
        this.environmentValues
      );
      const { squaredIRSamples, ...bands } =
        await separateIntoBandsAndSquaredIR(file.type, buffer);

      // do not await, so that others can start performing work
      this.analyzingQueue
        .analyzeFile(file.id, {
          bands,
          fileType: file.type,
          lpe10,
          previousResults,
          sampleRate: file.sampleRate,
          onlyEnvironmentBasedParams,
        })
        .then(fileResults => {
          // make sure to only add results when the file has not been deleted in the meantime
          if (this.files.has(file.id)) {
            this.results.set(file.id, fileResults);

            this.irSamples.set(file.id, squaredIRSamples);

            this.raqiResults.set(
              file.id,
              RAQI_PARAMETERS.map(param =>
                calcRAQIScore(param, file.type, fileResults)
              )
            );

            this.dispatchEvent('file-results-available', { id: file.id });
          }
        });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      if (err instanceof Error) {
        this.dispatchEvent('file-processing-error', {
          id: file.id,
          fileName: file.fileName,
          error: err,
        });
      }
    }
  }

  private async recalculateEnvironmentBasedParams() {
    for (const file of this.getAllImpulseResponseFiles()) {
      this.analyzeFile(file, {
        onlyEnvironmentBasedParams: true,
      });
    }
  }
}

/**
 * @copyright Michal Zalecki
 * @returns A pseudo-random ID
 */
function randomId(): string {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(8);
}
