// src/js/array/index.ts
function compact(array) {
  return array.filter((value) => value != null);
}
// src/js/string/index.ts
function getString(value) {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value !== "object" || value == null) {
    return String(value);
  }
  const valueOff = value.valueOf?.() ?? value;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value) : asString;
}
function join(value, delimiter) {
  return compact(value).map(getString).filter((value2) => value2.trim().length > 0).join(typeof delimiter === "string" ? delimiter : "");
}
// src/js/is.ts
function isArrayOrPlainObject(value) {
  return Array.isArray(value) || isPlainObject(value);
}
function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}
function isNumerical(value) {
  return isNumber(value) || typeof value === "string" && value.trim().length > 0 && !Number.isNaN(+value);
}
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}

// src/js/value/clone.ts
function clone(value) {
  switch (true) {
    case value == null:
      return value;
    case typeof value === "bigint":
      return BigInt(value);
    case typeof value === "boolean":
      return Boolean(value);
    case typeof value === "function":
      return;
    case typeof value === "number":
      return Number(value);
    case typeof value === "string":
      return String(value);
    case typeof value === "symbol":
      return Symbol(value.description);
    case value instanceof ArrayBuffer:
      return cloneArrayBuffer(value);
    case value instanceof DataView:
      return cloneDataView(value);
    case value instanceof Node:
      return value.cloneNode(true);
    case value instanceof RegExp:
      return cloneRegularExpression(value);
    case isArrayOrPlainObject(value):
      return cloneNested(value);
    default:
      return structuredClone(value);
  }
}
var cloneArrayBuffer = function(value) {
  const cloned = new ArrayBuffer(value.byteLength);
  new Uint8Array(cloned).set(new Uint8Array(value));
  return cloned;
};
var cloneDataView = function(value) {
  const buffer = cloneArrayBuffer(value.buffer);
  return new DataView(buffer, value.byteOffset, value.byteLength);
};
var cloneNested = function(value) {
  const cloned = Array.isArray(value) ? [] : {};
  const keys = Object.keys(value);
  const { length } = keys;
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    cloned[key] = clone(value[key]);
  }
  return cloned;
};
var cloneRegularExpression = function(value) {
  const cloned = new RegExp(value.source, value.flags);
  cloned.lastIndex = value.lastIndex;
  return cloned;
};
// src/js/value/equal.ts
function equal(first, second, ignoreCase) {
  switch (true) {
    case first === second:
      return true;
    case (first == null || second == null):
      return first === second;
    case typeof first !== typeof second:
      return false;
    case (first instanceof ArrayBuffer && second instanceof ArrayBuffer):
      return equalArrayBuffer(first, second);
    case typeof first === "boolean":
    case (first instanceof Date && second instanceof Date):
      return Object.is(Number(first), Number(second));
    case (first instanceof DataView && second instanceof DataView):
      return equalDataView(first, second);
    case (first instanceof Error && second instanceof Error):
      return equalProperties(first, second, ["name", "message"]);
    case (first instanceof Map && second instanceof Map):
      return equalMap(first, second);
    case (first instanceof RegExp && second instanceof RegExp):
      return equalProperties(first, second, ["source", "flags"]);
    case (first instanceof Set && second instanceof Set):
      return equalSet(first, second);
    case (Array.isArray(first) && Array.isArray(second)):
    case (isPlainObject(first) && isPlainObject(second)):
      return equalNested(first, second);
    case (typeof first === "string" && ignoreCase === true):
      return Object.is(first.toLowerCase(), second.toLowerCase());
    default:
      return Object.is(first, second);
  }
}
var equalArrayBuffer = function(first, second) {
  return first.byteLength === second.byteLength ? equalNested(new Uint8Array(first), new Uint8Array(second)) : false;
};
var equalDataView = function(first, second) {
  return first.byteOffset === second.byteOffset ? equalArrayBuffer(first.buffer, second.buffer) : false;
};
var equalMap = function(first, second) {
  if (first.size !== second.size) {
    return false;
  }
  const firstKeys = [...first.keys()];
  const secondKeys = [...second.keys()];
  if (firstKeys.some((key) => !secondKeys.includes(key))) {
    return false;
  }
  for (const [key, value] of first) {
    if (!equal(value, second.get(key))) {
      return false;
    }
  }
  return true;
};
var equalNested = function(first, second) {
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);
  const { length } = firstKeys;
  if (length !== secondKeys.length || firstKeys.some((key) => !secondKeys.includes(key))) {
    return false;
  }
  for (let index = 0;index < length; index += 1) {
    const key = firstKeys[index];
    if (!equal(first[key], second[key])) {
      return false;
    }
  }
  return true;
};
var equalProperties = function(first, second, properties) {
  for (const key of properties) {
    if (!Object.is(first[key], second[key])) {
      return false;
    }
  }
  return true;
};
var equalSet = function(first, second) {
  const { size } = first;
  if (size !== second.size) {
    return false;
  }
  const values = [...second];
  for (const item of first) {
    if (!values.some((value) => equal(item, value))) {
      return false;
    }
  }
  return true;
};

