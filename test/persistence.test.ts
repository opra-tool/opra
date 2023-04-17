import { expect } from '@esm-bundle/chai';
import { deleteDB } from 'idb';
import { ImpulseResponse } from '../src/analyzing/impulse-response';
import { Persistence } from '../src/persistence';

const RESPONSE: ImpulseResponse = {
  buffer: new AudioBuffer({
    length: 1,
    sampleRate: 44100,
  }),
  originalBuffer: undefined,
  color: '',
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
  const saved = await persistence.getResponses();

  expect(saved).to.deep.equal([RESPONSE]);
});

it('deletes a response', async () => {
  const persistence = new Persistence();
  await persistence.init();

  await persistence.saveResponse(RESPONSE);
  await persistence.deleteResponse(RESPONSE.id);
  const saved = await persistence.getResponses();

  expect(saved).to.be.empty;
});

it('updates a response', async () => {
  const persistence = new Persistence();
  await persistence.init();

  await persistence.saveResponse(RESPONSE);
  await persistence.saveResponse({
    ...RESPONSE,
    color: 'other',
  });
  const saved = await persistence.getResponses();

  expect(saved[0].color).to.equal('other');
});

async function clearAllIndexedDBs() {
  const dbs = await indexedDB.databases();

  await Promise.all(
    dbs.map(db =>
      db.name !== undefined ? deleteDB(db.name) : Promise.resolve()
    )
  );
}
