import { Persistence } from '../persistence';
import { readAudioFile } from '../audio/audio-file-reading';
import { convertBetweenBinauralAndMidSide } from '../conversion';
import { EventEmitter } from '../event-emitter';
import { processBinauralAudio } from './binaural-processing';
import { binauralSamplesFromBuffer } from './binaural-samples';
import { EnvironmentValues } from './environment-values';
import { ImpulseResponse } from './impulse-response';
import { processMidSideAudio } from './mid-side-processing';
import { processMonauralAudio } from './monaural-processing';
import { calculateStrengths } from './sound-strength';

const DEFAULT_RELATIVE_HUMIDITY = 50;
const DEFAULT_AIR_TEMPERATURE = 20;
const DEFAULT_DISTANCE_FROM_SOURCE = 10;
const DEFAULT_AIR_DENSITY = 1.2;

const COLOR_WHITE = 'rgba(255, 255, 255, 0.75)';
const COLOR_BLUE = 'rgba(153, 102, 255, 0.5)';
const COLOR_RED = 'rgba(255, 99, 132, 0.5)';
const COLOR_YELLOW = 'rgba(128, 128, 0, 0.5)';
const COLOR_GREEN = 'rgba(93, 163, 153, 0.5)';

const FILE_COLORS = [
  COLOR_WHITE,
  COLOR_BLUE,
  COLOR_RED,
  COLOR_YELLOW,
  COLOR_GREEN,
];

const MAX_FILE_COUNT = FILE_COLORS.length;

type IntermediateResults = {
  bandsSquaredSum: number[];
  e50BandsSquaredSum: number[];
  e80BandsSquaredSum: number[];
  l80BandsSquaredSum: number[];
  sideE80BandsSquaredSum?: number[];
  sideL80BandsSquaredSum?: number[];
};

export type Results = {
  /* monaural parameters */
  edtBands: number[];
  reverbTimeBands: number[];
  edt: number;
  reverbTime: number;
  c50Bands: number[];
  c80Bands: number[];
  c50: number;
  c80: number;
  centreTime: number;
  bassRatio: number;
  /* strength-based monaural parameters */
  soundStrengthBands?: number[];
  earlySoundStrengthBands?: number[];
  lateSoundStrengthBands?: number[];
  soundStrength?: number;
  earlySoundStrength?: number;
  lateSoundStrength?: number;
  aWeightedSoundStrength?: number;
  trebleRatio?: number;
  earlyBassLevel?: number;
  levelAdjustedC80?: number;
  /* binaural parameters */
  iacc?: number;
  eiacc?: number;
  iaccBands?: number[];
  eiaccBands?: number[];
  /* mid/side parameters */
  earlyLateralEnergyFractionBands?: number[];
  earlyLateralEnergyFraction?: number;
  earlyLateralSoundLevelBands?: number[];
  lateLateralSoundLevelBands?: number[];
  earlyLateralSoundLevel?: number;
  lateLateralSoundLevel?: number;
};

export class MaximumFileCountReachedError extends Error {
  readonly maxFileCount: number;

  readonly skippedFileCount: number;

  constructor(maxFileCount: number, skippedFileCount: number) {
    super();

    this.maxFileCount = maxFileCount;
    this.skippedFileCount = skippedFileCount;
  }
}

type AnalyzerEventMap = {
  'file-adding-error': { fileName: string; error: Error };
  'file-processing-error': { id: string; fileName: string; error: Error };
  'environment-values-update': {};
  change: undefined;
};

export class Analyzer extends EventEmitter<AnalyzerEventMap> {
  private persistence: Persistence = new Persistence();

  private environment: EnvironmentValues = {
    airTemperature: DEFAULT_AIR_TEMPERATURE,
    relativeHumidity: DEFAULT_RELATIVE_HUMIDITY,
    distanceFromSource: DEFAULT_DISTANCE_FROM_SOURCE,
    airDensity: DEFAULT_AIR_DENSITY,
  };

  private responses: ImpulseResponse[] = [];

  private intermediateResults: Map<string, IntermediateResults> = new Map();

  private results: Map<string, Results> = new Map();

  private squaredIRs: Map<string, Float32Array> = new Map();

  constructor() {
    super();

    this.persistence.init().then(() => {
      this.persistence.getResponses().then(responses => {
        for (const response of responses) {
          this.responses.push(response);
          this.analyzeResponse(response);
        }

        this.dispatchEvent('change', undefined);
      });
      this.persistence.getEnvironmentValues().then(values => {
        if (values) {
          this.environment = values;
        }
      });
    });
  }

  getEnvironmentValues(): EnvironmentValues {
    return this.environment;
  }

  setEnvironmentValues(values: EnvironmentValues) {
    this.environment = values;

    setTimeout(() => {
      this.dispatchEvent('environment-values-update', {});

      this.recalculateStrengths();

      this.persistence.saveEnvironmentValues(values);
    }, 0);
  }

  getResponses(): ImpulseResponse[] {
    return this.responses;
  }

  async addResponseFiles(files: FileList) {
    const totalFileCount = this.responses.length + files.length;

    for (let i = 0; i < files.length; i += 1) {
      if (this.responses.length >= MAX_FILE_COUNT) {
        throw new MaximumFileCountReachedError(
          MAX_FILE_COUNT,
          totalFileCount - MAX_FILE_COUNT
        );
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        await this.addResponseFile(files[i]);
      } catch (err) {
        this.dispatchEvent('file-adding-error', {
          fileName: files[i].name,
          error: err instanceof Error ? err : new Error(),
        });
      }
    }
  }

