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
  const count = typeof options?.count === "number" ? options.count : Number.POSITIVE_INFINITY;
  return timer("repeat", callback, { ...options ?? {}, ...{ count } }).start();
}
var timer = function(type, callback, options) {
  const extended = {
    afterCallback: options.afterCallback,
    count: typeof options.count === "number" && options.count > 0 ? options.count : 1,
    interval: typeof options.interval === "number" && options.interval >= 0 ? options.interval : 0
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
  return instance.start();
};
function wait(callback, time) {
  return timer("wait", callback, {
    count: 1,
    interval: time ?? 0
  });
}
var work = function(type, timer2, state, options) {
  if (type === "start" && state.active || type === "stop" && !state.active) {
    return timer2;
  }
  const { afterCallback, count, interval } = options;
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
  let index = 0;
  let total = count * interval;
  if (total < milliseconds) {
    total = milliseconds;
  }
  let start;
  function step(timestamp) {
    if (!state.active) {
      return;
    }
    start ??= timestamp;
    const elapsed = timestamp - start;
    const finished = elapsed >= total;
    if (finished || elapsed - 2 < interval && interval < elapsed + 2) {
      if (state.active) {
        state.callback(isRepeated2 ? index : undefined);
      }
      index += 1;
      if (!finished && index < count) {
        start = undefined;
      } else {
        state.active = false;
        state.frame = undefined;
        afterCallback?.(true);
        return;
      }
    }
    state.frame = requestAnimationFrame(step);
  }
  state.frame = requestAnimationFrame(step);
  return timer2;
};
var milliseconds = 0;
(() => {
  let start;
  function fn(time) {
    if (start == null) {
      start = time;
      requestAnimationFrame(fn);
    } else {
      milliseconds = time - start;
    }
  }
  requestAnimationFrame(fn);
})();
export {
  wait,
  repeat,
  isWaited,
  isTimer,
  isRepeated
};
