import { OctaveBands } from '../transfer-objects/octave-bands';
import { binauralToMidSide, binauralToOmnidirectional } from './conversion';
import { octfilt } from './octave-band-filtering/octave-band-filtering';
import { CustomAudioBuffer } from '../transfer-objects/audio-buffer';
import { ImpulseResponseType } from '../transfer-objects/impulse-response-file';
import { correctStarttime } from './starttime';

type OctaveBandsAndSquaredIR = {
  omnidirectionalBands: OctaveBands;
  binauralBands?: OctaveBands;
  midSideBands?: OctaveBands;
  squaredIRSamples: Float32Array; // TODO: this is shown as log scale, is squaring necessary?
};

export function separateIntoBandsAndSquaredIR(
  fileType: ImpulseResponseType,
  buffer: CustomAudioBuffer
): Promise<OctaveBandsAndSquaredIR> {
  const calcFunction = {
    omnidirectional,
    binaural,
    'mid-side': midSide,
  }[fileType];

  return calcFunction(buffer);
}

async function omnidirectional(buffer: CustomAudioBuffer) {
  const starttimeCorrected = correctStarttime(buffer);
  const omnidirectionalBands = await octfilt(starttimeCorrected);

  // TODO: do not square, square in params, instead
  const omnidirectionalBandsSquared = omnidirectionalBands.transform(band =>
    band.transform(calculateSquaredIR)
  );

  return {
    omnidirectionalBands: omnidirectionalBandsSquared,
    squaredIRSamples: calculateSquaredIR(buffer.getChannel(0)),
  };
}

async function binaural(buffer: CustomAudioBuffer) {
  const starttimeCorrected = correctStarttime(buffer);
  const binauralBands = await octfilt(starttimeCorrected);

  const omnidirectionalBuffer = await binauralToOmnidirectional(
    starttimeCorrected
  );

  // TODO: do not square, square in params, instead
  const omnidirectionalBandsSquared = (
    await octfilt(omnidirectionalBuffer)
  ).transform(band => band.transform(calculateSquaredIR));

  // TODO: do not square, square in params, instead
  const midSideBandsSquared = binauralBands
    .transform(binauralToMidSide)
    .transform(band => band.transform(calculateSquaredIR));

  return {
    omnidirectionalBands: omnidirectionalBandsSquared,
    binauralBands,
    midSideBands: midSideBandsSquared,
    squaredIRSamples: calculateSquaredIR(omnidirectionalBuffer.getChannel(0)),
  };
}

async function midSide(buffer: CustomAudioBuffer) {
  const starttimeCorrected = correctStarttime(buffer);

  // TODO: do not square, square in params, instead
  const midSideBandsSquared = (await octfilt(starttimeCorrected)).transform(
    band => band.transform(calculateSquaredIR)
  );

  const omnidirectionalBandsSquared = midSideBandsSquared.transform(
    band => new CustomAudioBuffer(band.getChannel(0), band.sampleRate)
  );

  return {
    omnidirectionalBands: omnidirectionalBandsSquared,
    midSideBands: midSideBandsSquared,
    squaredIRSamples: calculateSquaredIR(buffer.getChannel(0)),
  };
}

function calculateSquaredIR(samples: Float32Array): Float32Array {
  const newSamples = new Float32Array(samples.length);

  for (let i = 0; i < samples.length; i++) {
    newSamples[i] = samples[i] ** 2;
  }

  return newSamples;
}
