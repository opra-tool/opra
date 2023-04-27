import { IRBuffer } from './buffer';

/**
 * Octave band center frequencies used for all octave-band-based calculations.
 */
export const CENTER_FREQUENCIES = [62.5, 125, 250, 500, 1000, 2000, 4000, 8000];

/**
 * A wrapper around numerical values calulated for each octave band.
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
 * A wrapper around audio buffers for each octave band.
 *
 * @see CENTER_FREQUENCIES
 * @see IRBuffer
 * @see OctaveBandValues
 */
export class OctaveBands {
  readonly sampleRate: number;

  private bands: IRBuffer[];

  constructor(bands: IRBuffer[]) {
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

  band(centerFrequency: number): IRBuffer {
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
      band: IRBuffer,
      centerFrequency: number,
      index: number
    ) => IRBuffer
  ): OctaveBands {
    return new OctaveBands(this.map(callback));
  }

  collect(
    callback: (band: IRBuffer, centerFrequency: number, index: number) => number
  ): OctaveBandValues {
    return new OctaveBandValues(this.map(callback));
  }

  sum(): OctaveBandValues {
    return this.collect(band => band.sum());
  }

  private map<U>(
    callback: (band: IRBuffer, centerFrequency: number, index: number) => U
  ): U[] {
    return this.bands.map((value, index) =>
      callback(value, CENTER_FREQUENCIES[index], index)
    );
  }

  [Symbol.iterator](): Iterator<IRBuffer> {
    let index = 0;
    return {
      next: () =>
        // eslint-disable-next-line no-plusplus
        ({ value: this.bands[index++], done: index > this.bands.length }),
    };
  }
}