// src/js/value/diff.ts
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
  const diffs = getDiffs(first, second);
  const { length } = diffs;
  if (length === 0) {
    result.type = "none";
  }
  for (let index = 0;index < length; index += 1) {
    const diff2 = diffs[index];
    result.values[diff2.key] = { from: diff2.from, to: diff2.to };
  }
  return result;
}
var getDiffs = function(first, second, prefix) {
  const changes = [];
  const checked = new Set;
  for (let outerIndex = 0;outerIndex < 2; outerIndex += 1) {
    const value = outerIndex === 0 ? first : second;
    if (!value) {
      continue;
    }
    const keys = Object.keys(value);
    const { length } = keys;
    for (let innerIndex = 0;innerIndex < length; innerIndex += 1) {
      const key = keys[innerIndex];
      if (checked.has(key)) {
        continue;
      }
      const from = first?.[key];
      const to = second?.[key];
      if (!equal(from, to)) {
        const prefixed = join([prefix, key], ".");
        const change = {
          from,
          to,
          key: prefixed
        };
        const nested = isArrayOrPlainObject(from) || isArrayOrPlainObject(to);
        const diffs = nested ? getDiffs(from, to, prefixed) : [];
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
// src/js/internal/value-handle.ts
var findKey = function(needle, haystack, ignoreCase) {
  if (!ignoreCase) {
    return needle;
  }
  const keys = Object.keys(haystack);
  const normalised = keys.map((key) => key.toLowerCase());
  const index = normalised.indexOf(needle.toLowerCase());
  return index > -1 ? keys[index] : needle;
};
function handleValue(data, path, value, get, ignoreCase) {
  if (typeof data === "object" && data !== null && !/^(__proto__|constructor|prototype)$/i.test(path)) {
    const key = findKey(path, data, ignoreCase);
    if (get) {
      return data[key];
    }
    data[key] = value;
  }
}

// src/js/value/get.ts
function getValue(data, path, ignoreCase) {
  const shouldIgnoreCase = ignoreCase === true;
  const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split(".");
  const { length } = parts;
  let index = 0;
  let value = typeof data === "object" ? data ?? {} : {};
  while (index < length && value != null) {
    value = handleValue(value, parts[index++], null, true, shouldIgnoreCase);
  }
  return value;
}
// src/js/value/merge.ts
function merge(...values) {
  if (values.length === 0) {
    return {};
  }
  const actual = values.filter((value) => isArrayOrPlainObject(value));
  const result = actual.every(Array.isArray) ? [] : {};
  const { length } = actual;
  for (let outerIndex = 0;outerIndex < length; outerIndex += 1) {
    const item = actual[outerIndex];
    const keys = Object.keys(item);
    const size = keys.length;
    for (let innerIndex = 0;innerIndex < size; innerIndex += 1) {
      const key = keys[innerIndex];
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
// src/js/value/set.ts
function setValue(data, path, value, ignoreCase) {
  const shouldIgnoreCase = ignoreCase === true;
  const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split(".");
  const { length } = parts;
  const lastIndex = length - 1;
  let previous;
  let target = typeof data === "object" && data !== null ? data : {};
  for (let index = 0;index < length; index += 1) {
    const part = parts[index];
    if (parts.indexOf(part) === lastIndex) {
      handleValue(target, part, value, false, shouldIgnoreCase);
      break;
    }
    let next = handleValue(target, part, null, true, shouldIgnoreCase);
    if (typeof next !== "object" || next === null) {
      if (isNumerical(part) && previous != null) {
        const temporary = previous[parts[index - 1]];
        if (!Array.isArray(temporary)) {
          previous[parts[index - 1]] = typeof temporary === "object" && temporary !== null && Object.keys(temporary).every(isNumerical) ? Object.values(temporary) : [];
          target = previous[parts[index - 1]];
        }
      }
      next = {};
      target[part] = next;
    }
    previous = target;
    target = next;
  }
  return data;
}
export {
  setValue,
  merge,
  getValue,
  equal,
  diff,
  clone
};
