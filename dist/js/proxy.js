// src/js/string.ts
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
var _cloneNested = function(value) {
  const cloned = Array.isArray(value) ? [] : {};
  const keys = Object.keys(value);
  const { length } = keys;
  let index = 0;
  for (;index < length; index += 1) {
    const key = keys[index];
    cloned[key] = clone(value[key]);
  }
  return cloned;
};
var _cloneRegularExpression = function(value) {
  const cloned = new RegExp(value.source, value.flags);
  cloned.lastIndex = value.lastIndex;
  return cloned;
};
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
function clone(value) {
  switch (true) {
    case value == null:
    case typeof value === "function":
      return value;
    case typeof value === "bigint":
      return BigInt(value);
    case typeof value === "boolean":
      return Boolean(value);
    case typeof value === "number":
      return Number(value);
    case typeof value === "string":
      return String(value);
    case typeof value === "symbol":
      return Symbol(value.description);
    case value instanceof Node:
      return value.cloneNode(true);
    case value instanceof RegExp:
      return _cloneRegularExpression(value);
    case isArrayOrPlainObject(value):
      return _cloneNested(value);
    default:
      return structuredClone(value);
  }
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
export {
  unsubscribe,
  subscribe,
  proxy,
  cloneProxy
};
