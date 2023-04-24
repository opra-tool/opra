import { OctaveBands } from './octave-bands';

/**
 * Calculates the centre time as defined in ISO 3382-1, in seconds.
 */
export function calculateCentreTime(irBands: OctaveBands): number {
  const bands500Hz1000Hz = irBands.slice(3, 5);

  const centreTimes = bands500Hz1000Hz.map(band => {
    band.assertMono();

    const samples = band.getChannel(0);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < band.length; i++) {
      const t = i / irBands.sampleRate;
      numerator += t * samples[i];
      denominator += samples[i];
    }

    return numerator / denominator;
  });

  return (centreTimes[0] + centreTimes[1]) / 2;
}
