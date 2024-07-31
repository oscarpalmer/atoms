import {noop} from '../function';
import {activeTimers, hiddenTimers} from './constants';
import {wait} from './timer';

declare global {
	var _atomic_timer_debug: boolean | undefined;
	var _atomic_timers: Timer[] | undefined;
}

if (globalThis._atomic_timers == null) {
	Object.defineProperty(globalThis, '_atomic_timers', {
		get() {
			return globalThis._atomic_timer_debug ? [...activeTimers] : [];
		},
	});
}

/**
 * Creates a delayed promise that resolves after a certain amount of time _(or rejects when timed out)_
 */
export function delay(time: number, timeout?: number): Promise<void> {
	return new Promise((resolve, reject) => {
		wait(resolve ?? noop, {
			timeout,
			errorCallback: reject ?? noop,
			interval: time,
		});
	});
}

document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		for (const timer of activeTimers) {
			hiddenTimers.add(timer);
			timer.pause();
		}
	} else {
		for (const timer of hiddenTimers) {
			timer.continue();
		}

		hiddenTimers.clear();
	}
});

export {isRepeated, isTimer, isWaited, isWhen} from './is';
export {repeat, wait, type Timer} from './timer';
export {when, type When} from './when';

