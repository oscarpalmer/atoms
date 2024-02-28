// src/js/value.ts
function clone(value) {
  return structuredClone(value);
}
function isArrayOrObject(value) {
  return /^(array|object)$/i.test(value?.constructor?.name);
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

// src/js/proxy.ts
var _createProxy = function(existing, value2) {
  if (!isArrayOrObject(value2) || _isProxy(value2) && value2.$ === existing) {
    return value2;
  }
  const isArray = Array.isArray(value2);
  const proxy = new Proxy(isArray ? [] : {}, {
    get(target, property) {
      return property === "$" ? manager : Reflect.get(target, property);
    },
    set(target, property, value3) {
      return property === "$" || Reflect.set(target, property, _createProxy(manager, value3));
    }
  });
  const manager = existing ?? new Manager(proxy);
  Object.defineProperty(proxy, "$", {
    value: manager
  });
  const keys = Object.keys(value2);
  const { length } = keys;
  let index = 0;
  for (;index < length; index += 1) {
    const key = keys[index];
    proxy[key] = value2[key];
  }
  return proxy;
};
var _isProxy = function(value2) {
  return value2?.$ instanceof Manager;
};
function proxy(value2) {
  if (!isArrayOrObject(value2)) {
    throw new Error("Proxy value must be an array or object");
  }
  return _createProxy(undefined, value2);
}

class Manager {
  owner;
  constructor(owner) {
    this.owner = owner;
  }
  clone() {
    return clone(merge(this.owner));
  }
}
export {
  proxy
};
