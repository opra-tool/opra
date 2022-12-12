export class BinauralSamples {
  readonly leftChannel: Float32Array;

  readonly rightChannel: Float32Array;

  constructor(leftSamples: Float32Array, rightSamples: Float32Array) {
    if (leftSamples.length !== rightSamples.length) {
      throw new Error('expected left and right samples to be of equal length');
    }

    this.leftChannel = leftSamples;
    this.rightChannel = rightSamples;
  }

  get length(): number {
    return this.leftChannel.length;
  }
}

export function binauralAudioFromBuffer(buffer: AudioBuffer) {
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);

  return new BinauralSamples(leftChannel, rightChannel);
}
