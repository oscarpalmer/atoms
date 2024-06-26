// src/js/function.ts
function noop() {
}

// src/js/logger.ts
var time = function(label) {
  const started = logger.enabled;
  let stopped = false;
  if (started) {
    console.time(label);
  }
  return Object.create({
    log() {
      if (started && !stopped && logger.enabled) {
        console.timeLog(label);
      }
    },
    stop() {
      if (started && !stopped) {
        stopped = true;
        console.timeEnd(label);
      }
    }
  });
};
if (globalThis._atomic_logging == null) {
  globalThis._atomic_logging = true;
}
var types = new Set([
  "dir",
  "debug",
  "error",
  "info",
  "log",
  "table",
  "trace",
  "warn"
]);
var logger = (() => {
  const instance = Object.create(null);
  Object.defineProperties(instance, {
    enabled: {
      get() {
        return _atomic_logging ?? true;
      },
      set(value) {
        _atomic_logging = value;
      }
    },
    time: {
      value: time
    }
  });
  for (const type of types) {
    Object.defineProperty(instance, type, {
      get() {
        return instance.enabled ? console[type] : noop;
      }
    });
  }
  return instance;
})();
export {
  logger
};
