import { expect } from '@esm-bundle/chai';
import { formatResponseSummary } from '../../src/presentation/room-response-format';

it('formats monaural file details', () => {
  expect(
    formatResponseSummary({
      type: 'monaural',
      duration: 1,
      sampleRate: 44100,
    })
  ).to.equal('Monaural • 44100Hz • 1.00s');
});

it('formats binaural file details', () => {
  expect(
    formatResponseSummary({
      type: 'binaural',
      duration: 1,
      sampleRate: 44100,
    })
  ).to.equal('Binaural • 44100Hz • 1.00s');
});
