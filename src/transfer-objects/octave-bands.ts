import { CustomAudioBuffer } from './audio-buffer';

/**
 * Octave band center frequencies used for all octave-band calculations.
 */
export const CENTER_FREQUENCIES = [62.5, 125, 250, 500, 1000, 2000, 4000, 8000];

/**
 * A wrapper around numerical values, one for each center frequency.
 *
 * @see CENTER_FREQUENCIES
 * @see OctaveBands
 */
export class OctaveBandValues {
  private values: number[];

  constructor(values: number[]) {
    if (values.length !== CENTER_FREQUENCIES.length) {
      throw new Error(
        `expected length of octave band values (${values.length}) to match number of center frequencies (${CENTER_FREQUENCIES.length})`
      );
    }

    this.values = values;
  }

  get numberOfBands() {
    return this.values.length;
  }

  band(centerFrequency: number): number {
    const index = CENTER_FREQUENCIES.indexOf(centerFrequency);

    if (index === -1) {
      throw new Error(
        `invalid octave band center frequency (${centerFrequency})`
      );
    }

    return this.values[index];
  }

  sum(): number {
    return this.values.reduce((prev, cur) => prev + cur, 0);
  }

  raw(): number[] {
    return this.values;
  }

  combine(
    other: OctaveBandValues,
    callback: (selfValue: number, otherValue: number) => number
  ): OctaveBandValues {
    return new OctaveBandValues(
      this.values.map((value, index) => callback(value, other.values[index]))
    );
  }

  transform(
    callback: (value: number, centerFrequency: number, index: number) => number
  ): OctaveBandValues {
    return new OctaveBandValues(
      this.values.map((value, i) => callback(value, CENTER_FREQUENCIES[i], i))
    );
  }
}

/**
 * A wrapper around a number of custom audio buffers, one for each center frequency.
 *
 * @see CENTER_FREQUENCIES
 * @see CustomAudioBuffer
 * @see OctaveBandValues
 */
export class OctaveBands {
  readonly sampleRate: number;

  private bands: CustomAudioBuffer[];

  constructor(bands: CustomAudioBuffer[]) {
    if (bands.length !== CENTER_FREQUENCIES.length) {
      throw new Error(
        `expected length of octave bands (${bands.length}) to match number of center frequencies (${CENTER_FREQUENCIES.length})`
      );
    }

    let lastSampleRate;
    for (const band of bands) {
      if (lastSampleRate !== undefined && band.sampleRate !== lastSampleRate) {
        throw new Error(
          `expected sample rates of all octave bands to match (${bands.map(
            b => b.sampleRate
          )})`
        );
      }

      lastSampleRate = band.sampleRate;
    }

    this.bands = bands;
    this.sampleRate = bands[0].sampleRate;
  }

  get numberOfBands() {
    return this.bands.length;
  }

  band(centerFrequency: number): CustomAudioBuffer {
    const index = CENTER_FREQUENCIES.indexOf(centerFrequency);

    if (index === -1) {
      throw new Error(
        `invalid octave band center frequency (${centerFrequency})`
      );
    }

    return this.bands[index];
  }

  transform(
    callback: (
      band: CustomAudioBuffer,
      centerFrequency: number,
      index: number
    ) => CustomAudioBuffer
  ): OctaveBands {
    return new OctaveBands(this.map(callback));
  }

  async asyncTransform(
    callback: (band: CustomAudioBuffer) => Promise<CustomAudioBuffer>
  ): Promise<OctaveBands> {
    const bands = await Promise.all(this.bands.map(callback));

    return new OctaveBands(bands);
  }

  collect(
    callback: (
      band: CustomAudioBuffer,
      centerFrequency: number,
      index: number
    ) => number
  ): OctaveBandValues {
    return new OctaveBandValues(this.map(callback));
  }

  sum(): OctaveBandValues {
    return this.collect(band => band.sum());
  }

  raw(): CustomAudioBuffer[] {
    return this.bands;
  }

  private map<U>(
    callback: (
      band: CustomAudioBuffer,
      centerFrequency: number,
      index: number
    ) => U
  ): U[] {
    return this.bands.map((value, index) =>
      callback(value, CENTER_FREQUENCIES[index], index)
    );
  }

  [Symbol.iterator](): Iterator<CustomAudioBuffer> {
    let index = 0;
    return {
      next: () =>
        // eslint-disable-next-line no-plusplus
        ({ value: this.bands[index++], done: index > this.bands.length }),
    };
  }
}
