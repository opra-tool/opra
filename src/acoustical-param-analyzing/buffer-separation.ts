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

  return {
    omnidirectionalBands,
    squaredIRSamples: calculateSquaredIR(buffer.getChannel(0)),
  };
}

async function binaural(buffer: CustomAudioBuffer) {
  const starttimeCorrected = correctStarttime(buffer);
  const binauralBands = await octfilt(starttimeCorrected);

  const omnidirectionalBuffer = await binauralToOmnidirectional(
    starttimeCorrected
  );

  const omnidirectionalBands = await octfilt(omnidirectionalBuffer);

  const midSideBandsSquared = binauralBands.transform(binauralToMidSide);

  return {
    omnidirectionalBands,
    binauralBands,
    midSideBands: midSideBandsSquared,
    squaredIRSamples: calculateSquaredIR(omnidirectionalBuffer.getChannel(0)),
  };
}

async function midSide(buffer: CustomAudioBuffer) {
  const starttimeCorrected = correctStarttime(buffer);

  const midSideBands = await octfilt(starttimeCorrected);

  const omnidirectionalBands = midSideBands.transform(
    band => new CustomAudioBuffer(band.getChannel(0), band.sampleRate)
  );

  return {
    omnidirectionalBands,
    midSideBands,
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
