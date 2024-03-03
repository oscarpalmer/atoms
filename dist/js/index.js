// src/js/array.ts
var _getCallbacks = function(bool, key) {
  if (typeof bool === "function") {
    return { bool };
  }
  if (typeof key === "function") {
    return { key };
  }
  const isString = typeof key === "string";
  if (!isString && typeof key !== "number" || isString && key.includes(".")) {
    return;
  }
  return {
    key: (item) => item?.[key]
  };
};
var _findValue = function(type, array, value, key) {
  const callbacks = _getCallbacks(value, key);
  if (callbacks?.bool === undefined && callbacks?.key === undefined) {
    return type === "index" ? array.indexOf(value) : array.find((item) => item === value);
  }
  if (callbacks.bool !== undefined) {
    const index2 = array.findIndex(callbacks.bool);
    return type === "index" ? index2 : index2 > -1 ? array[index2] : undefined;
  }
  const { length } = array;
  let index = 0;
  for (;index < length; index += 1) {
    const item = array[index];
    if (callbacks.key?.(item) === value) {
      return type === "index" ? index : item;
    }
  }
  return type === "index" ? -1 : undefined;
};
var _findValues = function(type, array, value, key) {
  const callbacks = _getCallbacks(value, key);
  const { length } = array;
  if (type === "unique" && callbacks?.key === undefined && length >= 100) {
    return Array.from(new Set(array));
  }
  if (typeof callbacks?.bool === "function") {
    return array.filter(callbacks.bool);
  }
  if (type === "all" && key === undefined) {
    return array.filter((item) => item === value);
  }
  const hasCallback = typeof callbacks?.key === "function";
  const result = [];
  const values = hasCallback ? [] : result;
  let index = 0;
  for (;index < length; index += 1) {
    const item = array[index];
    const itemValue = hasCallback ? callbacks.key?.(item) : item;
    if (type === "all" && itemValue === value || type === "unique" && values.indexOf(itemValue) === -1) {
      if (values !== result) {
        values.push(itemValue);
      }
      result.push(item);
    }
  }
  return result;
};
var _insertValues = function(type, array, values, start, deleteCount) {
  const chunked = chunk(values).reverse();
  const { length } = chunked;
  let index = 0;
  let returned;
  for (;index < length; index += 1) {
    const result = array.splice(start, index === 0 ? deleteCount : 0, ...chunked[index]);
    if (returned === undefined) {
      returned = result;
    }
  }
  return type === "splice" ? returned : array.length;
};
function chunk(array, size) {
  const { length } = array;
  const chunkSize = typeof size === "number" && size > 0 ? size : 32000;
  if (length <= chunkSize) {
    return [array];
  }
  const chunks = [];
  let remaining = Number(length);
  while (remaining > 0) {
    chunks.push(array.splice(0, chunkSize));
    remaining -= chunkSize;
  }
  return chunks;
}
function exists(array, value, key) {
  return _findValue("index", array, value, key) > -1;
}
function filter(array, value, key) {
  return _findValues("all", array, value, key);
}
function find(array, value, key) {
  return _findValue("value", array, value, key);
}
function groupBy(array, key) {
  const callbacks = _getCallbacks(undefined, key);
  if (callbacks?.key === undefined) {
    return {};
  }
  const grouped = {};
  const { length } = array;
  let index = 0;
  for (;index < length; index += 1) {
    const item = array[index];
    const value = callbacks.key(item);
    if (value in grouped) {
      grouped[value].push(item);
    } else {
      grouped[value] = [item];
    }
  }
  return grouped;
}
function indexOf(array, value, key) {
  return _findValue("index", array, value, key);
}
function insert(array, index, values) {
  _insertValues("splice", array, values, index, 0);
}
function push(array, values) {
  return _insertValues("push", array, values, array.length, 0);
}
function splice(array, start, deleteCount, values) {
  return _insertValues("splice", array, values, start, deleteCount);
}
function unique(array, key) {
  return _findValues("unique", array, undefined, key);
}
// src/js/element/index.ts
var _findElements = function(selector, context, single) {
  const callback = single ? document.querySelector : document.querySelectorAll;
  const contexts = context == null ? [document] : _findElements(context, undefined, false);
  const result = [];
  if (typeof selector === "string") {
    const { length: length2 } = contexts;
    let index2 = 0;
    for (;index2 < length2; index2 += 1) {
      const value = callback.call(contexts[index2], selector);
      if (single && value != null) {
        return value;
      }
      if (!single) {
        result.push(...Array.from(value));
      }
    }
    return single ? undefined : result.filter((value, index3, array) => array.indexOf(value) === index3);
  }
  const nodes = Array.isArray(selector) || selector instanceof NodeList ? selector : [selector];
  const { length } = nodes;
  let index = 0;
  for (;index < length; index += 1) {
    const node = nodes[index];
    const element = node instanceof Document ? node.body : node instanceof Element ? node : undefined;
    if (element == null) {
      continue;
    }
    if (context == null || contexts.some((context2) => context2.contains(node))) {
      if (single) {
        return element;
      }
      result.push(element);
    }
  }
  return single ? undefined : result.filter((value, index2, array) => array.indexOf(value) === index2);
};
function findElement(selector, context) {
  return _findElements(selector, context, true);
}
function findElements(selector, context) {
  return _findElements(selector, context, false);
}
function findParentElement(origin, selector) {
  if (origin == null || selector == null) {
    return;
  }
  function matches(element) {
    return typeof selector === "string" ? element.matches?.(selector) ?? false : typeof selector === "function" ? selector(element) : false;
  }
  if (matches(origin)) {
    return origin;
  }
  let parent = origin.parentElement;
  while (parent != null && !matches(parent)) {
    if (parent === document.body) {
      return;
    }
    parent = parent.parentElement;
  }
  return parent ?? undefined;
}
function getElementUnderPointer(skipIgnore) {
  const elements = Array.from(document.querySelectorAll(":hover")).filter((element) => {
    if (/^head$/i.test(element.tagName)) {
      return false;
    }
    const style = getComputedStyle(element);
    return typeof skipIgnore === "boolean" && skipIgnore || style.pointerEvents !== "none" && style.visibility !== "hidden";
  });
  return elements[elements.length - 1];
}
function getTextDirection(element) {
  const direction = element.getAttribute("dir");
  if (direction !== null && /^(ltr|rtl)$/i.test(direction)) {
    return direction.toLowerCase();
  }
  return getComputedStyle?.(element)?.direction === "rtl" ? "rtl" : "ltr";
}
// src/js/event.ts
function getPosition(event) {
  let x;
  let y;
  if (event instanceof MouseEvent) {
    x = event.clientX;
    y = event.clientY;
  } else if (event instanceof TouchEvent) {
    x = event.touches[0]?.clientX;
    y = event.touches[0]?.clientY;
  }
  return typeof x === "number" && typeof y === "number" ? { x, y } : undefined;
}
// src/js/number.ts
function between(value, min, max) {
  return [max, min, value].every((v) => typeof v === "number") && value >= min && value <= max;
}
function clamp(value, min, max, loop) {
  if ([max, min, value].some((v) => typeof v !== "number")) {
    return NaN;
  }
  const shouldLoop = loop === true;
  if (value < min) {
    return shouldLoop ? max : min;
  }
  return value > max ? shouldLoop ? min : max : value;
}
function getNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "symbol") {
    return NaN;
  }
  let parsed = value?.valueOf?.() ?? value;
  if (typeof parsed === "object") {
    parsed = parsed?.toString() ?? parsed;
  }
  if (typeof parsed !== "string") {
    return parsed == null ? NaN : typeof parsed === "number" ? parsed : +parsed;
  }
  if (/^\s*0+\s*$/.test(parsed)) {
    return 0;
  }
  const trimmed = parsed.trim();
  if (trimmed.length === 0) {
    return NaN;
  }
  const isBinary = /^0b[01]+$/i.test(trimmed);
  if (isBinary || /^0o[0-7]+$/i.test(trimmed)) {
    return parseInt(trimmed.slice(2), isBinary ? 2 : 8);
  }
  return +(/^0x[0-9a-f]+$/i.test(trimmed) ? trimmed : trimmed.replace(/_/g, ""));
}
// src/js/string.ts
function createUuid() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (substring) => (substring ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> substring / 4).toString(16));
}
function getString(value) {
  if (typeof value === "string") {
    return value;
  }
  const result = value?.toString?.() ?? value;
  return result?.toString?.() ?? String(result);
}

