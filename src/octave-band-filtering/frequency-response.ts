/**
 * Calculate the frequency response of a digital filter for given evaluation frequency.
 * The digital filter is defined by feedforward and feedback coefficients.
 */
export function frequencyResponse(
  feedforward: number[],
  feedback: number[],
  evaluationFrequency: number,
  sampleRate: number
): number {
  if (feedback.length !== feedforward.length) {
    throw new Error(
      'expected lengths of feedback and feedforward arrays to match'
    );
  }

  const ctx = new OfflineAudioContext({
    length: 1, // irrelevant, but cannot be 0
    sampleRate,
  });
  const filter = ctx.createIIRFilter(feedforward, feedback);
  const magnitude = new Float32Array(1);

  filter.getFrequencyResponse(
    new Float32Array([evaluationFrequency]),
    magnitude,
    new Float32Array(1)
  );

  return magnitude[0];
}
