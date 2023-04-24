import { expect } from '@esm-bundle/chai';
import { ImpulseResponse } from '../src/analyzing/impulse-response';
import { convertBetweenBinauralAndMidSide } from '../src/conversion';
import { expectArraysApproximatelyEqual } from './arrays-approx-equality';

it('throws when attempting to convert a monaural impulse response', () => {
  const response: ImpulseResponse = {
    id: 'any id',
    duration: 1,
    fileName: 'any filename',
    sampleRate: 44100,
    type: 'monaural',
    buffer: makeAudioBuffer(),
  };

  expect(() => convertBetweenBinauralAndMidSide(response)).to.throw();
});

it('throws when attempting to convert a mid-side response without original buffer', () => {
  const response: ImpulseResponse = {
    id: 'any id',
    duration: 1,
    fileName: 'any filename',
    sampleRate: 44100,
    type: 'mid-side',
    buffer: makeAudioBuffer(),
  };

  expect(() => convertBetweenBinauralAndMidSide(response)).to.throw();
});

it('preserves metadata while converting', () => {
  const buffer = makeAudioBuffer();
  const converted = convertBetweenBinauralAndMidSide({
    id: 'any id',
    duration: 1,
    fileName: 'any filename',
    sampleRate: 44100,
    type: 'binaural',
    buffer,
  });

  expect(converted.id).to.equal('any id');
  expect(converted.duration).to.equal(1);
  expect(converted.fileName).to.equal('any filename');
  expect(converted.sampleRate).to.equal(44100);

  expect(converted.buffer.length).to.equal(2);
  expect(converted.buffer.numberOfChannels).to.equal(2);
  expect(converted.buffer.sampleRate).to.equal(44100);
});

it('converts binaural response to mid/side response', () => {
  const buffer = makeAudioBuffer();
  const converted = convertBetweenBinauralAndMidSide({
    id: 'any id',
    duration: 1,
    fileName: 'any filename',
    sampleRate: 44100,
    type: 'binaural',
    buffer,
  });

  expect(converted.type).to.equal('mid-side');
  expect(converted.originalBuffer).to.equal(buffer);

  expectArraysApproximatelyEqual(
    converted.buffer.getChannelData(0),
    new Float32Array([0.7 / Math.SQRT2, 1.0 / Math.SQRT2]),
    0.001
  );
  expectArraysApproximatelyEqual(
    converted.buffer.getChannelData(1),
    new Float32Array([-0.1 / Math.SQRT2, -0.6 / Math.SQRT2]),
    0.001
  );
});

it('undoes a conversion', () => {
  const originalBuffer = makeAudioBuffer();
  const converted = convertBetweenBinauralAndMidSide({
    id: 'any id',
    duration: 1,
    fileName: 'any filename',
    sampleRate: 44100,
    type: 'mid-side',
    buffer: makeAudioBuffer(),
    originalBuffer,
  });

  expect(converted.type).to.equal('binaural');
  expect(converted.buffer).to.equal(originalBuffer);
  expect(converted.originalBuffer).to.equal(undefined);
});

function makeAudioBuffer(): AudioBuffer {
  const buffer = new AudioBuffer({
    length: 2,
    sampleRate: 44100,
    numberOfChannels: 2,
  });
  buffer.copyToChannel(new Float32Array([0.3, 0.2]), 0);
  buffer.copyToChannel(new Float32Array([0.4, 0.8]), 1);

  return buffer;
}
