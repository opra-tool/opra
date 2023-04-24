import { expect } from '@esm-bundle/chai';
import { correctStarttime } from '../../src/analyzing/starttime';
import { IRBuffer } from '../../src/analyzing/buffer';

it('trims samples to correct starttime', () => {
  const buffer = new IRBuffer(
    new Float32Array([
      0, 0, 0.001, 0.001, 0.01, 0.02, 0.03, 0.04, 1, 0.001, 0, 0,
    ]),
    48_000
  );

  const result = correctStarttime(buffer);

  expect(result.getChannel(0)).deep.equal(
    new Float32Array([0.02, 0.03, 0.04, 1, 0.001, 0, 0])
  );
});

it('trims binaural samples to correct starttime', () => {
  const buffer = new IRBuffer(
    [
      new Float32Array([
        0, 0, 0.001, 0.001, 0.01, 0.02, 0.03, 0.04, 1, 0.001, 0,
      ]),
      new Float32Array([
        0, 0.001, 0.001, 0.01, 0.02, 0.03, 0.04, 1, 0.001, 0, 0,
      ]),
    ],
    48_000
  );

  const result = correctStarttime(buffer);

  expect(result.getChannel(0)).deep.equal(
    new Float32Array([0.01, 0.02, 0.03, 0.04, 1, 0.001, 0])
  );
  expect(result.getChannel(1)).deep.equal(
    new Float32Array([0.02, 0.03, 0.04, 1, 0.001, 0, 0])
  );
});
