export function arrayCumulativeSum(array: Float32Array): Float64Array {
  if (array.length < 1) {
    throw new Error('cumulative sum expects values in the given array');
  }

  // TODO: this needs to stay f64 for proper bass ratio calculation, why?
  const sum = new Float64Array(array.length);
  // eslint-disable-next-line prefer-destructuring
  sum[0] = array[0];

  for (let i = 1; i < array.length; i += 1) {
    sum[i] = sum[i - 1] + array[i];
  }

  return sum;
}
