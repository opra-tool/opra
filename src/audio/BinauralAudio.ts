export class BinauralAudio {
  private leftChannel: Float64Array;

  private rightChannel: Float64Array;

  private sampleRate: number;

  constructor(
    leftChannel: Float64Array,
    rightChannel: Float64Array,
    sampleRate: number
  ) {
    BinauralAudio.throwIfChannelsNotEqualLength(leftChannel, rightChannel);

    this.leftChannel = leftChannel;
    this.rightChannel = rightChannel;
    this.sampleRate = sampleRate;
  }

  static fromAudioBuffer(buffer: AudioBuffer) {
    const leftChannel = new Float64Array(buffer.getChannelData(0));
    const rightChannel = new Float64Array(buffer.getChannelData(1));

    BinauralAudio.throwIfChannelsNotEqualLength(leftChannel, rightChannel);

    return new this(leftChannel, rightChannel, buffer.sampleRate);
  }

  getLeftChannel(): Float64Array {
    return this.leftChannel;
  }

  getRightChannel(): Float64Array {
    return this.rightChannel;
  }

  getSampleRate(): number {
    return this.sampleRate;
  }

  getLength(): number {
    // channels are guaranteed to have same length
    return this.leftChannel.length;
  }

  private static throwIfChannelsNotEqualLength(
    leftChannel: Float64Array,
    rightChannel: Float64Array
  ) {
    if (leftChannel.length !== rightChannel.length) {
      throw new Error('channels of binaural audio should be of same length');
    }
  }
}
