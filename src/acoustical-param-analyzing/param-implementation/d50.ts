import { e50Calc } from '../early-late-fractions';
import { createSingleFigureParameterImplementation } from '../param-implementation';

export const D50 = createSingleFigureParameterImplementation(
  'd50',
  'omnidirectional',
  bands => {
    const d50Bands = [bands.band(500), bands.band(1000)].map(band => {
      const e50Sum = e50Calc(band).squaredSum();

      return e50Sum / band.squaredSum();
    });

    return (d50Bands[0] + d50Bands[1]) / 2;
  }
);
