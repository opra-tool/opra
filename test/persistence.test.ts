import { expect } from '@esm-bundle/chai';
import { deleteDB } from 'idb';
import { ImpulseResponseFile } from '../src/transfer-objects/impulse-response-file';
import { Persistence } from '../src/persistence';

const RESPONSE: ImpulseResponseFile = {
  buffer: new AudioBuffer({
    length: 1,
    sampleRate: 44100,
  }),
  duration: 0,
  fileName: '',
  id: 'id',
  sampleRate: 44100,
  type: 'monaural',
};

beforeEach(clearAllIndexedDBs);

it('saves a response', async () => {
  const persistence = new Persistence();
  await persistence.init();

  await persistence.saveResponse(RESPONSE);
  const saved = await persistence.getFiles();

  expect(saved).to.deep.equal([RESPONSE]);
});

it('deletes a response', async () => {
  const persistence = new Persistence();
  await persistence.init();

  await persistence.saveResponse(RESPONSE);
  await persistence.deleteResponse(RESPONSE.id);
  const saved = await persistence.getFiles();

  expect(saved).to.be.empty;
});

it('updates a response', async () => {
  const persistence = new Persistence();
  await persistence.init();

  await persistence.saveResponse(RESPONSE);
  await persistence.saveResponse({
    ...RESPONSE,
    type: 'binaural',
  });
  const saved = await persistence.getFiles();

  expect(saved[0].type).to.equal('binaural');
});

async function clearAllIndexedDBs() {
  const dbs = await indexedDB.databases();

  await Promise.all(
    dbs.map(db =>
      db.name !== undefined ? deleteDB(db.name) : Promise.resolve()
    )
  );
}
