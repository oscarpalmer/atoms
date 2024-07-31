import {noop} from '../function';
import type {WhenOptions, WhenState} from './models';
import {BasicTimer, timer} from './timer';

export class When extends BasicTimer<WhenState> {
	get active() {
		return this.state.timer.active;
	}

	get paused() {
		return this.state.timer.paused;
	}

	constructor(state: WhenState) {
		super('when', state);
	}

	/**
	 * Continues the timer _(if it was paused)_
	 */
	continue(): When {
		this.state.timer.continue();

		return this;
	}

	/**
	 * Pauses the timer _(if it was running)_
	 */
	pause(): When {
		this.state.timer.pause();

		return this;
	}

	/**
	 * Stops the timer _(if it was running)_
	 */
	stop(): When {
		if (this.state.timer.active) {
			this.state.timer.stop();

			this.state.rejecter?.();
		}

		return this;
	}

	/**
	 * Starts the timer and returns a promise that resolves when the condition is met
	 */

	// biome-ignore lint/suspicious/noThenProperty: returning a promise-like object, so it's ok ;)
	then(
		resolve?: (() => void) | null,
		reject?: (() => void) | null,
	): Promise<void> {
		this.state.timer.start();

		return this.state.promise.then(resolve ?? noop, reject ?? noop);
	}
}

/**
 * - Creates a promise that resolves when a condition is met
 * - If the condition is never met in a timely manner, the promise will reject
 */
export function when(
	condition: () => boolean,
	options?: Partial<WhenOptions>,
): When {
	const repeated = timer(
		'repeat',
		() => {
			if (condition()) {
				repeated.stop();

				state.resolver?.();
			}
		},
		{
			afterCallback() {
				if (!repeated.paused) {
					if (condition()) {
						state.resolver?.();
					} else {
						state.rejecter?.();
					}
				}
			},
			errorCallback() {
				state.rejecter?.();
			},
			count: options?.count,
			interval: options?.interval,
			timeout: options?.timeout,
		},
		false,
	);

	const state: WhenState = {} as never;

	state.promise = new Promise((resolve, reject) => {
		state.resolver = resolve;
		state.rejecter = reject;
	});

	state.timer = repeated;

	return new When(state);
}