// src/js/is.ts
function isArrayOrPlainObject(value) {
  return Array.isArray(value) || isPlainObject(value);
}
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}

// src/js/value.ts
var _getDiffs = function(first, second, prefix) {
  const changes = [];
  const checked = new Set;
  let outer = 0;
  for (;outer < 2; outer += 1) {
    const value = outer === 0 ? first : second;
    if (!value) {
      continue;
    }
    const keys = Object.keys(value);
    const { length } = keys;
    let inner = 0;
    for (;inner < length; inner += 1) {
      const key = keys[inner];
      if (checked.has(key)) {
        continue;
      }
      const from = first?.[key];
      const to = second?.[key];
      if (!Object.is(from, to)) {
        const prefixed = _getKey(prefix, key);
        const change = {
          from,
          to,
          key: prefixed
        };
        const nested = isArrayOrPlainObject(from) || isArrayOrPlainObject(to);
        const diffs = nested ? _getDiffs(from, to, prefixed) : [];
        if (!nested || nested && diffs.length > 0) {
          changes.push(change);
        }
        changes.push(...diffs);
      }
      checked.add(key);
    }
  }
  return changes;
};
var _getKey = function(...parts) {
  return parts.filter((part) => part !== undefined).join(".");
};
var _getValue = function(data, key) {
  if (typeof data !== "object" || data === null || /^(__proto__|constructor|prototype)$/i.test(key)) {
    return;
  }
  return data instanceof Map ? data.get(key) : data[key];
};
var _setValue = function(data, key, value) {
  if (typeof data !== "object" || data === null || /^(__proto__|constructor|prototype)$/i.test(key)) {
    return;
  }
  if (data instanceof Map) {
    data.set(key, value);
  } else {
    data[key] = value;
  }
};
function clone(value) {
  return structuredClone(value);
}
function diff(first, second) {
  const result = {
    original: {
      from: first,
      to: second
    },
    type: "partial",
    values: {}
  };
  const same = Object.is(first, second);
  const firstIsArrayOrObject = isArrayOrPlainObject(first);
  const secondIsArrayOrObject = isArrayOrPlainObject(second);
  if (same || !firstIsArrayOrObject && !secondIsArrayOrObject) {
    result.type = same ? "none" : "full";
    return result;
  }
  if (firstIsArrayOrObject !== secondIsArrayOrObject) {
    result.type = "full";
  }
  const diffs = _getDiffs(first, second);
  const { length } = diffs;
  if (length === 0) {
    result.type = "none";
  }
  let index = 0;
  for (;index < length; index += 1) {
    const diff2 = diffs[index];
    result.values[diff2.key] = { from: diff2.from, to: diff2.to };
  }
  return result;
}
function get(data, key) {
  const parts = getString(key).split(".");
  const { length } = parts;
  let index = 0;
  let value = typeof data === "object" ? data ?? {} : {};
  for (;index < length; index += 1) {
    value = _getValue(value, parts[index]);
    if (value == null) {
      return;
    }
  }
  return value;
}
function merge(...values) {
  if (values.length === 0) {
    return {};
  }
  const actual = values.filter((value) => isArrayOrPlainObject(value));
  const result = actual.every(Array.isArray) ? [] : {};
  const { length } = actual;
  let itemIndex = 0;
  for (;itemIndex < length; itemIndex += 1) {
    const item = actual[itemIndex];
    const keys = Object.keys(item);
    const size = keys.length;
    let keyIndex = 0;
    for (;keyIndex < size; keyIndex += 1) {
      const key = keys[keyIndex];
      const next = item[key];
      const previous = result[key];
      if (isArrayOrPlainObject(next)) {
        result[key] = isArrayOrPlainObject(previous) ? merge(previous, next) : merge(next);
      } else {
        result[key] = next;
      }
    }
  }
  return result;
}
function set(data, key, value) {
  const parts = getString(key).split(".");
  const { length } = parts;
  const lastIndex = length - 1;
  let index = 0;
  let target = typeof data === "object" ? data ?? {} : {};
  for (;index < length; index += 1) {
    const part = parts[index];
    if (parts.indexOf(part) === lastIndex) {
      _setValue(target, part, value);
      break;
    }
    let next = _getValue(target, part);
    if (typeof next !== "object" || next === null) {
      next = /^\d+$/.test(part) ? [] : {};
      target[part] = next;
    }
    target = next;
  }
  return data;
}

