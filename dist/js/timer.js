// src/js/timer.ts
function repeat(callback, options) {
  const count = typeof options?.count === "number" ? options.count : Number.POSITIVE_INFINITY;
  return new Timer(callback, { ...options ?? {}, ...{ count } }).start();
}
function wait(callback, time) {
  return new Timer(callback, {
    count: 1,
    interval: time
  }).start();
}
var work = function(type, timer, state, options) {
  if (type === "start" && timer.active || type === "stop" && !timer.active) {
    return timer;
  }
  const { afterCallback, callback, count, interval } = options;
  if (typeof state.frame === "number") {
    cancelAnimationFrame(state.frame);
    afterCallback?.(false);
  }
  if (type === "stop") {
    state.active = false;
    state.frame = undefined;
    return timer;
  }
  state.active = true;
  const isRepeated = count > 0;
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
        callback(isRepeated ? index : undefined);
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
  return timer;
};
var milliseconds = 0;

class Timer {
  get active() {
    return this.state.active;
  }
  constructor(callback, options) {
    this.options = {
      afterCallback: options.afterCallback,
      callback,
      count: typeof options.count === "number" && options.count > 0 ? options.count : 1,
      interval: typeof options.interval === "number" && options.interval >= 0 ? options.interval : 0
    };
    this.state = {
      active: false
    };
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
(() => {
  let start;
  function fn(time) {
    if (start === undefined) {
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
  Timer
};
