import { IRBuffer } from './buffer';

export class OctaveBandValues {
  private values: number[];

  constructor(values: number[]) {
    // TODO: validate length
    this.values = values;
  }

  get length(): number {
    return this.values.length;
  }

  // TODO: use center frequency
  band(index: number): number {
    return this.values[index];
  }

  raw(): number[] {
    return this.values;
  }

  transform(
    callback: (value: number, index: number) => number
  ): OctaveBandValues {
    return new OctaveBandValues(this.values.map(callback));
  }
}

export class OctaveBands {
  readonly sampleRate;

  private bands: IRBuffer[];

  constructor(bands: IRBuffer[]) {
    // TODO: sample rate validation
    this.bands = bands;
    this.sampleRate = bands[0].sampleRate;
  }

  // TODO: use center frequency
  band(index: number): IRBuffer {
    return this.bands[index];
  }

  map<U>(callback: (band: IRBuffer, index: number) => U): U[] {
    return this.bands.map(callback);
  }

  // TODO: use center frequency
  slice(start?: number, end?: number): IRBuffer[] {
    return this.bands.slice(start, end);
  }

  transform(callback: (band: IRBuffer) => IRBuffer): OctaveBands {
    return new OctaveBands(this.bands.map(callback));
  }

  collect(
    callback: (band: IRBuffer, index: number) => number
  ): OctaveBandValues {
    return new OctaveBandValues(this.bands.map(callback));
  }

  sum(): OctaveBandValues {
    return this.collect(band => band.sum());
  }

  [Symbol.iterator](): Iterator<IRBuffer> {
    let index = 0;
    return {
      next: () =>
        // eslint-disable-next-line no-plusplus
        ({ value: this.bands[index++], done: index >= this.bands.length }),
    };
  }
}