// src/js/proxy.ts
var _createProxy = function(existing, value2) {
  if (!isArrayOrPlainObject(value2) || _isProxy(value2) && value2.$ === existing) {
    return value2;
  }
  const isArray = Array.isArray(value2);
  const proxy = new Proxy(isArray ? [] : {}, {
    get(target, property) {
      return property === "$" ? manager : Reflect.get(target, property);
    },
    set(target, property, value3) {
      if (property === "$") {
        return true;
      }
      const isSubscribed = manager.subscribed;
      const original = isSubscribed && !cloned.has(manager) ? clone(merge(manager.owner)) : undefined;
      const actual = _createProxy(manager, value3);
      const result = Reflect.set(target, property, actual);
      if (result && isSubscribed) {
        _onChange(manager, original);
      }
      return result;
    }
  });
  const manager = existing ?? new Manager(proxy);
  Object.defineProperty(proxy, "$", {
    value: manager
  });
  const keys = Object.keys(value2);
  const { length } = keys;
  let index = 0;
  for (;index < length; index += 1) {
    const key = keys[index];
    proxy[key] = value2[key];
  }
  return proxy;
};
var _emit = function(manager) {
  const difference = diff(cloned.get(manager) ?? {}, clone(merge(manager.owner)));
  const keys = Object.keys(difference.values);
  const { length } = keys;
  let index = 0;
  for (;index < length; index += 1) {
    const key = keys[index];
    const subscribers = manager.subscribers.get(key);
    if (subscribers === undefined || subscribers.size === 0) {
      continue;
    }
    const { from } = difference.values[key];
    const to = get(manager.owner, key);
    for (const subscriber of subscribers) {
      subscriber(to, from);
    }
  }
  cloned.delete(manager);
};
var _isProxy = function(value2) {
  return value2?.$ instanceof Manager;
};
var _onChange = function(manager, value2) {
  cancelAnimationFrame(frames.get(manager));
  if (!cloned.has(manager)) {
    cloned.set(manager, value2);
  }
  frames.set(manager, requestAnimationFrame(() => {
    _emit(manager);
  }));
};
function cloneProxy(proxy) {
  if (!_isProxy(proxy)) {
    throw new Error("Value must be a proxy");
  }
  return proxy.$.clone();
}
function proxy(value2) {
  if (!isArrayOrPlainObject(value2)) {
    throw new Error("Proxy value must be an array or object");
  }
  return _createProxy(undefined, value2);
}
function subscribe(proxy2, key, subscriber) {
  if (_isProxy(proxy2)) {
    proxy2.$.on(key, subscriber);
  }
}
function unsubscribe(proxy2, key, subscriber) {
  if (_isProxy(proxy2)) {
    proxy2.$.off(key, subscriber);
  }
}

