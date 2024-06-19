// src/js/function.ts
function memoise(callback) {
  function get(...parameters) {
    const key = parameters[0];
    if (cache.has(key)) {
      return cache.get(key);
    }
    const value = callback(...parameters);
    cache.set(key, value);
    return value;
  }
  const cache = new Map;
  return Object.create({
    cache,
    clear() {
      cache.clear();
    },
    delete(key) {
      return cache.delete(key);
    },
    get(key) {
      return cache.get(key);
    },
    has(key) {
      return cache.has(key);
    },
    run(...parameters) {
      return get(...parameters);
    }
  });
}
function noop() {
}
export {
  noop,
  memoise
};
