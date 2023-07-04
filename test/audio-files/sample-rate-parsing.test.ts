import { expect } from '@esm-bundle/chai';
import { parseSampleRate } from '../../src/audio-files/sample-rate-parsing';

it('parses wav sample rate', async () => {
  const buffer = await fetch('/testfiles/binaural_RNo01_R1_BRIR_000.wav').then(
    r => r.arrayBuffer()
  );

  const sampleRate = parseSampleRate('audio/wav', buffer);

  expect(sampleRate).to.equal(44100);
});

it('parses flac sample rate', async () => {
  const buffer = await fetch('/testfiles/binaural_RNo01_R1_BRIR_000.flac').then(
    r => r.arrayBuffer()
  );

  const sampleRate = parseSampleRate('audio/flac', buffer);

  expect(sampleRate).to.equal(44100);
});

it('parses opus sample rate', async () => {
  const buffer = await fetch('/testfiles/binaural_RNo01_R1_BRIR_000.opus').then(
    r => r.arrayBuffer()
  );

  const sampleRate = parseSampleRate('audio/ogg', buffer);

  expect(sampleRate).to.equal(48000);
});
