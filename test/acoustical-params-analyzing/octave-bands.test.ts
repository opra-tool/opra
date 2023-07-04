import { expect } from '@esm-bundle/chai';
import {
  CENTER_FREQUENCIES,
  OctaveBandValues,
  OctaveBands,
} from '../../src/transfer-objects/octave-bands';
import { CustomAudioBuffer } from '../../src/transfer-objects/audio-buffer';

it('throws on invalid octave band values length', () => {
  expect(() => new OctaveBandValues([1, 2, 3, 4])).to.throw();
});

it('creates octave band values', () => {
  const octaveBandValues = new OctaveBandValues([1, 2, 3, 4, 5, 6, 7, 8]);

  expect(octaveBandValues.band(500)).to.equal(4);
  expect(octaveBandValues.band(8000)).to.equal(8);
});

it('combines octave band values', () => {
  const octaveBandValues = new OctaveBandValues([1, 2, 3, 4, 5, 6, 7, 8]);
  const other = new OctaveBandValues([1, 2, 3, 4, 5, 6, 7, 8]);

  const result = octaveBandValues.combine(other, (a, b) => a + b);

  expect(result.band(500)).to.equal(8);
  expect(result.band(8000)).to.equal(16);
});

it('transforms octave band values', () => {
  const octaveBandValues = new OctaveBandValues([1, 2, 3, 4, 5, 6, 7, 8]);

  const transformed = octaveBandValues.transform(value => value + 1);

  expect(transformed.band(500)).to.equal(5);
  expect(transformed.band(8000)).to.equal(9);
});

it('throws on invalid octave bands length', () => {
  const buffers = new Array(4).map(
    () => new CustomAudioBuffer(new Float32Array(), 48_000)
  );

  expect(() => new OctaveBands(buffers)).to.throw();
});

it('creates octave bands', () => {
  const buffers = CENTER_FREQUENCIES.map(
    f => new CustomAudioBuffer(new Float32Array([f]), 48_000)
  );
  const bands = new OctaveBands(buffers);

  expect(bands.band(500).getChannel(0)[0]).to.equal(500);
  expect(bands.band(8000).getChannel(0)[0]).to.equal(8000);
});

it('collects octave bands', () => {
  const buffers = CENTER_FREQUENCIES.map(
    f => new CustomAudioBuffer(new Float32Array([f]), 48_000)
  );
  const bands = new OctaveBands(buffers);

  const transformed = bands.collect(value => value.sum() + 1);

  expect(transformed.band(500)).to.equal(501);
  expect(transformed.band(8000)).to.equal(8001);
});

it('it is possible to iterate over octave bands', () => {
  const buffers = CENTER_FREQUENCIES.map(
    f => new CustomAudioBuffer(new Float32Array([f]), 48_000)
  );
  const bands = new OctaveBands(buffers);

  let counter = 0;
  for (const _ of bands) {
    counter += 1;
  }

  expect(counter).to.equal(bands.numberOfBands);
});
