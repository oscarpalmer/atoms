import {
	clearTimer,
	LIMITER_NAME_ASYNC,
	LIMITER_NAME_SYNC,
	LIMITER_OFFSET,
	LIMITER_SYMBOL,
	LIMITER_THROTTLE,
	LimiterError,
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
import {isThenable} from '../is';
import {swallow} from '../promise';
import {attempt} from '../result/attempt';
import {noop} from './misc';

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
		name: LIMITER_NAME_ASYNC,
		parameters: [],
		throttle: type === LIMITER_THROTTLE,
	};
}

AsyncLimiter.prototype.cancel = cancelAsyncLimiter;
AsyncLimiter.prototype.run = runAsyncLimiter;

function Limiter(this: any, type: LimiterType, callback: GenericCallback, time?: number): void {
	this[LIMITER_SYMBOL] = {
		callback,
		type,
		interval: getNumberOrDefault(time, 0),
		name: LIMITER_NAME_SYNC,
		parameters: [],
		throttle: type === LIMITER_THROTTLE,
	};
}

Limiter.prototype.cancel = cancelLimiter;
Limiter.prototype.run = runLimiter;

// #endregion

// #region Functions

function cancelAsyncLimiter(this: InternalAsyncLimiter): void {
	const state = this[LIMITER_SYMBOL];

	if (state.last != null && !state.last.running) {
		state.last.reject(new LimiterError());

		state.last = undefined;
	}

	if (state.timer != null) {
		clearTimer(state.timer);
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
	// @ts-expect-error Using old school function constructor, so all good, no worries :-)
	return new AsyncLimiter(type, callback, time);
}

export function getLimiter<Callback extends GenericCallback>(
	type: LimiterType,
	callback: Callback,
	time?: number,
): Limiter<Callback> {
	// @ts-expect-error Using old school function constructor, so all good, no worries :-)
	return new Limiter(type, callback, time);
}

async function handleAsyncLimiter(state: AsyncLimiterState, item: AsyncLimiterItem): Promise<void> {
	const now = performance.now();

	state.start ??= now;

	if (state.interval === 0 || now - state.start >= state.interval - LIMITER_OFFSET) {
		state.start = state.throttle ? now : undefined;

		item.running = true;

		(await attempt(async () => await state.callback(...item.parameters))).match({
			error: item.reject,
			ok: item.resolve,
		});

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

		const result = state.callback(...state.parameters);

		if (isThenable(result)) {
			swallow(result);
		}
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

	void next.promise.catch(noop);

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
