import { ImpulseResponse } from './analyzing/impulse-response';

/**
 * Converts a binaural to a mid/side response or a mid/side to a binaural response.
 *
 * For conversion the following formulae are used:
 *
 * M = (L + R) / sqrt(2)
 * S = (L - R) / sqrt(2)
 *
 * L = (M + S) / sqrt(2)
 * R = (M - S) / sqrt(2)
 *
 * If a response has been converted previously (original buffer is present), conversion yields the original response.
 *
 * @param response A binaural or mid/side impulse response
 * @returns The converted response
 */
export function convertBetweenBinauralAndMidSide({
  type,
  buffer,
  originalBuffer,
  ...rest
}: ImpulseResponse): ImpulseResponse {
  if (type === 'binaural') {
    if (originalBuffer) {
      throw new Error('cannot undo conversion from binaural to mid-side');
    }

    const newBuffer = new AudioBuffer({
      sampleRate: buffer.sampleRate,
      length: buffer.length,
      numberOfChannels: 2,
    });
    const channel0 = buffer.getChannelData(0);
    const channel1 = buffer.getChannelData(1);

    for (let i = 0; i < buffer.length; i++) {
      newBuffer.getChannelData(0)[i] = (channel0[i] + channel1[i]) / Math.SQRT2;
      newBuffer.getChannelData(1)[i] = (channel0[i] - channel1[i]) / Math.SQRT2;
    }

    return {
      ...rest,
      type: type === 'binaural' ? 'mid-side' : 'binaural',
      buffer: newBuffer,
      originalBuffer: buffer,
    };
  }

  if (type === 'mid-side') {
    if (!originalBuffer) {
      throw new Error('cannot convert from mid-side to binaural');
    }

    return {
      ...rest,
      type: 'binaural',
      buffer: originalBuffer,
    };
  }

  throw new Error(
    'can only convert between binaural and mid/side impulse responses'
  );
}
