import { expect } from '@esm-bundle/chai';
import { CustomAudioBuffer } from '../../src/transfer-objects/audio-buffer';

it('is not possible to create buffer with more than two channels', () => {
  expect(
    () =>
      new CustomAudioBuffer(
        [new Float32Array(), new Float32Array(), new Float32Array()],
        48_000
      )
  ).to.throw();
});

it('is not possible to create buffer with channels of different lengths', () => {
  expect(
    () =>
      new CustomAudioBuffer([new Float32Array(1), new Float32Array(2)], 48_000)
  ).to.throw();
});

it('sum() on a stereo buffer will throw', () => {
  expect(() =>
    new CustomAudioBuffer(
      [new Float32Array(), new Float32Array()],
      48_000
    ).sum()
  ).to.throw();
});

it('is possible to iterate over channels', () => {
  const buffer = new CustomAudioBuffer(
    [new Float32Array([1]), new Float32Array([2])],
    48_000
  );

  let counter = 0;
  for (const _ of buffer) {
    counter += 1;
  }

  expect(counter).to.equal(buffer.numberOfChannels);
});