  private async addResponseFile(file: File) {
    const buffer = await readAudioFile(file);

    if (buffer.numberOfChannels < 1 || buffer.numberOfChannels > 2) {
      throw new Error(`unsupported channel count: ${buffer.numberOfChannels}`);
    }

    const id = Analyzer.randomId();

    const response: ImpulseResponse = {
      type: buffer.numberOfChannels === 1 ? 'monaural' : 'binaural',
      id,
      fileName: file.name,
      buffer,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      color: this.findAvailableColor(),
    };

    this.responses.push(response);

    setTimeout(() => {
      this.dispatchEvent('change', undefined);

      this.persistence.saveResponse(response);

      this.analyzeResponse(response);
    }, 0);
  }

  removeResponse(id: string) {
    this.responses = this.responses.filter(el => el.id !== id);

    this.results.delete(id);
    this.intermediateResults.delete(id);
    this.squaredIRs.delete(id);

    this.dispatchEvent('change', undefined);

    this.persistence.deleteResponse(id);
  }

  markResponseAs(id: string, markAs: 'binaural' | 'mid-side') {
    const response = this.getResponseOrThrow(id);

    if (response.type === markAs) {
      return;
    }

    response.type = markAs;

    this.results.delete(id);
    this.analyzeResponse(response);

    this.dispatchEvent('change', undefined);

    this.persistence.saveResponse(response);
  }

  convertResponse(id: string) {
    const response = this.getResponseOrThrow(id);

    const newResponse = convertBetweenBinauralAndMidSide(response);
    this.analyzeResponse(newResponse);

    this.results.delete(id);
    this.responses = this.responses.map(r => {
      if (r.id === id) {
        return newResponse;
      }

      return r;
    });

    this.dispatchEvent('change', undefined);

    this.persistence.saveResponse(newResponse);
  }

  getSquaredIR(responseId: string): Float32Array {
    const maybeSquaredIR = this.squaredIRs.get(responseId);

    if (!maybeSquaredIR) {
      throw new Error(
        `expected to find squared impulse response for id '${responseId}'`
      );
    }

    return maybeSquaredIR;
  }

  hasResults(responseId: string): boolean {
    return this.results.has(responseId);
  }

  getResultsOrThrow(responseId: string): Results {
    const maybeResults = this.results.get(responseId);

    if (!maybeResults) {
      throw new Error(`expected to find results for id ${responseId}`);
    }

    return maybeResults;
  }

  private getIntermediateResultsOrThrow(
    responseId: string
  ): IntermediateResults {
    const maybeResults = this.intermediateResults.get(responseId);

    if (!maybeResults) {
      throw new Error(
        `expected to find intermediate results for id ${responseId}`
      );
    }

    return maybeResults;
  }

  private getResponseOrThrow(id: string): ImpulseResponse {
    const response = this.responses.find(r => r.id === id);

    if (!response) {
      throw new Error(`cannot find response with id '${id}'`);
    }

    return response;
  }

  private async analyzeResponse({
    id,
    type,
    sampleRate,
    fileName,
    buffer,
  }: ImpulseResponse) {
    try {
      let results;
      let intermediateResults;
      let squaredIR;
      if (type === 'monaural') {
        [results, intermediateResults, squaredIR] = await processMonauralAudio(
          buffer.getChannelData(0),
          sampleRate
        );
      } else if (type === 'binaural') {
        [results, intermediateResults, squaredIR] = await processBinauralAudio(
          binauralSamplesFromBuffer(buffer),
          sampleRate
        );
      } else {
        [results, intermediateResults, squaredIR] = await processMidSideAudio(
          binauralSamplesFromBuffer(buffer),
          sampleRate
        );
      }

      this.squaredIRs.set(id, squaredIR);
      this.intermediateResults.set(id, intermediateResults);
      this.results.set(id, {
        ...results,
        ...(await calculateStrengths(
          buffer.getChannelData(0),
          sampleRate,
          {
            ...intermediateResults,
            c80Bands: results.c80Bands,
          },
          this.environment
        )),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      if (err instanceof Error) {
        this.dispatchEvent('file-processing-error', {
          id,
          fileName,
          error: err,
        });
      }
    }

    this.dispatchEvent('change', undefined);
  }

  private async recalculateStrengths() {
    for (const response of this.responses) {
      const results = this.getResultsOrThrow(response.id);
      const intermediateResults = this.getIntermediateResultsOrThrow(
        response.id
      );

      this.results.set(response.id, {
        ...results,
        // eslint-disable-next-line no-await-in-loop
        ...(await calculateStrengths(
          response.buffer.getChannelData(0),
          response.buffer.sampleRate,
          {
            ...intermediateResults,
            c80Bands: results.c80Bands,
          },
          this.environment
        )),
      });
    }

    this.dispatchEvent('change', undefined);
  }

  private findAvailableColor(): string {
    const takenColors = this.responses.map(r => r.color);
    const color = FILE_COLORS.find(c => !takenColors.includes(c));

    if (!color) {
      throw new Error(
        `could not find available color takenColors=${takenColors}`
      );
    }

    return color;
  }

  /**
   * @copyright Michal Zalecki
   * @returns A pseudo-random ID
   */
  private static randomId(): string {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(8);
  }
}
