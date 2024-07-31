// src/js/function.ts
function noop() {
}

// src/js/logger.ts
if (globalThis._atomic_logging == null) {
  globalThis._atomic_logging = true;
}

class Logger {
  get debug() {
    return this.enabled ? console.debug : noop;
  }
  get dir() {
    return this.enabled ? console.dir : noop;
  }
  get enabled() {
    return globalThis._atomic_logging ?? true;
  }
  set enabled(value) {
    globalThis._atomic_logging = value;
  }
  get error() {
    return this.enabled ? console.error : noop;
  }
  get info() {
    return this.enabled ? console.info : noop;
  }
  get log() {
    return this.enabled ? console.log : noop;
  }
  get table() {
    return this.enabled ? console.table : noop;
  }
  get trace() {
    return this.enabled ? console.trace : noop;
  }
  get warn() {
    return this.enabled ? console.warn : noop;
  }
  time(label) {
    return new Time(label);
  }
}

class Time {
  constructor(label) {
    this.state = {
      label,
      started: globalThis._atomic_logging ?? true,
      stopped: false
    };
    if (this.state.started) {
      console.time(label);
    }
  }
  log() {
    if (this.state.started && !this.state.stopped && logger.enabled) {
      console.timeLog(this.state.label);
    }
  }
  stop() {
    if (this.state.started && !this.state.stopped) {
      this.state.stopped = true;
      console.timeEnd(this.state.label);
    }
  }
}
var logger = new Logger;
export {
  logger
};
