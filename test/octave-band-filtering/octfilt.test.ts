import { expect } from '@esm-bundle/chai';
import { octfilt } from '../../src/octave-band-filtering/octave-band-filtering';

it('produces 8 octave bands', async () => {
  const bands = await octfilt(new Float32Array([1]), 48000);

  expect(bands.length).to.equal(8);
});
