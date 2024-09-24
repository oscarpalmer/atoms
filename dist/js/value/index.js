// src/js/value/index.ts
function partial(value, keys) {
  const result = {};
  const { length } = keys;
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    result[key] = value[key];
  }
  return result;
}
// src/js/array/compact.ts
function compact(array, strict) {
  return strict === true ? array.filter((item) => !!item) : array.filter((item) => item != null);
}
// src/js/math.ts
function max(values) {
  return values.length > 0 ? Math.max(...values) : Number.NaN;
}

// src/js/number.ts
function getNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "symbol") {
    return Number.NaN;
  }
  let parsed = value?.valueOf?.() ?? value;
  if (typeof parsed === "object") {
    parsed = parsed?.toString() ?? parsed;
  }
  if (typeof parsed !== "string") {
    return parsed == null ? Number.NaN : typeof parsed === "number" ? parsed : +parsed;
  }
  if (/^\s*0+\s*$/.test(parsed)) {
    return 0;
  }
  const trimmed = parsed.trim();
  if (trimmed.length === 0) {
    return Number.NaN;
  }
  const isBinary = /^0b[01]+$/i.test(trimmed);
  if (isBinary || /^0o[0-7]+$/i.test(trimmed)) {
    return Number.parseInt(trimmed.slice(2), isBinary ? 2 : 8);
  }
  return +(/^0x[0-9a-f]+$/i.test(trimmed) ? trimmed : trimmed.replace(/_/g, ""));
}

