// src/js/number.ts
function clamp(value, min, max, loop) {
  if (value < min) {
    return loop === true ? max : min;
  }
  return value > max ? loop === true ? min : max : value;
}

// src/js/function.ts
function debounce(callback, time) {
  const interval = clamp(time ?? 0, 0, 1000);
  let timer;
  const debounced = (...parameters) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback(...parameters);
    }, interval);
  };
  debounced.cancel = () => {
    clearTimeout(timer);
  };
  return debounced;
}
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
function throttle(callback, time) {
  const interval = clamp(time ?? 0, 0, 1000);
  let timestamp = performance.now();
  let timer;
  return (...parameters) => {
    clearTimeout(timer);
    const now = performance.now();
    const difference = now - timestamp;
    if (difference >= interval) {
      timestamp = now;
      callback(...parameters);
    } else {
      timer = setTimeout(() => {
        timestamp = performance.now();
        callback(...parameters);
      }, difference + interval);
    }
  };
}
export {
  throttle,
  noop,
  memoise,
  debounce
};
