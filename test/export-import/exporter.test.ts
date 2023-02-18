import { expect } from '@esm-bundle/chai';
import { Exporter } from '../../src/export-import/exporter';

it('it generates a monaural export', async () => {
  const exporter = new Exporter({
    getResponses() {
      return [
        {
          id: 'testId',
          type: 'monaural',
          buffer: new AudioBuffer({
            length: 1,
            sampleRate: 44100,
            numberOfChannels: 1,
          }),
          color: '',
          duration: 100,
          fileName: 'audio.wav',
          sampleRate: 44100,
        },
      ];
    },
    getResultsOrThrow(responseId: string) {
      if (responseId !== 'testId') {
        throw new Error();
      }

      return {
        bandsSquaredSum: [1, 2, 3, 4, 5, 6, 7, 8],
        e80BandsSquaredSum: [1, 2, 3, 4, 5, 6, 7, 8],
        l80BandsSquaredSum: [1, 2, 3, 4, 5, 6, 7, 8],
        c50Bands: [1, 2, 3, 4, 5, 6, 7, 8],
        c80Bands: [1, 2, 3, 4, 5, 6, 7, 8],
        edtBands: [1, 2, 3, 4, 5, 6, 7, 8],
        reverbTimeBands: [1, 2, 3, 4, 5, 6, 7, 8],
        bassRatio: 1,
        centreTime: 2,
        squaredIRPoints: [{ x: 1, y: 2 }],
      };
    },
  });

  const expected = await fetch('/testfiles/exports/monaural-export.json').then(
    r => r.text()
  );
  const actual = exporter.generateExportFile();

  expect(actual).to.equal(expected);
});
