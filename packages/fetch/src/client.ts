import mitt from 'mitt';
import { IClientState } from './types';

export class Node<T = unknown> {
  public readonly e = mitt<{ done: undefined }>();
  public value: T = undefined;
  public promise: Promise<T> = undefined;
  public status: 0 | 1 | 2 = 0;
  public success = false;
  public error: any = undefined;
  public timestamp = Date.now();
  public type: 'server' | 'client' = 'server';
  private callback: () => Promise<T> = undefined;

  public read(callback: () => Promise<T>) {
    if (this.status === 2) return this;
    if (this.promise) {
      if (this.type === 'server') throw this.promise;
      this.callback = callback;
      return this;
    }
    this.status = 1;
    this.promise = callback();
    this.promise.then((data) => {
      this.value = data;
      this.success = true;
      this.error = undefined;
    }).catch(e => {
      this.error = e;
      this.success = false;
      this.value = undefined;
    }).finally(() => {
      this.promise = undefined;
      this.status = 2;
      this.timestamp = Date.now();
      this.callback = callback;
      this.e.emit('done');
    })
    if (this.type === 'server') throw this.promise;
    this.callback = callback;
    return this;
  }

  public reset() {
    this.status = 0;
  }

  public reload() {
    if (this.callback) {
      this.reset();
      this.read(this.callback);
    }
  }
}

export class Client extends Map<string, Node> {
  public add<T>(key: string) {
    if (this.has(key)) return this.get(key) as Node<T>;
    const node = new Node<T>();
    this.set(key, node);
    return node;
  }

  public initialize(state: Record<string, IClientState>) {
    for (const key in state) {
      const node = this.add(key);
      node.value = state[key].d;
      node.status = 2;
      node.success = state[key].s;
      if (state[key].e) {
        node.error = new Error(state[key].e);
        node.error.code = state[key].c;
      }
    }
  }

  public toJSON() {
    const state: Record<string, IClientState> = {};
    for (const [key, node] of this.entries()) {
      state[key] = {
        s: node.success,
      }
      if (node.success) {
        state[key].d = node.value;
      } else {
        state[key].e = node.error?.message;
        state[key].c = node.error?.code;
      }
    }
    return state;
  }

  public reload(...codes: string[]) {
    let i = codes.length;
    while (i--) {
      const code = codes[i];
      if (this.has(code)) {
        const chunk = this.get(code);
        chunk.reload();
      }
    }
  }
}