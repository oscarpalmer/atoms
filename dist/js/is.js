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
// src/js/is.ts
function isArrayOrPlainObject(value2) {
  return Array.isArray(value2) || isPlainObject(value2);
}
function isEmpty(value2) {
  const values = Object.values(value2);
  const { length } = values;
  let count2 = 0;
  for (let index = 0;index < length; index += 1) {
    if (values[index] != null) {
      count2 += 1;
    }
  }
  return count2 === 0;
}
function isKey(value2) {
  return typeof value2 === "number" || typeof value2 === "string";
}
function isNullable(value2) {
  return value2 == null;
}
function isNullableOrEmpty(value2) {
  return value2 == null || getString(value2) === "";
}
function isNullableOrWhitespace(value2) {
  return value2 == null || /^\s*$/.test(getString(value2));
}
function isNumber(value2) {
  return typeof value2 === "number" && !Number.isNaN(value2);
}
function isNumerical(value2) {
  return isNumber(value2) || typeof value2 === "string" && value2.trim().length > 0 && !Number.isNaN(+value2);
}
function isObject(value2) {
  return typeof value2 === "object" && value2 !== null || typeof value2 === "function";
}
function isPlainObject(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value2);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value2) && !(Symbol.iterator in value2);
}
function isPrimitive(value2) {
  return value2 == null || /^(bigint|boolean|number|string|symbol)$/.test(typeof value2);
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
