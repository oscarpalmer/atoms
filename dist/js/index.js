// src/js/element/index.ts
function findElement(selector, context) {
  return findElements(selector, context)[0];
}
function findElements(selector, context) {
  const contexts = context === undefined ? [document] : findElements(context);
  const elements = [];
  if (typeof selector === "string") {
    for (const context2 of contexts) {
      elements.push(...Array.from(context2.querySelectorAll(selector) ?? []));
    }
    return elements;
  }
  const nodes = Array.isArray(selector) || selector instanceof NodeList ? selector : [selector];
  for (const node of nodes) {
    if (node instanceof Element && contexts.some((context2) => context2.contains(node))) {
      elements.push(node);
    }
  }
  return elements;
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
function getEventPosition(event) {
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
function clampNumber(value, min, max) {
  return Math.min(Math.max(getNumber(value), getNumber(min)), getNumber(max));
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
  return typeof value === "string" ? value : typeof value?.toString === "function" ? value.toString() : String(value);
}
function isNullableOrWhitespace(value) {
  return value == null || getString(value).trim().length === 0;
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
// src/js/value.ts
var _getValue = function(data, key) {
  if (typeof data !== "object" || data === null || /^(__proto__|constructor|prototype)$/i.test(key)) {
    return;
  }
  if (data instanceof Map) {
    return data.get(key);
  }
  return data[key];
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
function getValue(data, key) {
  if (typeof data !== "object" || data === null || isNullableOrWhitespace(key)) {
    return;
  }
  const parts = getString(key).split(".");
  let value = data;
  for (const part of parts) {
    value = _getValue(value, part);
    if (value == null) {
      break;
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
function setValue(data, key, value) {
  if (typeof data !== "object" || data === null || isNullableOrWhitespace(key)) {
    return data;
  }
  const parts = getString(key).split(".");
  let target = data;
  for (const part of parts) {
    if (parts.indexOf(part) === parts.length - 1) {
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
export {
  wait,
  setValue,
  repeat,
  isObject,
  isNullableOrWhitespace,
  isNullable,
  isArrayOrObject,
  getValue,
  getTextDirection,
  getString,
  getNumber,
  getEventPosition,
  getElementUnderPointer,
  findParentElement,
  findElements,
  findElement,
  createUuid,
  clampNumber,
  Timer,
  findElements as $$,
  findElement as $
};
