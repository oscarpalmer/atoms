// src/js/signal.ts
var _getter = function(instance) {
  const last = running[running.length - 1];
  if (last !== undefined) {
    let instanceEffects = effects.get(instance);
    if (instanceEffects === undefined) {
      instanceEffects = new Set;
      effects.set(instance, instanceEffects);
    }
    instanceEffects.add(last);
  }
  return values.get(instance);
};
var _setter = function(instance, value) {
  if (Object.is(value, values.get(instance))) {
    return;
  }
  values.set(instance, value);
  cancelAnimationFrame(frames.get(instance));
  frames.set(instance, requestAnimationFrame(() => {
    const instanceEffects = effects.get(instance) ?? new Set;
    for (const effect of instanceEffects) {
      effect();
    }
    frames.delete(instance);
  }));
};
function computed(callback) {
  return new Computed(callback);
}
function effect(callback) {
  running.push(callback);
  callback();
  running.splice(running.indexOf(callback), 1);
}
function signal(value) {
  return new Signal(value);
}

class Computed {
  get value() {
    return _getter(this);
  }
  constructor(callback) {
    effect(() => {
      _setter(this, callback());
    });
  }
}

class Signal {
  get value() {
    return _getter(this);
  }
  set value(value) {
    _setter(this, value);
  }
  constructor(value) {
    this.value = value;
  }
}
var effects = new WeakMap;
var frames = new WeakMap;
var running = [];
var values = new WeakMap;
export {
  signal,
  effect,
  computed
};
