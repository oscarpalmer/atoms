// src/js/value.ts
function isArrayOrObject(value) {
  return /^(array|object)$/i.test(value?.constructor?.name);
}

// src/js/object.ts
function clone(value2) {
  return structuredClone(value2);
}
function merge(...values) {
  if (values.length === 0) {
    return {};
  }
  const actual = values.filter(isArrayOrObject);
  const result = actual.every(Array.isArray) ? [] : {};
  const { length: itemsLength } = actual;
  let itemIndex = 0;
  for (;itemIndex < itemsLength; itemIndex += 1) {
    const item = actual[itemIndex];
    const isArray = Array.isArray(item);
    const keys = isArray ? undefined : Object.keys(item);
    const keysLength = isArray ? item.length : keys.length;
    let keyIndex = 0;
    for (;keyIndex < keysLength; keyIndex += 1) {
      const key = keys?.[keyIndex] ?? keyIndex;
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
export {
  merge,
  clone
};
