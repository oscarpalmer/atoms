// src/js/log.ts
var time = function(label) {
  const started = log.enabled;
  let stopped = false;
  if (started) {
    console.time(label);
  }
  return Object.create({
    log() {
      if (started && !stopped && log.enabled) {
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
var work = function(type, data) {
  if (log.enabled) {
    console[type](...data);
  }
};
if (globalThis._atomic_logging == null) {
  globalThis._atomic_logging = true;
}
var types = new Set([
  "dir",
  "debug",
  "error",
  "info",
  "table",
  "trace",
  "warn"
]);
var log = (() => {
  function instance(...data) {
    work("log", data);
  }
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
      value: (...data) => work(type, data)
    });
  }
  return instance;
})();
export {
  log
};
