import { expect } from '@esm-bundle/chai';
import { EventEmitter } from '../src/event-emitter';

class TestEmitter extends EventEmitter<{
  test: undefined;
}> {
  triggerDispatch() {
    this.dispatchEvent('test', undefined);
  }
}

it('adds an event listener and calls that listener', () => {
  const emitter = new TestEmitter();
  let called = false;

  emitter.addEventListener('test', () => {
    called = true;
  });

  emitter.triggerDispatch();

  expect(called).to.equal(true);
});

it('removes an event listener and does not call that listener', () => {
  const emitter = new TestEmitter();
  let calls = 0;

  const listener = () => {
    calls += 1;
  };

  emitter.addEventListener('test', listener);
  emitter.triggerDispatch();

  emitter.removeEventListener('test', listener);
  emitter.triggerDispatch();

  expect(calls).to.equal(1);
});
