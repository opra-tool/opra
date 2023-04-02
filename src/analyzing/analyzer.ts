import { readAudioFile } from '../audio/audio-file-reading';
import { convertBetweenBinauralAndMidSide } from '../conversion';
import { EventEmitter } from '../event-emitter';
import {
  getResponses,
  persistResponse,
  persistValue,
  removeResponse,
  retrieveValue,
  retrieveValueOrDefault,
} from '../persistence';
import { processBinauralAudio } from './binaural-processing';
import { binauralSamplesFromBuffer } from './binaural-samples';
import { ImpulseResponse } from './impulse-response';
import { processMidSideAudio } from './mid-side-processing';
import { processMonauralAudio } from './monaural-processing';
import { calculateStrengths } from './strength';

const P0_STORAGE_KEY = 'strengths-p0';
const TEMPERATURE_STORAGE_KEY = 'strengths-temperature';
const HUMIDITY_STORAGE_KEY = 'strengths-humidity';

const DEFAULT_HUMIDITY = 50;
const DEFAULT_TEMPERATURE = 20;

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
  reverbTime: number;
  c50Bands: number[];
  c80Bands: number[];
  c80: number;
  centreTime: number;
  bassRatio: number;
  /* strength-based monaural parameters */
  strengthBands?: number[];
  earlyStrengthBands?: number[];
  lateStrengthBands?: number[];
  strength?: number;
  aWeightedStrength?: number;
  trebleRatio?: number;
  earlyBassLevel?: number;
  levelAdjustedC80?: number;
  /* binaural parameters */
  iacc?: number;
  iaccBands?: number[];
  eiaccBands?: number[];
  /* mid/side parameters */
  earlyLateralEnergyFractionBands?: number[];
  earlyLateralEnergyFraction?: number;
  earlyLateralSoundLevelBands?: number[];
  lateLateralSoundLevelBands?: number[];
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
  'p0-air-values-update': { p0: number; temperature: number; humidity: number };
  change: undefined;
};

export class Analyzer extends EventEmitter<AnalyzerEventMap> {
  private p0 = retrieveValue(P0_STORAGE_KEY);

  private temperature = retrieveValueOrDefault(
    TEMPERATURE_STORAGE_KEY,
    DEFAULT_TEMPERATURE
  );

  private humidity = retrieveValueOrDefault(
    HUMIDITY_STORAGE_KEY,
    DEFAULT_HUMIDITY
  );

  private responses: ImpulseResponse[] = [];

  private intermediateResults: Map<string, IntermediateResults> = new Map();

  private results: Map<string, Results> = new Map();

  constructor() {
    super();

    getResponses().then(responses => {
      for (const response of responses) {
        this.responses.push(response);
        this.analyzeResponse(response);
      }

      this.dispatchEvent('change', undefined);
    });
  }

  getP0(): number | null {
    return this.p0;
  }

  setP0(p0: number) {
    this.setP0AndAirValues(p0, this.temperature, this.humidity);
  }

  setP0AndAirValues(p0: number, temperature: number, humidity: number) {
    this.p0 = p0;
    this.temperature = temperature;
    this.humidity = humidity;

    setTimeout(() => {
      this.dispatchEvent('p0-air-values-update', {
        p0,
        temperature,
        humidity,
      });

      this.recalculateStrengths();

      persistValue(P0_STORAGE_KEY, p0);
      persistValue(TEMPERATURE_STORAGE_KEY, temperature);
      persistValue(HUMIDITY_STORAGE_KEY, humidity);
    }, 0);
  }

  getAirTemperature(): number {
    return this.temperature;
  }

  getRelativeHumidity(): number {
    return this.humidity;
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

      persistResponse(response);

      this.analyzeResponse(response);
    }, 0);
  }

  removeResponse(id: string) {
    this.responses = this.responses.filter(el => el.id !== id);

    this.results.delete(id);
    this.intermediateResults.delete(id);

    this.dispatchEvent('change', undefined);

    // eslint-disable-next-line no-console
    removeResponse(id).catch(console.error);
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

    // TODO: do more elegantly
    // eslint-disable-next-line no-console
    removeResponse(id).catch(console.error);
    persistResponse(response);
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

    // TODO: do more elegantly
    // eslint-disable-next-line no-console
    removeResponse(id).catch(console.error);
    persistResponse(newResponse);
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
      if (type === 'monaural') {
        [results, intermediateResults] = await processMonauralAudio(
          buffer.getChannelData(0),
          sampleRate
        );
      } else if (type === 'binaural') {
        [results, intermediateResults] = await processBinauralAudio(
          binauralSamplesFromBuffer(buffer),
          sampleRate
        );
      } else {
        [results, intermediateResults] = await processMidSideAudio(
          binauralSamplesFromBuffer(buffer),
          sampleRate
        );
      }

      this.intermediateResults.set(id, intermediateResults);

      if (this.p0 !== null) {
        this.results.set(id, {
          ...results,
          ...(await calculateStrengths(
            {
              ...intermediateResults,
              c80Bands: results.c80Bands,
            },
            {
              p0: this.p0,
              relativeHumidity: this.humidity,
              temperature: this.temperature,
            }
          )),
        });
      } else {
        this.results.set(id, results);
      }
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
    if (!this.p0) {
      throw new Error('expected p0 to be defined when recalcuation strengths');
    }

    for (const response of this.responses) {
      const results = this.getResultsOrThrow(response.id);
      const intermediateResults = this.getIntermediateResultsOrThrow(
        response.id
      );

      this.results.set(response.id, {
        ...results,
        // eslint-disable-next-line no-await-in-loop
        ...(await calculateStrengths(
          {
            ...intermediateResults,
            c80Bands: results.c80Bands,
          },
          {
            p0: this.p0,
            relativeHumidity: this.humidity,
            temperature: this.temperature,
          }
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
