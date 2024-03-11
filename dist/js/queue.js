// src/js/queue.ts
function queue(callback) {
  queued.add(callback);
  if (queued.size > 0) {
    queueMicrotask(() => {
      const callbacks = Array.from(queued);
      queued.clear();
      for (const callback2 of callbacks) {
        callback2();
      }
    });
  }
}
var queued = new Set;
export {
  queue
};
