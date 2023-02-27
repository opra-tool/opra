import { expect } from '@esm-bundle/chai';
import { basePath } from '../src/paths';

it('returns base path of a short file path', () => {
  expect(basePath('/file.html')).to.equal('');
});

it('returns base path of a longer file path', () => {
  expect(basePath('/path/to/file.html')).to.equal('/path/to');
});
