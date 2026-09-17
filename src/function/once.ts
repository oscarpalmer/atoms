import {assert} from '../internal/function/assert';
import type {OnceAsync as AsyncOnce, GenericAsyncCallback, GenericCallback, Once} from '../models';

// #region Special variables

const ONCE_NAME_ASYNC = 'asyncOnce';

const ONCE_NAME_SYNC = 'once';

const ONCE_PROPERTY = '$once';

// #endregion

// #region Types

type InternalOnceAsync = {
	[ONCE_SYMBOL]: OnceAsyncState<unknown>;
} & AsyncOnce<GenericAsyncCallback>;

type InternalOnce = {
	[ONCE_SYMBOL]: OnceState<unknown>;
} & Once<GenericCallback>;

type OnceAsyncItem<Value> = {
	reject: (reason?: unknown) => void;
	resolve: (value: Value) => void;
};

type OnceAsyncState<Value> = {
	error: boolean;
	finished: boolean;
	items: Array<OnceAsyncItem<Value>>;
} & OnceState<Value, GenericAsyncCallback>;

type OnceState<Value, Callback = GenericCallback> = {
	callback: Callback;
	called: boolean;
	cleared: boolean;
	value: Value;
};

// #endregion

// #region Instances

function AsyncOnce(this: any, callback: GenericAsyncCallback) {
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

function Once(this: any, callback: GenericCallback) {
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

function clearOnce(this: InternalOnce | InternalOnceAsync): void {
	const state = this[ONCE_SYMBOL];

	if (!state.called || state.cleared) {
		return;
	}

	state.callback = undefined as never;
	state.cleared = true;
	state.value = undefined as never;
}

function getAsyncOnceError(this: InternalOnceAsync): boolean {
	return this[ONCE_SYMBOL].error;
}

function getAsyncOnceFinished(this: InternalOnceAsync): boolean {
	return this[ONCE_SYMBOL].finished;
}

function getOnceCalled(this: InternalOnce | InternalOnceAsync): boolean {
	return this[ONCE_SYMBOL].called;
}

function getOnceCleared(this: InternalOnce | InternalOnceAsync): boolean {
	return this[ONCE_SYMBOL].cleared;
}

function handleOnceResult<Value>(state: OnceAsyncState<Value>, value: Value, error: boolean): void {
	state.error = error;
	state.finished = true;
	state.value = value;

	const items = state.items.splice(0);
	const {length} = items;

	for (let index = 0; index < length; index += 1) {
		const {reject, resolve} = items[index];

		if (error) {
			reject(value);
		} else {
			resolve(value);
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

function runOnceAsync(this: InternalOnceAsync, ...parameters: unknown[]): Promise<unknown> {
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

// #region Variables

const ONCE_MESSAGE_CLEARED = 'Once has been cleared';

const ONCE_MESSAGE_EXPECTATION = 'Once expected a function';

const ONCE_SYMBOL = Symbol(ONCE_PROPERTY);

// #endregion

// #region Initialization

asyncOnce.is = isAsyncOnce;

once.async = asyncOnce;
once.is = isOnce;
once.isAsync = isAsyncOnce;

// #endregion
