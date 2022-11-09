type EarlyLateFractions = {
  e50: Float64Array;
  l50: Float64Array;
  e80: Float64Array;
  l80: Float64Array;
};

// TODO: separate into e50(), e80() and l50(), l80()
export function earlyLateFractions(
  audio: Float64Array,
  fs: number
): EarlyLateFractions {
  const smp50 = Math.round(0.05 * fs);
  const smp80 = Math.round(0.08 * fs);

  const e50 = audio.slice(0, smp50);
  const l50 = audio.slice(smp50);
  const e80 = audio.slice(0, smp80);
  const l80 = audio.slice(smp80);

  return {
    e50,
    l50,
    e80,
    l80,
  };
}
