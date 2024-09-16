// src/js/value/index.ts
function partial(value2, keys) {
  const result = {};
  const { length } = keys;
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    result[key] = value2[key];
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
function getString(value2) {
  if (typeof value2 === "string") {
    return value2;
  }
  if (typeof value2 !== "object" || value2 == null) {
    return String(value2);
  }
  const valueOff = value2.valueOf?.() ?? value2;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value2) : asString;
}
function join(value2, delimiter) {
  return compact(value2).map(getString).filter((value3) => value3.trim().length > 0).join(typeof delimiter === "string" ? delimiter : "");
}
function words(value2) {
  return value2.match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g) ?? [];
}

// src/js/is.ts
function isArrayOrPlainObject(value2) {
  return Array.isArray(value2) || isPlainObject(value2);
}
function isPlainObject(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value2);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value2) && !(Symbol.iterator in value2);
}

// src/js/value/clone.ts
function clone(value2) {
  switch (true) {
    case value2 == null:
      return value2;
    case typeof value2 === "bigint":
      return BigInt(value2);
    case typeof value2 === "boolean":
      return Boolean(value2);
    case typeof value2 === "function":
      return;
    case typeof value2 === "number":
      return Number(value2);
    case typeof value2 === "string":
      return String(value2);
    case typeof value2 === "symbol":
      return Symbol(value2.description);
    case value2 instanceof ArrayBuffer:
      return cloneArrayBuffer(value2);
    case value2 instanceof DataView:
      return cloneDataView(value2);
    case value2 instanceof Map:
    case value2 instanceof Set:
      return cloneMapOrSet(value2);
    case value2 instanceof Node:
      return value2.cloneNode(true);
    case value2 instanceof RegExp:
      return cloneRegularExpression(value2);
    case isArrayOrPlainObject(value2):
      return cloneObject(value2);
    default:
      return structuredClone(value2);
  }
}
function cloneArrayBuffer(value2) {
  const cloned = new ArrayBuffer(value2.byteLength);
  new Uint8Array(cloned).set(new Uint8Array(value2));
  return cloned;
}
function cloneDataView(value2) {
  const buffer = cloneArrayBuffer(value2.buffer);
  return new DataView(buffer, value2.byteOffset, value2.byteLength);
}
function cloneMapOrSet(value2) {
  const isMap = value2 instanceof Map;
  const cloned = isMap ? new Map : new Set;
  const entries = [...value2.entries()];
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
function cloneObject(value2) {
  const cloned = Array.isArray(value2) ? [] : {};
  const keys = Object.keys(value2);
  const { length } = keys;
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    cloned[key] = clone(value2[key]);
  }
  return cloned;
}
function cloneRegularExpression(value2) {
  const cloned = new RegExp(value2.source, value2.flags);
  cloned.lastIndex = value2.lastIndex;
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
    const value2 = outerIndex === 0 ? first : second;
    if (!value2) {
      continue;
    }
    const keys = Object.keys(value2);
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
function handleValue(data, path, value2, get, ignoreCase) {
  if (typeof data === "object" && data !== null && !/^(__proto__|constructor|prototype)$/i.test(path)) {
    const key = findKey(path, data, ignoreCase);
    if (get) {
      return data[key];
    }
    data[key] = value2;
  }
}

// src/js/value/get.ts
function getValue(data, path, ignoreCase) {
  const shouldIgnoreCase = ignoreCase === true;
  const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split(".");
  const { length } = parts;
  let index = 0;
  let value2 = typeof data === "object" ? data ?? {} : {};
  while (index < length && value2 != null) {
    value2 = handleValue(value2, parts[index++], null, true, shouldIgnoreCase);
  }
  return value2;
}
// src/js/value/merge.ts
function merge(values, options) {
  if (values.length === 0) {
    return {};
  }
  const skipNullable = options?.skipNullable ?? false;
  const actual = values.filter((value2) => isArrayOrPlainObject(value2));
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
function setValue(data, path, value2, ignoreCase) {
  const shouldIgnoreCase = ignoreCase === true;
  const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split(".");
  const { length } = parts;
  const lastIndex = length - 1;
  let target = typeof data === "object" && data !== null ? data : {};
  for (let index = 0;index < length; index += 1) {
    const part = parts[index];
    if (index === lastIndex) {
      handleValue(target, part, value2, false, shouldIgnoreCase);
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
function flatten(value2, prefix) {
  const keys = Object.keys(value2);
  const { length } = keys;
  const smushed = {};
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    const val = value2[key];
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
function smush(value2) {
  return flatten(value2);
}
// src/js/value/unsmush.ts
function getKeyGroups(value2) {
  const keys = Object.keys(value2);
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
function unsmush(value2) {
  const groups = getKeyGroups(value2);
  const { length } = groups;
  const unsmushed = {};
  for (let groupIndex = 1;groupIndex < length; groupIndex += 1) {
    const group = groups[groupIndex];
    const groupLength = group.length;
    for (let keyIndex = 0;keyIndex < groupLength; keyIndex += 1) {
      const key = group[keyIndex];
      const val = value2[key];
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
