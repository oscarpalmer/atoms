// src/js/timer.ts
function isRepeated(value) {
  return /^repeat$/.test(value?.$timer ?? "");
}
function isTimer(value) {
  return /^repeat|wait$/.test(value?.$timer ?? "");
}
function isWaited(value) {
  return /^wait$/.test(value?.$timer ?? "");
}
function repeat(callback, options) {
  return timer("repeat", callback, {
    ...options ?? {},
    ...{
      count: typeof options?.count === "number" ? options.count : Number.POSITIVE_INFINITY
    }
  }).start();
}
var timer = function(type, callback, options) {
  const extended = {
    afterCallback: options.afterCallback,
    count: typeof options.count === "number" && options.count > 0 ? options.count : 1,
    errorCallback: options.errorCallback,
    interval: typeof options.interval === "number" && options.interval >= 0 ? options.interval : 0,
    timeout: typeof options.timeout === "number" && options.timeout > 0 ? options.timeout : 30000
  };
  const state = {
    callback,
    active: false
  };
  const instance = Object.create({
    restart() {
      return work("restart", this, state, extended);
    },
    start() {
      return work("start", this, state, extended);
    },
    stop() {
      return work("stop", this, state, extended);
    }
  });
  Object.defineProperties(instance, {
    $timer: {
      get() {
        return type;
      }
    },
    active: {
      get() {
        return state.active;
      }
    }
  });
  return instance;
};
function wait(callback, options) {
  const optionsIsNumber = typeof options === "number";
  return timer("wait", callback, {
    count: 1,
    errorCallback: optionsIsNumber ? undefined : options?.errorCallback,
    interval: optionsIsNumber ? options : options?.interval ?? 0
  }).start();
}
function when(condition, options) {
  let rejecter;
  let resolver;
  const repeated = repeat(() => {
    if (condition()) {
      repeated.stop();
      resolver?.();
    }
  }, {
    errorCallback() {
      rejecter?.();
    },
    count: options?.count,
    interval: options?.interval,
    timeout: options?.timeout
  });
  const promise = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  const instance = Object.create({
    stop() {
      if (repeated.active) {
        repeated.stop();
        rejecter?.();
      }
    },
    then(resolve, reject) {
      repeated.start();
      return promise.then(resolve, reject);
    }
  });
  return instance;
}
var work = function(type, timer2, state, options) {
  if (type === "start" && state.active || type === "stop" && !state.active) {
    return timer2;
  }
  const { afterCallback, count, errorCallback, interval, timeout } = options;
  if (typeof state.frame === "number") {
    cancelAnimationFrame(state.frame);
    afterCallback?.(false);
  }
  if (type === "stop") {
    state.active = false;
    state.frame = undefined;
    return timer2;
  }
  state.active = true;
  const isRepeated2 = count > 0;
  const total = count === Number.POSITIVE_INFINITY ? timeout : count * (interval > 0 ? interval : 17);
  let current;
  let start;
  let index = 0;
  function finish(finished, error) {
    state.active = false;
    state.frame = undefined;
    if (error) {
      errorCallback?.();
    }
    afterCallback?.(finished);
  }
  function step(timestamp) {
    if (!state.active) {
      return;
    }
    current ??= timestamp;
    start ??= timestamp;
    const elapsed = timestamp - current;
    const finished = elapsed >= total;
    if (finished || elapsed - 2 < interval && interval < elapsed + 2) {
      if (state.active) {
        state.callback(isRepeated2 ? index : undefined);
      }
      index += 1;
      switch (true) {
        case (!finished && timestamp - start >= timeout):
          finish(false, true);
          return;
        case (!finished && index < count):
          current = null;
          break;
        default:
          finish(true, false);
          return;
      }
    }
    state.frame = requestAnimationFrame(step);
  }
  state.frame = requestAnimationFrame(step);
  return timer2;
};
export {
  when,
  wait,
  repeat,
  isWaited,
  isTimer,
  isRepeated
};
