type Coefficients = {
  b: Float64Array;
  a: Float64Array;
};

/**
 * Implementation from: https://www.dsprelated.com/showcode/214.php
 * TODO: cross-check with IEC 61672-1
 */
export function getAWeightingFilterCoefficients(fs: number): Coefficients {
  console.log(fs);
  return {
    b: new Float64Array(),
    a: new Float64Array(),
  };
}
