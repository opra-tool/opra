type EarlyLateFractions = {
  e50: Float32Array;
  l50: Float32Array;
  e80: Float32Array;
  l80: Float32Array;
};

export function elf(data: Float32Array, fs: number): EarlyLateFractions {
  const smp50 = Math.round(0.05 * fs);
  const smp80 = Math.round(0.08 * fs);

  const e50 = data.slice(0, smp50); // smp50 + 1?
  const l50 = data.slice(smp50 + 1);
  const e80 = data.slice(0, smp80); // smp80 + 1?
  const l80 = data.slice(smp80 + 1);

  return {
    e50,
    l50,
    e80,
    l80
  }
}
