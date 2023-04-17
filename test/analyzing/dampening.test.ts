import { expect } from '@esm-bundle/chai';
import { calculateSoundDampingInAir } from '../../src/analyzing/dampening';
import { expectArraysApproximatelyEqual } from '../arrays-approx-equality';

it('fails for frequencies < 50Hz and > 10kHz', () => {
  const anyTemperature = 1;
  const anyHumidity = 10;

  expect(() =>
    calculateSoundDampingInAir(anyTemperature, anyHumidity, 49)
  ).throw();
  expect(() =>
    calculateSoundDampingInAir(anyTemperature, anyHumidity, 10001)
  ).throw();
});

it('fails for humidity < 10% and > 100%', () => {
  const anyTemperature = 10;
  const anyFrequency = 50;

  expect(() =>
    calculateSoundDampingInAir(anyTemperature, 9, anyFrequency)
  ).throw();
  expect(() =>
    calculateSoundDampingInAir(anyTemperature, 101, anyFrequency)
  ).throw();
});

it('fails for temperature < -20°C and > +50°C', () => {
  const anyHumidity = 10;
  const anyFrequency = 50;

  expect(() =>
    calculateSoundDampingInAir(-21, anyHumidity, anyFrequency)
  ).throw();
  expect(() =>
    calculateSoundDampingInAir(51, anyHumidity, anyFrequency)
  ).throw();
});

it('calculates sound dampening', () => {
  const inputs = [
    {
      temperature: 20,
      humidity: 50,
      frequency: 100,
    },
    {
      temperature: 20,
      humidity: 50,
      frequency: 4000,
    },
    {
      temperature: 20,
      humidity: 50,
      frequency: 8000,
    },
  ];

  const expected = [0, 0.03, 0.105];

  const actual = inputs.map(({ temperature, humidity, frequency }) =>
    calculateSoundDampingInAir(temperature, humidity, frequency)
  );

  expectArraysApproximatelyEqual(actual, expected, 0.01);
});
