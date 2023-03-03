export class BinauralSamples {
  readonly leftChannel: Float32Array;

  readonly rightChannel: Float32Array;

  constructor(leftChannel: Float32Array, rightChannel: Float32Array) {
    if (leftChannel.length !== rightChannel.length) {
      throw new Error('expected left and right samples to be of equal length');
    }

    this.leftChannel = leftChannel;
    this.rightChannel = rightChannel;
  }

  get length(): number {
    return this.leftChannel.length;
  }
}

export function binauralSamplesFromBuffer(buffer: AudioBuffer) {
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);

  return new BinauralSamples(leftChannel, rightChannel);
}
