// src/js/signal.ts
var _getter = function(instance) {
  const last = running[running.length - 1];
  if (last !== undefined) {
    instance._effects.add(last);
    last._values.add(instance);
  }
  return instance._value;
};
var _setter = function(instance, value, run) {
  if (!run && Object.is(value, instance._value)) {
    return;
  }
  instance._value = value;
  cancelAnimationFrame(instance._frame);
  if (!instance._active) {
    return;
  }
  instance._frame = requestAnimationFrame(() => {
    for (const effect of instance._effects) {
      effect._callback();
    }
    instance._frame = undefined;
  });
};
function computed(callback) {
  return new Computed(callback);
}
function effect(callback) {
  return new Effect(callback);
}
function isComputed(value) {
  return value instanceof Computed;
}
function isEffect(value) {
  return value instanceof Effect;
}
function isSignal(value) {
  return value instanceof Signal;
}
function signal(value) {
  return new Signal(value);
}

class Value {
  _active = true;
  _effects = new Set;
  _frame;
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

class Computed extends Value {
  _effect;
  get value() {
    return _getter(this);
  }
  constructor(callback) {
    super();
    this._effect = effect(() => {
      _setter(this, callback(), false);
    });
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
  _values = new Set;
  constructor(_callback) {
    this._callback = _callback;
    this.run();
  }
  run() {
    if (this._active) {
      return;
    }
    this._active = true;
    const index = running.push(this) - 1;
    this._callback();
    running.splice(index, 1);
  }
  stop() {
    if (!this._active) {
      return;
    }
    this._active = false;
    for (const value of this._values) {
      value._effects.delete(this);
    }
    this._values.clear();
  }
}

class Signal extends Value {
  _value;
  get value() {
    return _getter(this);
  }
  set value(value) {
    _setter(this, value, false);
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
    _setter(this, this._value, true);
  }
  stop() {
    this._active = false;
  }
}
var running = [];
export {
  signal,
  isSignal,
  isEffect,
  isComputed,
  effect,
  computed
};
