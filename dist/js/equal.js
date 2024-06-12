// src/js/is.ts
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}

// src/js/equal.ts
function equal(first, second) {
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
    case first instanceof Date:
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
  if (first.size !== second.size) {
    return false;
  }
  for (const value of first) {
    if (!second.has(value)) {
      return false;
    }
  }
  return true;
};
export {
  equal
};
