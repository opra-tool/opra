import { expect } from '@esm-bundle/chai';
import { addDecibel, meanDecibel } from '../../src/math/decibels';

// TODO: fix & reactivate
it.skip('adds decibel values', () => {
  const actual = addDecibel(10, 20, 30, 40);

  expect(actual.toFixed(10)).equal('40.4571405894');
});

// TODO: fix & reactivate
it.skip('takes the mean of two decibel values', () => {
  const actual = meanDecibel(3, 5);

  expect(actual.toFixed(10)).equal('4.1141260713');
});

// TODO: fix & reactivate
it.skip('takes the mean of three decibel values', () => {
  const actual = meanDecibel(3, 5, 8);

  expect(actual.toFixed(10)).equal('5.8233285337');
});
