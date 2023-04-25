import { expect } from '@esm-bundle/chai';
import { binauralToMidSide } from '../src/conversion';
import { IRBuffer } from '../src/analyzing/buffer';

it('throws when attempting to convert a mono buffer', () => {
  expect(() =>
    binauralToMidSide(new IRBuffer(new Float32Array(), 48_000))
  ).to.throw();
});

it('returns a stereo buffer of the same length and sample rate as a given stereo buffer', () => {
  const input = new IRBuffer(
    [new Float32Array(100), new Float32Array(100)],
    48_000
  );
  const output = binauralToMidSide(input);

  expect(output.length).to.equal(input.length);
  expect(output.numberOfChannels).to.equal(input.numberOfChannels);
  expect(output.sampleRate).to.equal(input.sampleRate);
});