class Manager {
  owner;
  count = 0;
  subscribers = new Map;
  get subscribed() {
    return this.count > 0;
  }
  constructor(owner) {
    this.owner = owner;
  }
  clone() {
    return _createProxy(undefined, clone(merge(this.owner)));
  }
  off(key, subscriber) {
    if (this.subscribers.get(key)?.delete(subscriber) ?? false) {
      this.count -= 1;
    }
  }
  on(key, subscriber) {
    let subscribers = this.subscribers.get(key);
    if (subscribers === undefined) {
      subscribers = new Set;
      this.subscribers.set(key, subscribers);
    }
    subscribers.add(subscriber);
    this.count += 1;
  }
}
var cloned = new Map;
var frames = new Map;
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
var _setter = function(instance, value2) {
  if (Object.is(value2, values.get(instance))) {
    return;
  }
  values.set(instance, value2);
  cancelAnimationFrame(frames2.get(instance));
  frames2.set(instance, requestAnimationFrame(() => {
    const instanceEffects = effects.get(instance) ?? new Set;
    for (const effect of instanceEffects) {
      effect();
    }
    frames2.delete(instance);
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
function signal(value2) {
  return new Signal(value2);
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
  set value(value2) {
    _setter(this, value2);
  }
  constructor(value2) {
    this.value = value2;
  }
}
var effects = new WeakMap;
var frames2 = new WeakMap;
var running = [];
var values = new WeakMap;
// src/js/timer.ts
function repeat(callback, options) {
  const count = typeof options?.count === "number" ? options.count : Infinity;
  return new Timer(callback, { ...options ?? {}, ...{ count } }).start();
}
function wait(callback, time) {
  return new Timer(callback, {
    count: 1,
    interval: time
  }).start();
}
var work = function(type, timer, state, options) {
  if (type === "start" && timer.active || type === "stop" && !timer.active) {
    return timer;
  }
  const { afterCallback, callback, count, interval } = options;
  if (typeof state.frame === "number") {
    cancelAnimationFrame(state.frame);
    afterCallback?.(false);
  }
  if (type === "stop") {
    state.active = false;
    state.frame = undefined;
    return timer;
  }
  state.active = true;
  const isRepeated = count > 0;
  const milliseconds = 16.666666666666668;
  let index = 0;
  let start;
  function step(timestamp) {
    if (!state.active) {
      return;
    }
    start ??= timestamp;
    const elapsed = timestamp - start;
    const maximum = elapsed + milliseconds;
    const minimum = elapsed - milliseconds;
    if (minimum < interval && interval < maximum) {
      if (state.active) {
        callback(isRepeated ? index : undefined);
      }
      index += 1;
      if (index < count) {
        start = undefined;
      } else {
        state.active = false;
        state.frame = undefined;
        afterCallback?.(true);
        return;
      }
    }
    state.frame = requestAnimationFrame(step);
  }
  state.frame = requestAnimationFrame(step);
  return timer;
};

class Timer {
  get active() {
    return this.state.active;
  }
  constructor(callback, options) {
    this.options = {
      afterCallback: options.afterCallback,
      callback,
      count: typeof options.count === "number" && options.count > 0 ? options.count : 1,
      interval: typeof options.interval === "number" && options.interval >= 0 ? options.interval : 0
    };
    this.state = {
      active: false
    };
  }
  restart() {
    return work("restart", this, this.state, this.options);
  }
  start() {
    return work("start", this, this.state, this.options);
  }
  stop() {
    return work("stop", this, this.state, this.options);
  }
}
export {
  wait,
  unsubscribe,
  unique,
  subscribe,
  splice,
  signal,
  set,
  repeat,
  push,
  proxy,
  merge,
  insert,
  indexOf,
  groupBy,
  getTextDirection,
  getString,
  getPosition,
  getNumber,
  getElementUnderPointer,
  get,
  findParentElement,
  findElements,
  findElement,
  find,
  filter,
  exists,
  effect,
  diff,
  createUuid,
  computed,
  cloneProxy,
  clone,
  clamp,
  chunk,
  between,
  Timer,
  findElements as $$,
  findElement as $
};
