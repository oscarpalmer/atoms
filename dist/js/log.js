// src/js/log.ts
var time = function(label) {
  const started = log.enabled;
  let stopped = false;
  if (started) {
    console.time(label);
  }
  return Object.create({
    log() {
      if (started && log.enabled) {
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
  let enabled = true;
  function instance(...data) {
    work("log", data);
  }
  Object.defineProperties(instance, {
    enabled: {
      get() {
        return enabled;
      },
      set(value) {
        enabled = value;
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
