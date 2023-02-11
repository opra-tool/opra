import { expect } from '@esm-bundle/chai';
import { BinauralSamples } from '../../src/analyzing/binaural-samples';
import {
  correctStarttimeBinaural,
  correctStarttimeMonaural,
} from '../../src/analyzing/starttime';

it('trims samples to correct starttime', () => {
  const samples = new Float32Array([
    0, 0, 0.001, 0.001, 0.01, 0.02, 0.03, 0.04, 1, 0.001, 0, 0,
  ]);

  const result = correctStarttimeMonaural(samples);

  expect(result).deep.equal(
    new Float32Array([0.02, 0.03, 0.04, 1, 0.001, 0, 0])
  );
});

it('trims binaural samples to correct starttime', () => {
  const leftSamples = new Float32Array([
    0, 0, 0.001, 0.001, 0.01, 0.02, 0.03, 0.04, 1, 0.001, 0,
  ]);
  const rightSamples = new Float32Array([
    0, 0.001, 0.001, 0.01, 0.02, 0.03, 0.04, 1, 0.001, 0, 0,
  ]);

  const result = correctStarttimeBinaural(
    new BinauralSamples(leftSamples, rightSamples)
  );

  expect(result.leftChannel).deep.equal(
    new Float32Array([0.01, 0.02, 0.03, 0.04, 1, 0.001, 0])
  );
  expect(result.rightChannel).deep.equal(
    new Float32Array([0.02, 0.03, 0.04, 1, 0.001, 0, 0])
  );
});
