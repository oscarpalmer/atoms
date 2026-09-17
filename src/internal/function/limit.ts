import type {GenericAsyncCallback, GenericCallback} from '../../models';
import {getNumberOrDefault} from '../defaults';

// #region Special variables

const LIMITER_NAME_ASYNC = 'asyncLimiter';

const LIMITER_NAME_SYNC = 'limiter';

const LIMITER_PROPERTY = '$limiter';

// #endregion

// #region Types

type AsyncLimiterItem = {
	parameters: unknown[];
	promise: Promise<unknown>;
	reject: (reason?: unknown) => void;
	resolve: (value?: unknown) => void;
	running: boolean;
};

/**
 * An asynchronous function that can be cancelled
 */
export type AsyncLimiter<Callback extends GenericAsyncCallback> = {
	/**
	 * Cancel the function
	 */
	cancel(): void;
	/**
	 * Call the function
	 *
	 * @param parameters Function parameters
	 * @returns Function result
	 */
	run(...parameters: Parameters<Callback>): Promise<ReturnType<Callback>>;
};

type AsyncLimiterState = {
	last?: AsyncLimiterItem;
} & LimiterState<GenericAsyncCallback>;

type InternalAsyncLimiter = {
	[LIMITER_SYMBOL]: AsyncLimiterState;
} & AsyncLimiter<GenericAsyncCallback>;

type InternalLimiter = {
	[LIMITER_SYMBOL]: LimiterState;
} & Limiter<GenericCallback>;

/**
 * A function that can be cancelled
 */
export type Limiter<Callback extends GenericCallback> = {
	/**
	 * Cancel the function
	 */
	cancel(): void;
	/**
	 * Call the function
	 *
	 * @param parameters Function parameters
	 * @returns Function result
	 */
	run(...parameters: Parameters<Callback>): ReturnType<Callback>;
};

type LimiterState<Callback = GenericCallback> = {
	callback: Callback;
	interval: number;
	parameters: unknown[];
	start?: number;
	throttle: boolean;
	timer?: number;
	type: LimiterType;
};

type LimiterType = 'debounce' | 'throttle' | 'wait';

// #endregion

// #region Instances

function AsyncLimiter(this: any, type: LimiterType, callback: GenericAsyncCallback, time?: number) {
	this[LIMITER_SYMBOL] = {
		callback,
		type,
		interval: getNumberOrDefault(time, 0),
		parameters: [],
		throttle: type === LIMITER_THROTTLE,
	};
}

AsyncLimiter.prototype[LIMITER_PROPERTY] = LIMITER_NAME_ASYNC;

AsyncLimiter.prototype.cancel = cancelAsyncLimiter;
AsyncLimiter.prototype.run = runAsyncLimiter;

function Limiter(this: any, type: LimiterType, callback: GenericCallback, time?: number) {
	this[LIMITER_SYMBOL] = {
		callback,
		type,
		interval: getNumberOrDefault(time, 0),
		parameters: [],
		throttle: type === LIMITER_THROTTLE,
	};
}

Limiter.prototype[LIMITER_PROPERTY] = LIMITER_NAME_SYNC;

Limiter.prototype.cancel = cancelLimiter;
Limiter.prototype.run = runLimiter;

// #endregion

// #region Functions

function cancelAsyncLimiter(this: InternalAsyncLimiter): void {
	const state = this[LIMITER_SYMBOL];

	if (state.timer != null) {
		clearTimer(state.timer);
	}

	if (state.last != null && !state.last.running) {
		state.last.reject();

		state.last = undefined;
	}
}

function cancelLimiter(this: InternalLimiter): void {
	const {timer} = this[LIMITER_SYMBOL];

	if (timer != null) {
		clearTimer(timer);
	}
}

export function getAsyncLimiter<Callback extends GenericAsyncCallback | GenericCallback>(
	type: LimiterType,
	callback: Callback,
	time?: number,
): AsyncLimiter<Callback> {
	// @ts-expect-error All good, no worries :-)
	return new AsyncLimiter(type, callback, time);
}

export function getLimiter<Callback extends GenericCallback>(
	type: LimiterType,
	callback: Callback,
	time?: number,
): Limiter<Callback> {
	// @ts-expect-error All good, no worries :-)
	return new Limiter(type, callback, time);
}

async function handleAsyncLimiter(state: AsyncLimiterState, item: AsyncLimiterItem): Promise<void> {
	const now = performance.now();

	state.start ??= now;

	if (state.interval === 0 || now - state.start >= state.interval - LIMITER_OFFSET) {
		state.start = state.throttle ? now : undefined;

		item.running = true;

		try {
			let result = state.callback(...item.parameters);

			if (result instanceof Promise) {
				result = await result;
			}

			item.resolve(result);
		} catch (error) {
			item.reject(error);
		} finally {
			item.running = false;
		}
	} else {
		state.timer = startTimer(() => handleAsyncLimiter(state, item));
	}
}

function handleLimiter(state: LimiterState): void {
	const now = performance.now();

	state.start ??= now;

	if (state.interval === 0 || now - state.start >= state.interval - LIMITER_OFFSET) {
		state.start = state.throttle ? now : undefined;

		state.callback(...state.parameters);
	} else {
		state.timer = startTimer(() => handleLimiter(state));
	}
}

function runAsyncLimiter(this: InternalAsyncLimiter): Promise<unknown> {
	const state = this[LIMITER_SYMBOL];

	cancelAsyncLimiter.call(this);

	const next: AsyncLimiterItem = {
		parameters: state.parameters,
		running: false,
	} as never;

	next.promise = new Promise<unknown>((resolve, reject) => {
		next.reject = reject;
		next.resolve = resolve;
	});

	state.last = next;

	if (state.throttle) {
		void handleAsyncLimiter(state, next);
	} else {
		state.timer = startTimer(() => handleAsyncLimiter(state, next));
	}

	return next.promise;
}

function runLimiter(this: InternalLimiter, ...parameters: unknown[]): void {
	const state = this[LIMITER_SYMBOL];

	cancelLimiter.call(this);

	state.parameters = parameters;

	if (state.throttle) {
		handleLimiter(state);
	} else {
		state.timer = startTimer(() => handleLimiter(state));
	}
}

// #endregion

// #region Variables

export const LIMITER_DEBOUNCE: LimiterType = 'debounce';

const LIMITER_OFFSET = 5;

const LIMITER_SYMBOL = Symbol('limiter');

export const LIMITER_THROTTLE: LimiterType = 'throttle';

export const LIMITER_WAIT: LimiterType = 'wait';

// istanbul ignore next
const clearTimer = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;

// istanbul ignore next
const startTimer = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout;

// #endregion
