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
function isNullableOrWhitespace(value) {
  return value == null || getString(value).trim().length === 0;
}

// src/js/value.ts
var _getDiffs = function(first, second, prefix) {
  const changes = [];
  const checked = new Set;
  let outer = 0;
  for (;outer < 2; outer += 1) {
    const value = outer === 0 ? first : second;
    if (!isArrayOrObject(value)) {
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
        changes.push({
          from,
          to,
          key: prefixed
        });
        changes.push(..._getDiffs(from, to, prefixed));
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
  const firstIsArrayOrObject = isArrayOrObject(first);
  const secondIsArrayOrObject = isArrayOrObject(second);
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
function isArrayOrObject(value) {
  return /^(array|object)$/i.test(value?.constructor?.name);
}
function isNullable(value) {
  return value == null;
}
function isObject(value) {
  return /^object$/i.test(value?.constructor?.name);
}
function merge(...values) {
  if (values.length === 0) {
    return {};
  }
  const actual = values.filter(isArrayOrObject);
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
      if (isArrayOrObject(next)) {
        result[key] = isArrayOrObject(previous) ? merge(previous, next) : merge(next);
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
  if (!isArrayOrObject(value2) || _isProxy(value2) && value2.$ === existing) {
    return value2;
  }
  const isArray = Array.isArray(value2);
  const proxy = new Proxy(isArray ? [] : {}, {
    get(target, property) {
      return property === "$" ? manager : Reflect.get(target, property);
    },
    set(target, property, value3) {
      return property === "$" || Reflect.set(target, property, _createProxy(manager, value3));
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
var _isProxy = function(value2) {
  return value2?.$ instanceof Manager;
};
function proxy(value2) {
  if (!isArrayOrObject(value2)) {
    throw new Error("Proxy value must be an array or object");
  }
  return _createProxy(undefined, value2);
}

class Manager {
  owner;
  constructor(owner) {
    this.owner = owner;
  }
  clone() {
    return clone(merge(this.owner));
  }
}
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
  unique,
  splice,
  set,
  repeat,
  push,
  proxy,
  merge,
  isObject,
  isNullableOrWhitespace,
  isNullable,
  isArrayOrObject,
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
  diff,
  createUuid,
  clone,
  clamp,
  chunk,
  between,
  Timer,
  findElements as $$,
  findElement as $
};
