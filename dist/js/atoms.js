// src/js/string.ts
function createUuid() {
  return uuidTemplate.replace(/[018]/g, (substring) => (substring ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> substring / 4).toString(16));
}
function getString(value) {
  return typeof value === "string" ? value : String(value);
}
function isNullableOrWhitespace(value) {
  return value === undefined || value === null || getString(value).trim().length === 0;
}
var uuidTemplate = "10000000-1000-4000-8000-100000000000";
// src/js/value.ts
var _getValue = function(data, key) {
  if (typeof data !== "object" || data === null || badProperties.has(key)) {
    return;
  }
  if (data instanceof Map) {
    return data.get(key);
  }
  if (data instanceof Set) {
    return Array.from(data)[key];
  }
  return data[key];
};
var _setValue = function(data, key, value) {
  if (typeof data !== "object" || data === null || badProperties.has(key)) {
    return;
  }
  if (data instanceof Map) {
    data.set(key, value);
  } else if (data instanceof Set) {
    _setValueInSet(data, key, value);
  } else {
    data[key] = value;
  }
};
var _setValueInSet = function(data, key, value) {
  const index = numberExpression.test(key) ? Number.parseInt(key, 10) : -1;
  if (index === -1 || index >= data.size) {
    data.add(value);
    return;
  }
  const array = Array.from(data);
  array.splice(index, 1, value);
  data.clear();
  const { length } = array;
  let position = Number(length);
  while (position--) {
    data.add(array[length - position - 1]);
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
    if (value === undefined) {
      break;
    }
  }
  return value;
}
function isArrayOrObject(value) {
  return constructors.has(value?.constructor?.name);
}
function isNullable(value) {
  return value === undefined || value === null;
}
function isObject(value) {
  return value?.constructor?.name === objectConstructor;
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
      next = numberExpression.test(parts[position - 1]) ? [] : {};
      target[key2] = next;
    }
    target = next;
  }
  return data;
}
var badProperties = new Set(["__proto__", "constructor", "prototype"]);
var objectConstructor = "Object";
var constructors = new Set(["Array", objectConstructor]);
var numberExpression = /^\d+$/;
export {
  setValue,
  isObject,
  isNullableOrWhitespace,
  isNullable,
  isArrayOrObject,
  getValue,
  getString,
  createUuid
};
