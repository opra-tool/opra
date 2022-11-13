export function arraySumSquared(array: Float32Array | Float64Array): number {
  let sum = 0;
  for (const el of array) {
    sum += el ** 2;
  }
  return sum;
}
