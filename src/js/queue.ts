const queued = new Set<() => void>();

/**
 * Queues a callback to be executed at the next best time
 */
export function queue(callback: () => void): void {
	queued.add(callback);

	if (queued.size > 0) {
		queueMicrotask(() => {
			const callbacks = Array.from(queued);

			queued.clear();

			for (const callback of callbacks) {
				callback();
			}
		});
	}
}