// src/js/value/compare.ts
function compare(first, second) {
  const firstParts = getParts(first);
  const secondParts = getParts(second);
  const length = max([firstParts.length, secondParts.length]);
  const lastIndex = length - 1;
  for (let index = 0;index < length; index += 1) {
    const firstPart = firstParts[index];
    const secondPart = secondParts[index];
    if (firstPart === secondPart) {
      if (index === lastIndex) {
        return 0;
      }
      continue;
    }
    if (firstPart == null || typeof firstPart === "string" && firstPart.length === 0) {
      return -1;
    }
    if (secondPart == null || typeof secondPart === "string" && secondPart.length === 0) {
      return 1;
    }
    const firstNumber = getNumber(firstPart);
    const secondNumber = getNumber(secondPart);
    const firstIsNaN = Number.isNaN(firstNumber);
    const secondIsNaN = Number.isNaN(secondNumber);
    if (firstIsNaN || secondIsNaN) {
      if (firstIsNaN && secondIsNaN) {
        return getString(firstPart).localeCompare(getString(secondPart));
      }
      if (firstIsNaN) {
        return 1;
      }
      if (secondIsNaN) {
        return -1;
      }
    }
    if (firstNumber === secondNumber) {
      if (index === lastIndex) {
        return 0;
      }
      continue;
    }
    return firstNumber - secondNumber;
  }
  return join(firstParts).localeCompare(join(secondParts));
}
function getParts(value) {
  if (value == null) {
    return [""];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return typeof value === "object" ? [value] : words(getString(value));
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
function words(value) {
  return value.match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g) ?? [];
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
    case value instanceof Map:
    case value instanceof Set:
      return cloneMapOrSet(value);
    case value instanceof Node:
      return value.cloneNode(true);
    case value instanceof RegExp:
      return cloneRegularExpression(value);
    case isArrayOrPlainObject(value):
      return cloneObject(value);
    default:
      return structuredClone(value);
  }
}
function cloneArrayBuffer(value) {
  const cloned = new ArrayBuffer(value.byteLength);
  new Uint8Array(cloned).set(new Uint8Array(value));
  return cloned;
}
function cloneDataView(value) {
  const buffer = cloneArrayBuffer(value.buffer);
  return new DataView(buffer, value.byteOffset, value.byteLength);
}
function cloneMapOrSet(value) {
  const isMap = value instanceof Map;
  const cloned = isMap ? new Map : new Set;
  const entries = [...value.entries()];
  const { length } = entries;
  for (let index = 0;index < length; index += 1) {
    const entry = entries[index];
    if (isMap) {
      cloned.set(clone(entry[0]), clone(entry[1]));
    } else {
      cloned.add(clone(entry[0]));
    }
  }
  return cloned;
}
function cloneObject(value) {
  const cloned = Array.isArray(value) ? [] : {};
  const keys = Object.keys(value);
  const { length } = keys;
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    cloned[key] = clone(value[key]);
  }
  return cloned;
}
function cloneRegularExpression(value) {
  const cloned = new RegExp(value.source, value.flags);
  cloned.lastIndex = value.lastIndex;
  return cloned;
}
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
      return equalObject(first, second);
    case (typeof first === "string" && ignoreCase === true):
      return Object.is(first.toLowerCase(), second.toLowerCase());
    default:
      return Object.is(first, second);
  }
}
function equalArrayBuffer(first, second) {
  return first.byteLength === second.byteLength ? equalObject(new Uint8Array(first), new Uint8Array(second)) : false;
}
function equalDataView(first, second) {
  return first.byteOffset === second.byteOffset ? equalArrayBuffer(first.buffer, second.buffer) : false;
}
function equalMap(first, second) {
  const { size } = first;
  if (size !== second.size) {
    return false;
  }
  const firstKeys = [...first.keys()];
  const secondKeys = [...second.keys()];
  if (firstKeys.some((key) => !secondKeys.includes(key))) {
    return false;
  }
  for (let index = 0;index < size; index += 1) {
    const key = firstKeys[index];
    if (!equal(first.get(key), second.get(key))) {
      return false;
    }
  }
  return true;
}
function equalObject(first, second) {
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
}
function equalProperties(first, second, properties) {
  const { length } = properties;
  for (let index = 0;index < length; index += 1) {
    const property = properties[index];
    if (!equal(first[property], second[property])) {
      return false;
    }
  }
  return true;
}
function equalSet(first, second) {
  const { size } = first;
  if (size !== second.size) {
    return false;
  }
  const firstValues = [...first];
  const secondValues = [...second];
  for (let index = 0;index < size; index += 1) {
    const firstValue = firstValues[index];
    if (!secondValues.some((secondValue) => equal(firstValue, secondValue))) {
      return false;
    }
  }
  return true;
}

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
function getDiffs(first, second, prefix) {
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
}
// src/js/internal/value-handle.ts
function findKey(needle, haystack, ignoreCase) {
  if (!ignoreCase) {
    return needle;
  }
  const keys = Object.keys(haystack);
  const normalised = keys.map((key) => key.toLowerCase());
  const index = normalised.indexOf(needle.toLowerCase());
  return index > -1 ? keys[index] : needle;
}
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
function merge(values, options) {
  if (values.length === 0) {
    return {};
  }
  const skipNullable = options?.skipNullable ?? false;
  const actual = values.filter((value) => isArrayOrPlainObject(value));
  const result = actual.every(Array.isArray) ? [] : {};
  const isArray = Array.isArray(result);
  const { length } = actual;
  for (let outerIndex = 0;outerIndex < length; outerIndex += 1) {
    const item = actual[outerIndex];
    const keys = Object.keys(item);
    const size = keys.length;
    for (let innerIndex = 0;innerIndex < size; innerIndex += 1) {
      const key = keys[innerIndex];
      const next = item[key];
      const previous = result[key];
      if (isArray && skipNullable && next == null) {
        continue;
      }
      if (isArrayOrPlainObject(next)) {
        result[key] = isArrayOrPlainObject(previous) ? merge([previous, next]) : merge([next]);
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
  let target = typeof data === "object" && data !== null ? data : {};
  for (let index = 0;index < length; index += 1) {
    const part = parts[index];
    if (index === lastIndex) {
      handleValue(target, part, value, false, shouldIgnoreCase);
      break;
    }
    let next = handleValue(target, part, null, true, shouldIgnoreCase);
    if (typeof next !== "object" || next === null) {
      next = {};
      target[part] = next;
    }
    target = next;
  }
  return data;
}
// src/js/value/smush.ts
function flatten(value, prefix) {
  const keys = Object.keys(value);
  const { length } = keys;
  const smushed = {};
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    const val = value[key];
    if (isArrayOrPlainObject(val)) {
      Object.assign(smushed, {
        [join([prefix, key], ".")]: Array.isArray(val) ? [...val] : { ...val },
        ...flatten(val, join([prefix, key], "."))
      });
    } else {
      smushed[join([prefix, key], ".")] = val;
    }
  }
  return smushed;
}
function smush(value) {
  return flatten(value);
}
// src/js/value/unsmush.ts
function getKeyGroups(value) {
  const keys = Object.keys(value);
  const { length } = keys;
  const grouped = [];
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    const dots = key.split(".");
    if (grouped[dots.length] == null) {
      grouped[dots.length] = [key];
    } else {
      grouped[dots.length].push(key);
    }
  }
  return grouped;
}
function unsmush(value) {
  const groups = getKeyGroups(value);
  const { length } = groups;
  const unsmushed = {};
  for (let groupIndex = 1;groupIndex < length; groupIndex += 1) {
    const group = groups[groupIndex];
    const groupLength = group.length;
    for (let keyIndex = 0;keyIndex < groupLength; keyIndex += 1) {
      const key = group[keyIndex];
      const val = value[key];
      setValue(unsmushed, key, isArrayOrPlainObject(val) ? Array.isArray(val) ? [...val] : { ...val } : val);
    }
  }
  return unsmushed;
}
export {
  unsmush,
  smush,
  setValue,
  partial,
  merge,
  getValue,
  equal,
  diff,
  compare,
  clone
};
