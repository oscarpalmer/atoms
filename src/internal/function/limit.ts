import {
	clearTimer,
	LIMITER_NAME_ASYNC,
	LIMITER_NAME_SYNC,
	LIMITER_OFFSET,
	LIMITER_PROPERTY,
	LIMITER_SYMBOL,
	LIMITER_THROTTLE,
	startTimer,
	type AsyncLimiter,
	type AsyncLimiterItem,
	type AsyncLimiterState,
	type InternalAsyncLimiter,
	type InternalLimiter,
	type Limiter,
	type LimiterState,
	type LimiterType,
} from '../../models/function/limiter.model';
import type {GenericAsyncCallback, GenericCallback} from '../../models/index';
import {getNumberOrDefault} from '../defaults';
import {asyncAttempt} from '../result/attempt';

// #region Instances

function AsyncLimiter(
	this: any,
	type: LimiterType,
	callback: GenericAsyncCallback,
	time?: number,
): void {
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

function Limiter(this: any, type: LimiterType, callback: GenericCallback, time?: number): void {
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

		const result = await asyncAttempt(async () => {
			let value = state.callback(...item.parameters);

			if (value instanceof Promise) {
				value = await value;
			}

			return value;
		});

		if (result.ok) {
			item.resolve(result.value);
		} else {
			item.reject(result.error);
		}

		item.running = false;
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
