export class EventEmitter<TEventMap extends Record<string, any>> {
  listeners: {
    [K in keyof TEventMap]?: ((ev: TEventMap[K]) => void)[];
  } = {};

  addEventListener<K extends keyof TEventMap>(
    type: K,
    listener: (ev: TEventMap[K]) => void
  ) {
    if (this.listeners[type] === undefined) {
      this.listeners[type] = [listener];
    } else {
      this.listeners[type]?.push(listener);
    }
  }

  removeEventListener<K extends keyof TEventMap>(
    type: K,
    listener: (ev: TEventMap[K]) => void
  ) {
    this.listeners[type] = this.listeners[type]?.filter(l => l !== listener);
  }

  dispatchEvent<K extends keyof TEventMap>(type: K, payload: TEventMap[K]) {
    this.listeners[type]?.forEach(l => l(payload));
  }
}
