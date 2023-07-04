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

export async function calculateLpe10(
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

  const dirac = createDiracImpulse(buffer, environmentValues);

  const bands = await octfilt(dirac);

  // FIXME: using getChannel(0) here could lead to problems with binaural files
  return bands.collect(
    (band, centerFrequency) =>
      10 * safeLog10(arraySquaredSum(band.getChannel(0))) +
      20 * Math.log(environmentValues.distanceFromSource / 10) +
      airDampingCompensation +
      -airDamping10m.band(centerFrequency)
  );
}

function createDiracImpulse(
  buffer: CustomAudioBuffer,
  { airTemperature, referencePressure, sourcePower }: EnvironmentValues
): CustomAudioBuffer {
  let diracEnergy;
  if (sourcePower !== undefined && referencePressure !== undefined) {
    const airDensity = 1.2;
    const speedOfSound = 331.3 * Math.sqrt(1 + airTemperature / 273.15);
    diracEnergy =
      referencePressure *
      Math.sqrt(
        sourcePower * airDensity * ((speedOfSound / 4) * Math.PI * 10 ** 2)
      );
  } else {
    diracEnergy = arrayMaxAbs(buffer.getChannel(0)) / Math.SQRT2;
  }

  // one second dirac impulse with its spike placed at the approximate
  // time it takes for sound waves to travel a distance of 10m
  const dirac = new Float32Array(buffer.sampleRate);
  const spikeIndex = Math.floor(0.03 * buffer.sampleRate);
  dirac[spikeIndex] = diracEnergy;

  return new CustomAudioBuffer(dirac, buffer.sampleRate);
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
