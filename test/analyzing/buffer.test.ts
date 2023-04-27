import { expect } from '@esm-bundle/chai';
import { IRBuffer } from '../../src/analyzing/buffer';

it('cannot create buffer with more than two channels', () => {
  expect(
    () =>
      new IRBuffer(
        [new Float32Array(), new Float32Array(), new Float32Array()],
        48_000
      )
  ).to.throw();
});

it('cannot create buffer with channels of different lengths', () => {
  expect(
    () => new IRBuffer([new Float32Array(1), new Float32Array(2)], 48_000)
  ).to.throw();
});

it('assertMono() on a stereo buffer will throw', () => {
  expect(() =>
    new IRBuffer([new Float32Array(), new Float32Array()], 48_000).assertMono()
  ).to.throw();
});

it('assertStereo() on a mono buffer will throw', () => {
  expect(() =>
    new IRBuffer(new Float32Array(), 48_000).assertStereo()
  ).to.throw();
});

it('it is possible to iterate over channels', () => {
  const buffer = new IRBuffer(
    [new Float32Array([1]), new Float32Array([2])],
    48_000
  );

  let counter = 0;
  for (const _ of buffer) {
    counter += 1;
  }

  expect(counter).to.equal(buffer.numberOfChannels);
});
