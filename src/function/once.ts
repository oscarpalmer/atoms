import {assert} from '../internal/function/assert';
import {
	ONCE_MESSAGE_CLEARED,
	ONCE_MESSAGE_EXPECTATION,
	ONCE_NAME_ASYNC,
	ONCE_NAME_SYNC,
	ONCE_PROPERTY,
	ONCE_SYMBOL,
	type AsyncOnce,
	type AsyncOnceState,
	type InternalAsyncOnce,
	type InternalOnce,
	type Once,
} from '../models/function/once.model';
import type {GenericAsyncCallback, GenericCallback} from '../models/index';

// #region Instances

function AsyncOnce(this: any, callback: GenericAsyncCallback): void {
	this[ONCE_SYMBOL] = {
		callback,
		called: false,
		cleared: false,
		error: false,
		finished: false,
		items: [],
		value: undefined,
	};
}

AsyncOnce.prototype[ONCE_PROPERTY] = ONCE_NAME_ASYNC;

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
		value: undefined,
	};
}

Once.prototype[ONCE_PROPERTY] = ONCE_NAME_SYNC;

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

/**
 * Create an asynchronous function that can only be called once, rejecting or resolving the same result on subsequent calls
 *
 * _Available as `asyncOnce` and `once.async`_
 *
 * @param callback Callback to use once
 * @returns _Once_ callback
 */
export function asyncOnce<Callback extends GenericAsyncCallback>(
	callback: Callback,
): AsyncOnce<Callback> {
	assert(() => typeof callback === 'function', ONCE_MESSAGE_EXPECTATION);

	// @ts-expect-error All good, no worries :-)
	return new AsyncOnce(callback);
}

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
	return isOnceInstance(value, ONCE_NAME_ASYNC);
}

/**
 * Is the value a once callback?
 *
 * @param value Value to check
 * @returns `true` if the value is a once callback, otherwise `false`
 */
export function isOnce(value: unknown): boolean {
	return isOnceInstance(value, ONCE_NAME_SYNC);
}

function isOnceInstance(value: unknown, name: string): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		ONCE_PROPERTY in value &&
		value[ONCE_PROPERTY] === name
	);
}

/**
 * Create a function that can only be called once, returning the same value on subsequent calls
 *
 * @param callback Callback to use once
 * @returns _Once_ callback
 */
export function once<Callback extends GenericCallback>(callback: Callback): Once<Callback> {
	assert(() => typeof callback === 'function', ONCE_MESSAGE_EXPECTATION);

	// @ts-expect-error All good, no worries :-)
	return new Once(callback);
}

function runOnce(this: InternalOnce, ...parameters: unknown[]): unknown {
	const state = this[ONCE_SYMBOL];

	if (state.cleared) {
		throw new Error(ONCE_MESSAGE_CLEARED);
	}

	if (state.called) {
		return state.value;
	}

	state.called = true;

	state.value = state.callback(...parameters);

	return state.value;
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

		void state
			.callback(...parameters)
			.then(value => {
				handleOnceResult(state, value, false);
			})
			.catch(error => {
				handleOnceResult(state, error, true);
			});
	});
}

// #endregion

// #region Namespace

export declare namespace asyncOnce {
	export var is: typeof isAsyncOnce;
}

export declare namespace once {
	export var async: typeof asyncOnce;
	export var is: typeof isOnce;
	export var isAsync: typeof isAsyncOnce;
}

// #endregion

// #region Initialization

asyncOnce.is = isAsyncOnce;

once.async = asyncOnce;
once.is = isOnce;
once.isAsync = isAsyncOnce;

// #endregion

// #region Exports

export type {AsyncOnce, Once};

// #endregion
