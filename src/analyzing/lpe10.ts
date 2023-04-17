import { safeLog10 } from '../math/safeLog10';
import { octfilt } from '../octave-band-filtering/octave-band-filtering';
import { EnvironmentValues } from '../analyzing/environment-values';
import { getFrequencyValues } from './octave-band-frequencies';
import { calculateSoundDampingInAir } from './dampening';
import { arrayMaxAbs, arraySquaredSum } from '../math/arrays';

export async function calculateLpe10(
  samples: Float32Array,
  sampleRate: number,
  environmentValues: EnvironmentValues
): Promise<number[]> {
  const airDamping1m = getFrequencyValues().map(frequency =>
    calculateSoundDampingInAir(
      environmentValues.airTemperature,
      environmentValues.relativeHumidity,
      frequency
    )
  );
  const airDamping10m = airDamping1m.map(x => 10 * x);
  const airDampingX = airDamping1m.map(
    x => environmentValues.distanceFromSource * x
  );
  const airDampingCompensation = calculateAirDampingCompensation(airDampingX);

  const dirac = createDiracImpulse(samples, sampleRate, environmentValues);

  const bands = await octfilt(dirac, sampleRate);

  return bands.map(
    (band, i) =>
      10 * safeLog10(arraySquaredSum(band)) +
      20 * Math.log(environmentValues.distanceFromSource / 10) +
      airDampingCompensation +
      -airDamping10m[i]
  );
}

function createDiracImpulse(
  samples: Float32Array,
  sampleRate: number,
  { airTemperature, referencePressure, sourcePower }: EnvironmentValues
): Float32Array {
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
    diracEnergy = arrayMaxAbs(samples) / Math.SQRT2;
  }

  // one second dirac impulse with its spike placed at the approximate
  // time it takes for sound waves to travel a distance of 10m
  const dirac = new Float32Array(sampleRate);
  const spikeIndex = Math.floor(0.03 * sampleRate);
  dirac[spikeIndex] = diracEnergy;

  return dirac;
}

function calculateAirDampingCompensation(airDamping: number[]) {
  const _unnnamed = 2 ** airDamping.length - 1;

  let accumulator = 0;
  for (let i = 0; i < airDamping.length; i += 1) {
    accumulator += (2 ** i / _unnnamed) * 10 ** (airDamping[i] / 10);
  }

  return 10 * safeLog10(accumulator);
}
