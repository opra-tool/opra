import { CustomAudioBuffer } from '../transfer-objects/audio-buffer';

const DIFFUS_FIELD_EQUALIZATION_COEFFICIENTS = new Map<number, number[][]>([
  [
    44_100,
    [
      [
        1.03390088022668, -1.97973494555988, 0.966099119773324,
        1.03717157599861, -1.97973494555988, 0.962828424001388,
      ],
      [
        1.55663287130844, -1.95449999292109, 0.44336712869156, 1.4174157669183,
        -1.95449999292109, 0.582584233081703,
      ],
      [
        1.06750221499206, -1.91935045467099, 0.932497785007943,
        1.07316746758594, -1.91935045467099, 0.926832532414064,
      ],
      [
        1.60976355878823, -1.60282724373591, 0.390236441211773,
        1.22917195316465, -1.60282724373591, 0.770828046835349,
      ],
      [
        1.19717815477903, -0.783429056224196, 0.802821845220972,
        1.17173499354726, -0.783429056224196, 0.828265006452742,
      ],
    ],
  ],
  [
    48_000,
    [
      [
        1.03116288646294, -1.98288972274762, 0.96883711353706, 1.0341694255355,
        -1.98288972274762, 0.965830574464501,
      ],
      [
        1.51201543011702, -1.96157056080646, 0.487984569882977,
        1.38395740613362, -1.96157056080646, 0.616042593866378,
      ],
      [
        1.06214929968257, -1.93185165257814, 0.937850700317433, 1.0673652986135,
        -1.93185165257814, 0.932634701386496,
      ],
      [
        1.56639444579686, -1.66293922460509, 0.433605554203142,
        1.21287221831168, -1.66293922460509, 0.787127781688317,
      ],
      [
        1.18833390039809, -0.954317520519217, 0.811666099601906,
        1.16403197000115, -0.954317520519217, 0.835968029998845,
      ],
    ],
  ],
  [
    96_000,
    [
      [
        1.03116288646294, -1.98288972274762, 0.96883711353706, 1.0341694255355,
        -1.98288972274762, 0.965830574464501,
      ],
      [
        1.51201543011702, -1.96157056080646, 0.487984569882977,
        1.38395740613362, -1.96157056080646, 0.616042593866378,
      ],
      [
        1.06214929968257, -1.93185165257814, 0.937850700317433, 1.0673652986135,
        -1.93185165257814, 0.932634701386496,
      ],
      [
        1.56639444579686, -1.66293922460509, 0.433605554203142,
        1.21287221831168, -1.66293922460509, 0.787127781688317,
      ],
      [
        1.18833390039809, -0.954317520519217, 0.811666099601906,
        1.16403197000115, -0.954317520519217, 0.835968029998845,
      ],
    ],
  ],
  [
    192_000,
    [
      [
        1.03116288646294, -1.98288972274762, 0.96883711353706, 1.0341694255355,
        -1.98288972274762, 0.965830574464501,
      ],
      [
        1.51201543011702, -1.96157056080646, 0.487984569882977,
        1.38395740613362, -1.96157056080646, 0.616042593866378,
      ],
      [
        1.06214929968257, -1.93185165257814, 0.937850700317433, 1.0673652986135,
        -1.93185165257814, 0.932634701386496,
      ],
      [
        1.56639444579686, -1.66293922460509, 0.433605554203142,
        1.21287221831168, -1.66293922460509, 0.787127781688317,
      ],
      [
        1.18833390039809, -0.954317520519217, 0.811666099601906,
        1.16403197000115, -0.954317520519217, 0.835968029998845,
      ],
    ],
  ],
]);

/**
 * Converts a binaural to a mid/side buffer.
 *
 * For conversion the following formulae are used:
 *
 * M = (L + R) / sqrt(2)
 * S = (L - R) / sqrt(2)
 */
export function binauralToMidSide(
  buffer: CustomAudioBuffer
): CustomAudioBuffer {
  if (buffer.numberOfChannels !== 2) {
    throw new Error('expected a stereo audio buffer');
  }

  const leftChannel = buffer.getChannel(0);
  const rightChannel = buffer.getChannel(1);

  const midChannel = new Float32Array(buffer.length);
  const sideChannel = new Float32Array(buffer.length);

  for (let i = 0; i < buffer.length; i++) {
    midChannel[i] = (leftChannel[i] + rightChannel[i]) / Math.SQRT2;
    sideChannel[i] = (leftChannel[i] - rightChannel[i]) / Math.SQRT2;
  }

  return new CustomAudioBuffer([midChannel, sideChannel], buffer.sampleRate);
}

/**
 * Converts binaural audio into monaural audio using a diffus field equalization.
 *
 * TODO: extract diffus field equalization to its own file
 * TODO: extract logic copied from octfilt and reuse here and in octfilt?
 */
export async function binauralToMonaural(
  buffer: CustomAudioBuffer
): Promise<CustomAudioBuffer> {
  if (buffer.numberOfChannels !== 2) {
    throw new Error('expected a stereo audio buffer');
  }

  const coefficientsList = DIFFUS_FIELD_EQUALIZATION_COEFFICIENTS.get(
    buffer.sampleRate
  );

  if (!coefficientsList) {
    throw new Error(
      `cannot perform diffus field equalization for sample rate ${buffer.sampleRate}`
    );
  }

  const sourceAudioBuffer = new AudioBuffer({
    numberOfChannels: buffer.numberOfChannels,
    length: buffer.length,
    sampleRate: buffer.sampleRate,
  });

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    sourceAudioBuffer.copyToChannel(buffer.getChannel(i), i);
  }

  const ctx = new OfflineAudioContext(
    sourceAudioBuffer.numberOfChannels,
    sourceAudioBuffer.length,
    sourceAudioBuffer.sampleRate
  );

  const source = ctx.createBufferSource();
  source.buffer = sourceAudioBuffer;

  // const feedforward = coefficients.slice(3);
  // const feedbackward = coefficients.slice(0, 3);
  const filters = coefficientsList.map(coefficients =>
    ctx.createIIRFilter(coefficients.slice(3), coefficients.slice(0, 3))
  );

  const evalu: number[] = [];
  for (let i = 0; i < 1000; i++) {
    evalu.push(i * 10);
  }

  // const response = filterChainFrequencyResponse(filters, new Float32Array(evalu))
  // console.log(response.join(','))

  source.connect(filters[0]);
  for (let i = 1; i < filters.length; i++) {
    filters[i - 1].connect(filters[i]);
  }
  filters[filters.length - 1].connect(ctx.destination);

  source.start();

  const resultBuffer = await ctx.startRendering();

  const leftChannel = resultBuffer.getChannelData(0);
  const rightChannel = resultBuffer.getChannelData(1);

  const meanSamples = new Float32Array(resultBuffer.length);
  for (let i = 0; i < resultBuffer.length; i++) {
    meanSamples[i] = (leftChannel[i] + rightChannel[i]) / 2;
  }

  return new CustomAudioBuffer(meanSamples, buffer.sampleRate);
}