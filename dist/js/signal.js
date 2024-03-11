// src/js/queue.ts
function queue(callback) {
  queued.add(callback);
  if (queued.size > 0) {
    queueMicrotask(() => {
      const callbacks = Array.from(queued);
      queued.clear();
      for (const callback2 of callbacks) {
        callback2();
      }
    });
  }
}
var queued = new Set;

// src/js/signal.ts
function computed(callback) {
  return new Computed(callback);
}
function effect(callback) {
  return new Effect(callback);
}
var getValue = function(reactive) {
  const effect2 = effects[effects.length - 1];
  if (effect2 !== undefined) {
    reactive._effects.add(effect2);
    effect2._reactives.add(reactive);
  }
  return reactive._value;
};
function isComputed(value) {
  return value instanceof Computed;
}
function isEffect(value) {
  return value instanceof Effect;
}
function isReactive(value) {
  return value instanceof Computed || value instanceof Signal;
}
function isSignal(value) {
  return value instanceof Signal;
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

class Reactive {
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

class Effect {
  _callback;
  _active = false;
  _reactives = new Set;
  constructor(_callback) {
    this._callback = _callback;
    this.run();
  }
  run() {
    if (this._active) {
      return;
    }
    this._active = true;
    const index = effects.push(this) - 1;
    this._callback();
    effects.splice(index, 1);
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
var effects = [];
export {
  signal,
  isSignal,
  isReactive,
  isEffect,
  isComputed,
  effect,
  computed
};
