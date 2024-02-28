// src/js/string.ts
function getString(value) {
  if (typeof value === "string") {
    return value;
  }
  const result = value?.toString?.() ?? value;
  return result?.toString?.() ?? String(result);
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
    const size = keys.length;
    let inner = 0;
    for (;inner < size; inner += 1) {
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
  let index = 0;
  let target = typeof data === "object" ? data ?? {} : {};
  for (;index < length; index += 1) {
    const part = parts[index];
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
  set,
  merge,
  isObject,
  isNullable,
  isArrayOrObject,
  get,
  diff,
  clone
};
