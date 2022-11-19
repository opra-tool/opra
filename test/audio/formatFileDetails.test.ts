import { expect } from '@esm-bundle/chai';
import { formatFileDetails } from '../../src/audio/formatFileDetails';

it('formats monaural file details', () => {
  expect(
    formatFileDetails({
      channelCount: 1,
      durationSeconds: 1,
      sampleRate: 44100,
    })
  ).to.equal('Monaural • 44100Hz • 1.00s');
});

it('formats binaural file details', () => {
  expect(
    formatFileDetails({
      channelCount: 2,
      durationSeconds: 1,
      sampleRate: 44100,
    })
  ).to.equal('Binaural • 44100Hz • 1.00s');
});
