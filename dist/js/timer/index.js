// src/js/function.ts
function noop() {
}

// src/js/timer/constants.ts
var activeTimers = new Set;
var hiddenTimers = new Set;
var milliseconds = 1000 / 60;

// src/js/timer/functions.ts
function getOptions(options, isRepeated) {
  return {
    afterCallback: options.afterCallback,
    count: getValueOrDefault(options.count, isRepeated ? Number.POSITIVE_INFINITY : 1),
    errorCallback: options.errorCallback,
    interval: getValueOrDefault(options.interval, milliseconds, milliseconds),
    timeout: getValueOrDefault(options.timeout, isRepeated ? Number.POSITIVE_INFINITY : 30000)
  };
}
function getValueOrDefault(value, defaultValue, minimum) {
  return typeof value === "number" && value > (minimum ?? 0) ? value : defaultValue;
}
function work(type, timer, state, options) {
  if (["continue", "start"].includes(type) && state.active || ["pause", "stop"].includes(type) && !state.active) {
    return timer;
  }
  const { count, interval, timeout } = options;
  const { isRepeated, minimum } = state;
  if (["pause", "restart", "stop"].includes(type)) {
    const isStop = type === "stop";
    activeTimers.delete(timer);
    cancelAnimationFrame(state.frame);
    if (isStop) {
      options.afterCallback?.(false);
    }
    state.active = false;
    state.frame = undefined;
    state.paused = !isStop;
    if (isStop) {
      state.elapsed = undefined;
      state.index = undefined;
    }
    return type === "restart" ? work("start", timer, state, options) : timer;
  }
  state.active = true;
  state.paused = false;
  const elapsed = type === "continue" ? +(state.elapsed ?? 0) : 0;
  let index = type === "continue" ? +(state.index ?? 0) : 0;
  state.elapsed = elapsed;
  state.index = index;
  const total = (count === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : (count - index) * (interval > 0 ? interval : milliseconds)) - elapsed;
  let current;
  let start;
  function finish(finished, error) {
    activeTimers.delete(timer);
    state.active = false;
    state.elapsed = undefined;
    state.frame = undefined;
    state.index = undefined;
    if (error) {
      options.errorCallback?.();
    }
    options.afterCallback?.(finished);
  }
  function step(timestamp) {
    if (!state.active) {
      return;
    }
    current ??= timestamp;
    start ??= timestamp;
    const time = timestamp - current;
    state.elapsed = elapsed + (current - start);
    const finished = time - elapsed >= total;
    if (timestamp - start >= timeout - elapsed) {
      finish(finished, !finished);
      return;
    }
    if (finished || time >= minimum) {
      if (state.active) {
        state.callback(isRepeated ? index : undefined);
      }
      index += 1;
      state.index = index;
      if (!finished && index < count) {
        current = null;
      } else {
        finish(true, false);
        return;
      }
    }
    state.frame = requestAnimationFrame(step);
  }
  activeTimers.add(timer);
  state.frame = requestAnimationFrame(step);
  return timer;
}

// src/js/timer/timer.ts
function repeat(callback, options) {
  return timer("repeat", callback, options ?? {}, true);
}
function timer(type, callback, partial, start) {
  const isRepeated = type === "repeat";
  const options = getOptions(partial, isRepeated);
  const instance = new Timer(type, {
    callback,
    isRepeated,
    active: false,
    minimum: options.interval - options.interval % milliseconds / 2,
    paused: false,
    trace: new TimerTrace
  }, options);
  if (start) {
    instance.start();
  }
  return instance;
}
function wait(callback, options) {
  return timer("wait", callback, options == null || typeof options === "number" ? {
    interval: options
  } : options, true);
}

class BasicTimer {
  constructor(type, state) {
    this.$timer = type;
    this.state = state;
  }
}

class Timer extends BasicTimer {
  get active() {
    return this.state.active;
  }
  get paused() {
    return this.state.paused;
  }
  get trace() {
    return globalThis._atomic_timer_debug ? this.state.trace : undefined;
  }
  constructor(type, state, options) {
    super(type, state);
    this.options = options;
  }
  continue() {
    return work("continue", this, this.state, this.options);
  }
  pause() {
    return work("pause", this, this.state, this.options);
  }
  restart() {
    return work("restart", this, this.state, this.options);
  }
  start() {
    return work("start", this, this.state, this.options);
  }
  stop() {
    return work("stop", this, this.state, this.options);
  }
}

class TimerTrace extends Error {
  constructor() {
    super();
    this.name = "TimerTrace";
  }
}

// src/js/timer/index.ts
function delay(time, timeout) {
  return new Promise((resolve, reject) => {
    wait(resolve ?? noop, {
      timeout,
      errorCallback: reject ?? noop,
      interval: time
    });
  });
}

// src/js/timer/is.ts
function is(pattern, value) {
  return pattern.test(value?.$timer);
}
function isRepeated(value) {
  return is(/^repeat$/, value);
}
function isTimer(value) {
  return is(/^repeat|wait$/, value);
}
function isWaited(value) {
  return is(/^wait$/, value);
}
function isWhen(value) {
  return is(/^when$/, value) && typeof value.then === "function";
}
// src/js/timer/when.ts
function when(condition, options) {
  const repeated = timer("repeat", () => {
    if (condition()) {
      repeated.stop();
      state.resolver?.();
    }
  }, {
    afterCallback() {
      if (!repeated.paused) {
        if (condition()) {
          state.resolver?.();
        } else {
          state.rejecter?.();
        }
      }
    },
    errorCallback() {
      state.rejecter?.();
    },
    count: options?.count,
    interval: options?.interval,
    timeout: options?.timeout
  }, false);
  const state = {};
  state.promise = new Promise((resolve, reject) => {
    state.resolver = resolve;
    state.rejecter = reject;
  });
  state.timer = repeated;
  return new When(state);
}

class When extends BasicTimer {
  get active() {
    return this.state.timer.active;
  }
  get paused() {
    return this.state.timer.paused;
  }
  constructor(state) {
    super("when", state);
  }
  continue() {
    this.state.timer.continue();
    return this;
  }
  pause() {
    this.state.timer.pause();
    return this;
  }
  stop() {
    if (this.state.timer.active) {
      this.state.timer.stop();
      this.state.rejecter?.();
    }
    return this;
  }
  then(resolve, reject) {
    this.state.timer.start();
    return this.state.promise.then(resolve ?? noop, reject ?? noop);
  }
}

// src/js/timer/index.ts
if (globalThis._atomic_timers == null) {
  Object.defineProperty(globalThis, "_atomic_timers", {
    get() {
      return globalThis._atomic_timer_debug ? [...activeTimers] : [];
    }
  });
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    for (const timer4 of activeTimers) {
      hiddenTimers.add(timer4);
      timer4.pause();
    }
  } else {
    for (const timer4 of hiddenTimers) {
      timer4.continue();
    }
    hiddenTimers.clear();
  }
});
export {
  when,
  wait,
  repeat,
  isWhen,
  isWaited,
  isTimer,
  isRepeated,
  delay
};
