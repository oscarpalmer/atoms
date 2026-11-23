import {assert} from '../internal/function/assert';
import {isAsyncFunction, isThenable} from '../internal/is';
import {swallow} from '../internal/promise';
import {
	ONCE_MESSAGE_CALLBACK,
	ONCE_MESSAGE_CLEARED,
	ONCE_MESSAGE_PROMISE,
	ONCE_NAME_ASYNC,
	ONCE_NAME_SYNC,
	ONCE_SYMBOL,
	type AsyncOnce,
	type AsyncOnceState,
	type InternalAsyncOnce,
	type InternalOnce,
	type Once,
} from '../models/function/once.model';
import type {
	GenericAsyncCallback,
	GenericCallback,
	GenericSyncCallback,
	PlainObject,
} from '../models/misc.model';

// #region Instances

function AsyncOnce(this: any, callback: GenericAsyncCallback): void {
	this[ONCE_SYMBOL] = {
		callback,
		called: false,
		cleared: false,
		error: false,
		finished: false,
		items: [],
		type: ONCE_NAME_ASYNC,
		value: undefined,
	};
}

AsyncOnce.prototype.clear = clearOnce;
AsyncOnce.prototype.run = runOnceAsync;

Object.defineProperties(AsyncOnce.prototype, {
	called: {
		enumerable: true,
		get: getOnceCalled,
	},
	cleared: {
		enumerable: true,
		get: getOnceCleared,
	},
	error: {
		enumerable: true,
		get: getAsyncOnceError,
	},
	finished: {
		enumerable: true,
		get: getAsyncOnceFinished,
	},
});

function Once(this: any, callback: GenericCallback): void {
	this[ONCE_SYMBOL] = {
		callback,
		called: false,
		cleared: false,
		type: ONCE_NAME_SYNC,
		value: undefined,
	};
}

Once.prototype.clear = clearOnce;
Once.prototype.run = runOnce;

Object.defineProperties(Once.prototype, {
	called: {
		enumerable: true,
		get: getOnceCalled,
	},
	cleared: {
		enumerable: true,
		get: getOnceCleared,
	},
});

// #endregion

// #region Functions

function clearOnce(this: InternalOnce | InternalAsyncOnce): void {
	const state = this[ONCE_SYMBOL];

	if (!state.called || state.cleared) {
		return;
	}

	state.callback = undefined as never;
	state.cleared = true;
	state.value = undefined as never;
}

function getAsyncOnceError(this: InternalAsyncOnce): boolean {
	return this[ONCE_SYMBOL].error;
}

function getAsyncOnceFinished(this: InternalAsyncOnce): boolean {
	return this[ONCE_SYMBOL].finished;
}

function getOnceCalled(this: InternalOnce | InternalAsyncOnce): boolean {
	return this[ONCE_SYMBOL].called;
}

function getOnceCleared(this: InternalOnce | InternalAsyncOnce): boolean {
	return this[ONCE_SYMBOL].cleared;
}

function handleOnceResult<Value>(state: AsyncOnceState<Value>, value: Value, error: boolean): void {
	state.error = error;
	state.finished = true;
	state.value = value;

	const items = state.items.splice(0);
	const {length} = items;

	for (let index = 0; index < length; index += 1) {
		const item = items[index];

		if (error) {
			item.reject(value);
		} else {
			item.resolve(value);
		}
	}
}

/**
 * Is the value an asynchronous once callback?
 *
 * @param value Value to check
 * @returns `true` if the value is an asynchronous once callback, otherwise `false`
 */
export function isAsyncOnce(value: unknown): boolean {
	return isOnceInstance(ONCE_NAME_ASYNC, value);
}

/**
 * Is the value a once callback?
 *
 * @param value Value to check
 * @returns `true` if the value is a once callback, otherwise `false`
 */
export function isOnce(value: unknown): boolean {
	return isOnceInstance(ONCE_NAME_SYNC, value);
}

function isOnceInstance(type: string, value: unknown): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		ONCE_SYMBOL in value &&
		(value[ONCE_SYMBOL] as PlainObject).type === type
	);
}

/**
 * Create an asynchronous function that can only be called once, rejecting or resolving the same result on subsequent calls
 *
 * @param callback Callback to use once
 * @returns _Once_ callback
 */
export function once<Callback extends GenericAsyncCallback>(
	callback: Callback,
): AsyncOnce<Callback>;

/**
 * Create a function that can only be called once, returning the same value on subsequent calls
 *
 * @param callback Callback to use once
 * @returns _Once_ callback
 */
export function once<Callback extends GenericSyncCallback>(callback: Callback): Once<Callback>;

export function once(
	callback: GenericCallback,
): Once<GenericCallback> | AsyncOnce<GenericAsyncCallback> {
	assert(() => typeof callback === 'function', ONCE_MESSAGE_CALLBACK);

	const ctor = isAsyncFunction(callback) ? AsyncOnce : Once;

	// @ts-expect-error Using old school function constructor, so all good, no worries :-)
	return new ctor(callback);
}

function runOnce(this: InternalOnce, ...parameters: unknown[]): unknown {
	const state = this[ONCE_SYMBOL];

	if (state.cleared) {
		throw new Error(ONCE_MESSAGE_CLEARED);
	}

	if (state.called) {
		return state.value;
	}

	const value = state.callback(...parameters);

	if (isThenable(value)) {
		swallow(value);

		throw new Error(ONCE_MESSAGE_PROMISE);
	}

	state.called = true;
	state.value = value;

	return value;
}

function runOnceAsync(this: InternalAsyncOnce, ...parameters: unknown[]): Promise<unknown> {
	const state = this[ONCE_SYMBOL];

	if (state.cleared) {
		return Promise.reject(new Error(ONCE_MESSAGE_CLEARED));
	}

	if (state.finished) {
		return state.error ? Promise.reject(state.value) : Promise.resolve(state.value);
	}

	if (state.called) {
		return new Promise<unknown>((resolve, reject) => {
			state.items.push({reject, resolve});
		});
	}

	state.called = true;

	return new Promise<unknown>((resolve, reject) => {
		state.items.push({reject, resolve});

		void Promise.resolve(state.callback(...parameters)).then(
			value => {
				handleOnceResult(state, value as never, false);
			},
			error => {
				handleOnceResult(state, error, true);
			},
		);
	});
}

// #endregion

// #region Namespace

export declare namespace once {
	export var is: typeof isOnce;
	export var isAsync: typeof isAsyncOnce;
}

// #endregion

// #region Initialization

once.is = isOnce;
once.isAsync = isAsyncOnce;

// #endregion

// #region Exports

export type {AsyncOnce, Once};

// #endregion
