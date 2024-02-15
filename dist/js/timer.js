// src/js/timer.ts
function repeat(callback, options) {
  const count = typeof options?.count === "number" ? options.count : Infinity;
  return timer(callback, { ...{ count }, ...options ?? {} }).start();
}
var timer = function(callback, config) {
  const options = {
    afterCallback: typeof config.afterCallback === "function" ? config.afterCallback : undefined,
    callback,
    count: typeof config.count === "number" && config.count >= 1 ? config.count : 1,
    interval: typeof config.interval === "number" && config.interval >= 0 ? config.interval : 0
  };
  const state = {
    active: false
  };
  const timer2 = Object.create(null);
  Object.defineProperties(timer2, {
    active: {
      get() {
        return state.active;
      }
    },
    restart: {
      value() {
        return work("restart", timer2, state, options);
      }
    },
    start: {
      value() {
        return work("start", timer2, state, options);
      }
    },
    stop: {
      value() {
        return work("stop", timer2, state, options);
      }
    }
  });
  return timer2;
};
function wait(callback, time) {
  return timer(callback, {
    count: 1,
    interval: time
  }).start();
}
var work = function(type, timer2, state, options) {
  if (type === "start" && timer2.active || type === "stop" && !timer2.active) {
    return timer2;
  }
  const { afterCallback, callback, count, interval } = options;
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
  const isRepeated = count > 0;
  const milliseconds = 16.666666666666668;
  let index = 0;
  let start;
  function step(timestamp) {
    if (!state.active) {
      return;
    }
    start ??= timestamp;
    const elapsed = timestamp - start;
    const maximum = elapsed + milliseconds;
    const minimum = elapsed - milliseconds;
    if (minimum < interval && interval < maximum) {
      if (state.active) {
        callback(isRepeated ? index : undefined);
      }
      index += 1;
      if (index < count) {
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
export {
  wait,
  repeat
};
