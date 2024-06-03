// src/js/timer.ts
var getValueOrDefault = function(value, defaultValue) {
  return typeof value === "number" && value > 0 ? value : defaultValue;
};
var is = function(value, pattern) {
  return pattern.test(value?.$timer);
};
function isRepeated(value) {
  return is(value, /^repeat$/);
}
function isTimer(value) {
  return is(value, /^repeat|wait$/);
}
function isWaited(value) {
  return is(value, /^wait$/);
}
function isWhen(value) {
  return is(value, /^when$/) && typeof value.then === "function";
}
function repeat(callback, options) {
  return timer("repeat", callback, options ?? {}).start();
}
var timer = function(type, callback, partial) {
  const isRepeated2 = type === "repeat";
  const options = {
    afterCallback: partial.afterCallback,
    count: getValueOrDefault(partial.count, isRepeated2 ? Number.POSITIVE_INFINITY : 1),
    errorCallback: partial.errorCallback,
    interval: getValueOrDefault(partial.interval, 0),
    timeout: getValueOrDefault(partial.timeout, isRepeated2 ? Number.POSITIVE_INFINITY : 30000)
  };
  const state = {
    callback,
    active: false
  };
  const instance = Object.create({
    continue() {
      return work("continue", this, state, options, isRepeated2);
    },
    pause() {
      return work("pause", this, state, options, isRepeated2);
    },
    restart() {
      return work("restart", this, state, options, isRepeated2);
    },
    start() {
      return work("start", this, state, options, isRepeated2);
    },
    stop() {
      return work("stop", this, state, options, isRepeated2);
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
  return timer("wait", callback, options == null || typeof options === "number" ? {
    interval: options
  } : options).start();
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
    continue() {
      repeated.continue();
    },
    pause() {
      repeated.pause();
    },
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
  Object.defineProperties(instance, {
    $timer: {
      get() {
        return "when";
      }
    },
    active: {
      get() {
        return repeated.active;
      }
    }
  });
  return instance;
}
var work = function(type, timer2, state, options, isRepeated2) {
  if (["continue", "start"].includes(type) && state.active || ["pause", "stop"].includes(type) && !state.active) {
    return timer2;
  }
  const { count, interval, timeout } = options;
  if (["pause", "stop"].includes(type)) {
    activeTimers.delete(timer2);
    cancelAnimationFrame(state.frame);
    options.afterCallback?.(false);
    state.active = false;
    state.frame = undefined;
    if (type === "stop") {
      state.elapsed = undefined;
      state.index = undefined;
    }
    return timer2;
  }
  state.active = true;
  const canTimeout = timeout > 0 && timeout < Number.POSITIVE_INFINITY;
  const elapsed = type === "continue" ? +(state.elapsed ?? 0) : 0;
  let index = type === "continue" ? +(state.index ?? 0) : 0;
  state.elapsed = elapsed;
  state.index = index;
  const total = (count === Number.POSITIVE_INFINITY ? timeout : (count - index) * (interval > 0 ? interval : 62.5)) - elapsed;
  let current;
  let start;
  function finish(finished, error) {
    activeTimers.delete(timer2);
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
    if (finished || time - 2 < interval && interval < time + 2) {
      if (state.active) {
        state.callback(isRepeated2 ? index : undefined);
      }
      index += 1;
      state.index = index;
      switch (true) {
        case (canTimeout && !finished && timestamp - start >= timeout - elapsed):
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
  activeTimers.add(timer2);
  state.frame = requestAnimationFrame(step);
  return timer2;
};
var activeTimers = new Set;
var hiddenTimers = new Set;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    for (const timer2 of activeTimers) {
      hiddenTimers.add(timer2);
      timer2.pause();
    }
  } else {
    for (const timer2 of hiddenTimers) {
      timer2.continue();
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
  isRepeated
};
