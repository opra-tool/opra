export class BinauralAudio {
  readonly leftSamples: Float64Array;

  readonly rightSamples: Float64Array;

  readonly sampleRate: number;

  constructor(
    leftSamples: Float64Array,
    rightSamples: Float64Array,
    sampleRate: number
  ) {
    if (leftSamples.length !== rightSamples.length) {
      throw new Error('expected left and right samples to be of equal length');
    }

    this.leftSamples = leftSamples;
    this.rightSamples = rightSamples;
    this.sampleRate = sampleRate;
  }
}

export function binauralAudioFromBuffer(buffer: AudioBuffer) {
  const leftChannel = new Float64Array(buffer.getChannelData(0));
  const rightChannel = new Float64Array(buffer.getChannelData(1));

  return new BinauralAudio(leftChannel, rightChannel, buffer.sampleRate);
}
