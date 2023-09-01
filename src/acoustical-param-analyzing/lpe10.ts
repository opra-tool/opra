import { safeLog10 } from '../math/safeLog10';
import { octfilt } from './octave-band-filtering/octave-band-filtering';
import { EnvironmentValues } from '../transfer-objects/environment-values';
import {
  CENTER_FREQUENCIES,
  OctaveBandValues,
} from '../transfer-objects/octave-bands';
import { soundDamping } from './sound-damping';
import { arrayMaxAbs, arraySquaredSum } from '../math/arrays';
import { CustomAudioBuffer } from '../transfer-objects/audio-buffer';
import { ImpulseResponseType } from '../transfer-objects/impulse-response-file';

export async function calculateLpe10(
  type: ImpulseResponseType,
  buffer: CustomAudioBuffer,
  environmentValues: EnvironmentValues
): Promise<OctaveBandValues> {
  const airDamping1m = new OctaveBandValues(
    CENTER_FREQUENCIES.map(frequency =>
      soundDamping(
        environmentValues.airTemperature,
        environmentValues.relativeHumidity,
        frequency
      )
    )
  );
  const airDamping10m = airDamping1m.transform(x => 10 * x);
  const airDampingX = airDamping1m.transform(
    x => environmentValues.distanceFromSource * x
  );
  const airDampingCompensation = calculateAirDampingCompensation(airDampingX);

  const dirac = createDiracImpulse(type, buffer, environmentValues);

  const bands = await octfilt(dirac);

  return bands.collect(
    (band, centerFrequency) =>
      10 * safeLog10(arraySquaredSum(band.getChannel(0))) +
      20 * Math.log(environmentValues.distanceFromSource / 10) +
      airDampingCompensation +
      -airDamping10m.band(centerFrequency)
  );
}

function createDiracImpulse(
  type: ImpulseResponseType,
  buffer: CustomAudioBuffer,
  environmentValues: EnvironmentValues
): CustomAudioBuffer {
  // one second dirac impulse with its spike placed at the approximate
  // time it takes for sound waves to travel a distance of 10m
  const dirac = new Float32Array(buffer.sampleRate);
  const spikeIndex = Math.floor(0.03 * buffer.sampleRate);
  dirac[spikeIndex] = calculateDiracEnergy(type, buffer, environmentValues);

  return new CustomAudioBuffer(dirac, buffer.sampleRate);
}

function calculateDiracEnergy(
  type: ImpulseResponseType,
  buffer: CustomAudioBuffer,
  { airTemperature, referencePressure, sourcePower }: EnvironmentValues
): number {
  if (sourcePower !== undefined && referencePressure !== undefined) {
    const airDensity = 1.2;
    const speedOfSound = 331.3 * Math.sqrt(1 + airTemperature / 273.15);

    return (
      referencePressure *
      Math.sqrt(
        sourcePower * airDensity * ((speedOfSound / 4) * Math.PI * 10 ** 2)
      )
    );
  }

  return impulseResponseMaxAbs(type, buffer) / Math.SQRT2;
}

function impulseResponseMaxAbs(
  type: ImpulseResponseType,
  buffer: CustomAudioBuffer
): number {
  if (type === 'binaural') {
    return Math.max(
      arrayMaxAbs(buffer.getChannel(0)),
      arrayMaxAbs(buffer.getChannel(1))
    );
  }

  return arrayMaxAbs(buffer.getChannel(0));
}

function calculateAirDampingCompensation(airDamping: OctaveBandValues) {
  const _unnnamed = 2 ** airDamping.numberOfBands - 1;

  return (
    10 *
    safeLog10(
      airDamping
        .transform(
          (value, _, index) => (2 ** index / _unnnamed) * 10 ** (value / 10)
        )
        .sum()
    )
  );
}
