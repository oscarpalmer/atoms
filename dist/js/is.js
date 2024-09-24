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
// src/js/is.ts
function isArrayOrPlainObject(value) {
  return Array.isArray(value) || isPlainObject(value);
}
function isEmpty(value) {
  const values = Object.values(value);
  const { length } = values;
  let count2 = 0;
  for (let index = 0;index < length; index += 1) {
    if (values[index] != null) {
      count2 += 1;
    }
  }
  return count2 === 0;
}
function isKey(value) {
  return typeof value === "number" || typeof value === "string";
}
function isNullable(value) {
  return value == null;
}
function isNullableOrEmpty(value) {
  return value == null || getString(value) === "";
}
function isNullableOrWhitespace(value) {
  return value == null || /^\s*$/.test(getString(value));
}
function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}
function isNumerical(value) {
  return isNumber(value) || typeof value === "string" && value.trim().length > 0 && !Number.isNaN(+value);
}
function isObject(value) {
  return typeof value === "object" && value !== null || typeof value === "function";
}
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
function isPrimitive(value) {
  return value == null || /^(bigint|boolean|number|string|symbol)$/.test(typeof value);
}
export {
  isPrimitive,
  isPlainObject,
  isObject,
  isNumerical,
  isNumber,
  isNullableOrWhitespace,
  isNullableOrEmpty,
  isNullable,
  isKey,
  isEmpty,
  isArrayOrPlainObject
};
