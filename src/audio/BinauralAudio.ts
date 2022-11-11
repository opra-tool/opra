export class BinauralAudio {
  readonly leftSamples: Float64Array;

  readonly rightSamples: Float64Array;

  constructor(leftSamples: Float64Array, rightSamples: Float64Array) {
    if (leftSamples.length !== rightSamples.length) {
      throw new Error('expected left and right samples to be of equal length');
    }

    this.leftSamples = leftSamples;
    this.rightSamples = rightSamples;
  }
}

export function binauralAudioFromBuffer(buffer: AudioBuffer) {
  const leftChannel = new Float64Array(buffer.getChannelData(0));
  const rightChannel = new Float64Array(buffer.getChannelData(1));

  return new BinauralAudio(leftChannel, rightChannel);
}
