// src/js/emitter.ts
var createObserable = function(emitter, observers) {
  const instance = Object.create({
    subscribe(first, second, third) {
      return createSubscription(emitter, observers, getObserver(first, second, third));
    }
  });
  return instance;
};
var createSubscription = function(emitter, observers, observer) {
  let closed = false;
  const instance = Object.create({
    unsubscribe() {
      if (!closed) {
        closed = true;
        observers.delete(instance);
      }
    }
  });
  Object.defineProperty(instance, "closed", {
    get() {
      return closed || !emitter.active;
    }
  });
  observers.set(instance, observer);
  observer.next?.(emitter.value);
  return instance;
};
var getObserver = function(first, second, third) {
  let observer;
  if (typeof first === "object") {
    observer = first;
  } else {
    observer = {
      error: second,
      next: first,
      complete: third
    };
  }
  return observer;
};
function emitter(value) {
  let active = true;
  let stored = value;
  function finish(emit) {
    if (active) {
      active = false;
      for (const [subscription, observer] of observers) {
        if (emit) {
          observer.complete?.();
        }
        subscription.unsubscribe();
      }
    }
  }
  const observers = new Map;
  const instance = Object.create({
    destroy() {
      finish(false);
    },
    emit(value2) {
      if (active) {
        stored = value2;
        for (const [, observer] of observers) {
          observer.next?.(value2);
        }
      }
    },
    error(error) {
      if (active) {
        for (const [, observer] of observers) {
          observer.error?.(error);
        }
      }
    },
    finish() {
      finish(true);
    }
  });
  const observable = createObserable(instance, observers);
  Object.defineProperties(instance, {
    active: {
      get() {
        return active;
      }
    },
    observable: {
      get() {
        return observable;
      }
    },
    value: {
      get() {
        return stored;
      }
    }
  });
  return instance;
}
export {
  emitter
};
