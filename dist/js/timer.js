// src/js/function.ts
function noop() {
}

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
  return timer("repeat", callback, options ?? {}, true);
}
var timer = function(type, callback, partial, start) {
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
    active: false,
    minimum: options.interval - options.interval % milliseconds / 2,
    paused: false
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
    },
    callback: {
      get() {
        return globalThis._atomic_timer_debug ? state.callback : undefined;
      }
    },
    paused: {
      get() {
        return state.paused;
      }
    }
  });
  if (start) {
    instance.start();
  }
  return instance;
};
function wait(callback, options) {
  return timer("wait", callback, options == null || typeof options === "number" ? {
    interval: options
  } : options, true);
}
function when(condition, options) {
  let rejecter;
  let resolver;
  const repeated = timer("repeat", () => {
    if (condition()) {
      repeated.stop();
      resolver?.();
    }
  }, {
    afterCallback() {
      if (!repeated.paused) {
        if (condition()) {
          resolver?.();
        } else {
          rejecter?.();
        }
      }
    },
    errorCallback() {
      rejecter?.();
    },
    count: options?.count,
    interval: options?.interval,
    timeout: options?.timeout
  }, false);
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
      return promise.then(resolve ?? noop, reject ?? noop);
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
  const { minimum } = state;
  if (["pause", "stop"].includes(type)) {
    const isStop = type === "stop";
    activeTimers.delete(timer2);
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
    return timer2;
  }
  state.active = true;
  state.paused = false;
  const canTimeout = timeout > 0 && timeout < Number.POSITIVE_INFINITY;
  const elapsed = type === "continue" ? +(state.elapsed ?? 0) : 0;
  let index = type === "continue" ? +(state.index ?? 0) : 0;
  state.elapsed = elapsed;
  state.index = index;
  const total = (count === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : (count - index) * (interval > 0 ? interval : milliseconds)) - elapsed;
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
    if (timestamp - start >= timeout - elapsed) {
      finish(finished, !finished);
      return;
    }
    if (finished || time >= minimum) {
      if (state.active) {
        state.callback(isRepeated2 ? index : undefined);
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
  activeTimers.add(timer2);
  state.frame = requestAnimationFrame(step);
  return timer2;
};
if (globalThis._atomic_timers == null) {
  Object.defineProperty(globalThis, "_atomic_timers", {
    get() {
      return globalThis._atomic_timer_debug ? [...activeTimers] : [];
    }
  });
}
var activeTimers = new Set;
var hiddenTimers = new Set;
var milliseconds = 16.666666666666668;
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
