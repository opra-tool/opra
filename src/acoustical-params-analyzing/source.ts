import { OctaveBands } from '../transfer-objects/octave-bands';
import { binauralToMidSide, binauralToOmnidirectional } from './conversion';
import { octfilt } from './octave-band-filtering/octave-band-filtering';
import { CustomAudioBuffer } from '../transfer-objects/audio-buffer';
import { ImpulseResponseType } from '../transfer-objects/impulse-response-file';
import { correctStarttime } from './starttime';

// TODO: find better name

export class IRSource {
  readonly squaredIR: Float32Array;

  private bandsPerType: Map<ImpulseResponseType, OctaveBands>;

  private constructor(
    squaredIR: Float32Array,
    bandsPerType: Map<ImpulseResponseType, OctaveBands>
  ) {
    this.squaredIR = squaredIR;
    this.bandsPerType = bandsPerType;
  }

  isCompatibleWith(type: ImpulseResponseType): boolean {
    return this.bandsPerType.has(type);
  }

  getBandsForType(type: ImpulseResponseType): OctaveBands {
    const bands = this.bandsPerType.get(type);

    if (!bands) {
      throw new Error(`not compatible with type ${type}`);
    }

    return bands;
  }

  // TODO: do not set squared bands, use non-squared instead, square in params instead
  static async create(
    type: ImpulseResponseType,
    buffer: CustomAudioBuffer
  ): Promise<IRSource> {
    const starttimeCorrected = correctStarttime(buffer);
    const bands = await octfilt(starttimeCorrected);

    if (type === 'binaural') {
      const omnidirectionalBuffer = await binauralToOmnidirectional(
        starttimeCorrected
      );
      const omnidirectionalBandsSquared = (
        await octfilt(omnidirectionalBuffer)
      ).transform(band => band.transform(calculateSquaredIR));

      const midSideBandsSquared = bands
        .transform(binauralToMidSide)
        .transform(band => band.transform(calculateSquaredIR));

      return new IRSource(
        calculateSquaredIR(omnidirectionalBuffer.getChannel(0)),
        new Map([
          ['omnidirectional', omnidirectionalBandsSquared],
          ['binaural', bands],
          ['mid-side', midSideBandsSquared],
        ])
      );
    }

    if (type === 'mid-side') {
      const midSideBandsSquared = bands.transform(band =>
        band.transform(calculateSquaredIR)
      );
      const omnidirectionalBandsSquared = midSideBandsSquared.transform(
        band => new CustomAudioBuffer(band.getChannel(0), band.sampleRate)
      );

      return new IRSource(
        calculateSquaredIR(buffer.getChannel(0)),
        new Map([
          ['omnidirectional', omnidirectionalBandsSquared],
          ['mid-side', midSideBandsSquared],
        ])
      );
    }

    const omnidirectionalBandsSquared = bands.transform(band =>
      band.transform(calculateSquaredIR)
    );

    return new IRSource(
      calculateSquaredIR(buffer.getChannel(0)),
      new Map([['omnidirectional', omnidirectionalBandsSquared]])
    );
  }
}

function calculateSquaredIR(samples: Float32Array): Float32Array {
  const newSamples = new Float32Array(samples.length);

  for (let i = 0; i < samples.length; i++) {
    newSamples[i] = samples[i] ** 2;
  }

  return newSamples;
}
