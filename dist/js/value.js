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
  const parts = getString(key).split(".").reverse();
  let position = parts.length;
  let value = data;
  while (position--) {
    value = _getValue(value, parts[position]);
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
  return value?.constructor?.name === "Object";
}
function setValue(data, key, value) {
  if (typeof data !== "object" || data === null || isNullableOrWhitespace(key)) {
    return data;
  }
  const parts = getString(key).split(".").reverse();
  let position = parts.length;
  let target = data;
  while (position--) {
    const key2 = parts[position];
    if (position === 0) {
      _setValue(target, key2, value);
      break;
    }
    let next = _getValue(target, key2);
    if (typeof next !== "object" || next === null) {
      next = /^\d+$/.test(parts[position - 1]) ? [] : {};
      target[key2] = next;
    }
    target = next;
  }
  return data;
}
export {
  setValue,
  isObject,
  isNullable,
  isArrayOrObject,
  getValue
};
