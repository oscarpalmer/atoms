declare global {
	var _atomic_queued: Set<() => void>;
}

if (globalThis._atomic_queued == null) {
	const queued = new Set<() => void>();

	Object.defineProperty(globalThis, '_atomic_queued', {
		get() {
			return queued;
		},
	});
}

/**
 * Queues a callback to be executed at the next best time
 */
export function queue(callback: () => void): void {
	_atomic_queued.add(callback);

	if (_atomic_queued.size > 0) {
		queueMicrotask(() => {
			const callbacks = [..._atomic_queued];
			const {length} = callbacks;

			_atomic_queued.clear();

			for (let index = 0; index < length; index += 1) {
				callbacks[index]();
			}
		});
	}
}
