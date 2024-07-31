// src/js/function.ts
function noop() {
}

// src/js/emitter.ts
var getObserver = function(first, second, third) {
  let observer = {
    next: noop
  };
  if (typeof first === "object") {
    observer = first !== null && properties.every((property) => {
      const value = first[property];
      return value == null || typeof value === "function";
    }) ? first : observer;
  } else if (typeof first === "function") {
    observer = {
      error: typeof second === "function" ? second : noop,
      next: first,
      complete: typeof third === "function" ? third : undefined
    };
  }
  return observer;
};
function emitter(value) {
  return new Emitter(value);
}
var finishEmitter = function(state, emit) {
  if (state.active) {
    state.active = false;
    for (const [subscription, observer] of state.observers) {
      if (emit) {
        observer.complete?.();
      }
      subscription.unsubscribe();
    }
  }
};

class Emitter {
  get active() {
    return this.state.active;
  }
  get observable() {
    return this.state.observable;
  }
  get value() {
    return this.state.value;
  }
  constructor(value) {
    const observers = new Map;
    this.state = {
      observers,
      value,
      active: true,
      observable: new Observable(this, observers)
    };
  }
  destroy() {
    finishEmitter(this.state, false);
  }
  emit(value, finish) {
    if (this.state.active) {
      this.state.value = value;
      for (const [, observer] of this.state.observers) {
        observer.next?.(value);
      }
      if (finish === true) {
        finishEmitter(this.state, true);
      }
    }
  }
  error(error, finish) {
    if (this.state.active) {
      for (const [, observer] of this.state.observers) {
        observer.error?.(error);
      }
      if (finish === true) {
        finishEmitter(this.state, true);
      }
    }
  }
  finish() {
    finishEmitter(this.state, true);
  }
}

class Observable {
  constructor(emitter2, observers) {
    this.state = {
      emitter: emitter2,
      observers
    };
  }
  subscribe(first, second, third) {
    const observer = getObserver(first, second, third);
    const instance = new Subscription(this.state);
    this.state.observers.set(instance, observer);
    observer.next?.(this.state.emitter.value);
    return instance;
  }
}

class Subscription {
  constructor(state) {
    this.state = {
      ...state,
      closed: false
    };
  }
  get closed() {
    return this.state.closed || !this.state.emitter.active;
  }
  unsubscribe() {
    if (!this.state.closed) {
      this.state.closed = true;
      this.state.observers.delete(this);
    }
  }
}
var properties = ["complete", "error", "next"];
export {
  emitter
};
