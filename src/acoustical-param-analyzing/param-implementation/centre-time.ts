import { createSingleFigureParameterImplementation } from '../param-implementation';

export const CENTRE_TIME = createSingleFigureParameterImplementation(
  'centreTime',
  'omnidirectional',
  bands => {
    const centreTimes = [bands.band(500), bands.band(1000)].map(band => {
      const samples = band.getChannel(0);

      let numerator = 0;
      let denominator = 0;

      for (let i = 0; i < band.length; i++) {
        const t = i / bands.sampleRate;
        numerator += t * samples[i];
        denominator += samples[i];
      }

      return numerator / denominator;
    });

    return (centreTimes[0] + centreTimes[1]) / 2;
  }
);
