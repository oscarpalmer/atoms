// src/js/queue.ts
function queue(callback) {
  _atomic_queued.add(callback);
  if (_atomic_queued.size > 0) {
    queueMicrotask(() => {
      const callbacks = Array.from(_atomic_queued);
      _atomic_queued.clear();
      for (const callback2 of callbacks) {
        callback2();
      }
    });
  }
}
if (globalThis._atomic_effects === undefined) {
  const queued = new Set;
  Object.defineProperty(globalThis, "_atomic_queued", {
    get() {
      return queued;
    }
  });
}

// src/js/signal.ts
function computed(callback) {
  return new Computed(callback);
}
function effect(callback) {
  return new Effect(callback);
}
var getValue = function(reactive) {
  const effect2 = _atomic_effects[_atomic_effects.length - 1];
  if (effect2 !== undefined) {
    reactive._effects.add(effect2);
    effect2._reactives.add(reactive);
  }
  return reactive._value;
};
function isComputed(value) {
  return isInstance(/^computed$/i, value);
}
function isEffect(value) {
  return isInstance(/^effect$/i, value);
}
var isInstance = function(expression, value) {
  return expression.test(value?.constructor?.name ?? "") && value.atomic === true;
};
function isReactive(value) {
  return isComputed(value) || isSignal(value);
}
function isSignal(value) {
  return isInstance(/^signal$/i, value);
}
var setValue = function(reactive, value, run) {
  if (!run && Object.is(value, reactive._value)) {
    return;
  }
  reactive._value = value;
  if (reactive._active) {
    for (const effect2 of reactive._effects) {
      queue(effect2._callback);
    }
  }
};
function signal(value) {
  return new Signal(value);
}
if (globalThis._atomic_effects === undefined) {
  const effects = [];
  Object.defineProperty(globalThis, "_atomic_effects", {
    get() {
      return effects;
    }
  });
}

class Atomic {
  constructor() {
    Object.defineProperty(this, "atomic", {
      value: true
    });
  }
}

class Reactive extends Atomic {
  constructor() {
    super(...arguments);
  }
  _active = true;
  _effects = new Set;
  peek() {
    return this._value;
  }
  toJSON() {
    return this.value;
  }
  toString() {
    return String(this.value);
  }
}

class Computed extends Reactive {
  _effect;
  get value() {
    return getValue(this);
  }
  constructor(callback) {
    super();
    this._effect = effect(() => setValue(this, callback(), false));
  }
  run() {
    this._effect.run();
  }
  stop() {
    this._effect.stop();
  }
}

class Effect extends Atomic {
  _callback;
  _active = false;
  _reactives = new Set;
  constructor(_callback) {
    super();
    this._callback = _callback;
    this.run();
  }
  run() {
    if (this._active) {
      return;
    }
    this._active = true;
    const index = _atomic_effects.push(this) - 1;
    this._callback();
    _atomic_effects.splice(index, 1);
  }
  stop() {
    if (!this._active) {
      return;
    }
    this._active = false;
    for (const value of this._reactives) {
      value._effects.delete(this);
    }
    this._reactives.clear();
  }
}

class Signal extends Reactive {
  _value;
  get value() {
    return getValue(this);
  }
  set value(value) {
    setValue(this, value, false);
  }
  constructor(_value) {
    super();
    this._value = _value;
  }
  run() {
    if (this._active) {
      return;
    }
    this._active = true;
    setValue(this, this._value, true);
  }
  stop() {
    this._active = false;
  }
}
export {
  signal,
  isSignal,
  isReactive,
  isEffect,
  isComputed,
  effect,
  computed
};
