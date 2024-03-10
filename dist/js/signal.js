// src/js/signal.ts
function computed(callback) {
  return new Computed(callback);
}
function effect(callback) {
  return new Effect(callback);
}
var getValue = function(instance) {
  const last = effects[effects.length - 1];
  if (last !== undefined) {
    instance._effects.add(last);
    last._values.add(instance);
  }
  return instance._value;
};
function isComputed(value) {
  return value instanceof Computed;
}
function isEffect(value) {
  return value instanceof Effect;
}
function isReactive(value) {
  return value instanceof Reactive;
}
function isSignal(value) {
  return value instanceof Signal;
}
var setValue = function(instance, value, run) {
  if (!run && Object.is(value, instance._value)) {
    return;
  }
  instance._value = value;
  cancelAnimationFrame(instance._frame);
  if (!instance._active) {
    return;
  }
  instance._frame = requestAnimationFrame(() => {
    for (const effect2 of instance._effects) {
      effect2._callback();
    }
    instance._frame = undefined;
  });
};
function signal(value) {
  return new Signal(value);
}

class Reactive {
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
    const index = effects.push(this) - 1;
    this._callback();
    effects.splice(index, 1);
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
