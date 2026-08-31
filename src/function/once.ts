import {assert} from '../internal/function/assert';
import type {
	GenericAsyncCallback,
	GenericCallback,
	OnceAsyncCallback,
	OnceCallback,
} from '../models';

// #region Types

type OnceAsyncItem<Value> = {
	reject: (reason?: unknown) => void;
	resolve: (value: Value) => void;
};

type OnceAsyncState<Value> = {
	error: boolean;
	finished: boolean;
	items: OnceAsyncItem<Value>[];
} & OnceState<Value>;

type OnceState<Value> = {
	called: boolean;
	cleared: boolean;
	value: Value;
};

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
): OnceAsyncCallback<Callback> {
	assert(() => typeof callback === 'function', ONCE_MESSAGE_EXPECTATION);

	const state: OnceAsyncState<Awaited<ReturnType<Callback>>> = {
		called: false,
		cleared: false,
		error: false,
		finished: false,
		items: [],
		value: undefined as never,
	};

	const fn = (...parameters: Parameters<Callback>): Promise<Awaited<ReturnType<Callback>>> => {
		if (state.cleared) {
			return Promise.reject(new Error(ONCE_MESSAGE_CLEARED));
		}

		if (state.finished) {
			return state.error ? Promise.reject(state.value) : Promise.resolve(state.value);
		}

		if (state.called) {
			return new Promise<Awaited<ReturnType<Callback>>>((resolve, reject) => {
				state.items.push({reject, resolve});
			});
		}

		state.called = true;

		return new Promise<Awaited<ReturnType<Callback>>>((resolve, reject) => {
			state.items.push({reject, resolve});

			void callback(...parameters)
				.then(value => {
					handleOnceResult(state, value, false);
				})
				.catch(error => {
					handleOnceResult(state, error, true);
				});
		});
	};

	Object.defineProperties(fn, {
		called: {
			enumerable: true,
			get: (): boolean => state.called,
		},
		clear: {
			value: () => clearState(state),
		},
		cleared: {
			enumerable: true,
			get: (): boolean => state.cleared,
		},
		error: {
			enumerable: true,
			get: (): boolean => state.error,
		},
		finished: {
			enumerable: true,
			get: (): boolean => state.finished,
		},
	});

	return fn as OnceAsyncCallback<Callback>;
}

function clearState<Value>(state: OnceState<Value>): void {
	if (!state.called || state.cleared) {
		return;
	}

	state.cleared = true;
	state.value = undefined as never;
}

function handleOnceResult<Value>(
	state: OnceAsyncState<Value>,
	value: unknown,
	error: boolean,
): void {
	state.error = error;
	state.finished = true;
	state.value = value as Value;

	const items = state.items.splice(0);
	const {length} = items;

	for (let index = 0; index < length; index += 1) {
		const {reject, resolve} = items[index];

		if (error) {
			reject(value);
		} else {
			resolve(value as Value);
		}
	}
}

/**
 * Create a function that can only be called once, returning the same value on subsequent calls
 *
 * @param callback Callback to use once
 * @returns _Once_ callback
 */
export function once<Callback extends GenericCallback>(callback: Callback): OnceCallback<Callback> {
	assert(() => typeof callback === 'function', ONCE_MESSAGE_EXPECTATION);

	const state: OnceState<ReturnType<Callback>> = {
		called: false,
		cleared: false,
		value: undefined as never,
	};

	const fn = (...parameters: Parameters<Callback>): ReturnType<Callback> => {
		if (state.cleared) {
			throw new Error(ONCE_MESSAGE_CLEARED);
		}

		if (state.called) {
			return state.value;
		}

		state.called = true;

		state.value = callback(...parameters);

		return state.value;
	};

	Object.defineProperties(fn, {
		called: {
			enumerable: true,
			get: (): boolean => state.called,
		},
		clear: {
			value: () => clearState(state),
		},
		cleared: {
			enumerable: true,
			get: (): boolean => state.cleared,
		},
	});

	return fn as OnceCallback<Callback>;
}

// #endregion

// #region Variables

const ONCE_MESSAGE_CLEARED = 'Once has been cleared';

const ONCE_MESSAGE_EXPECTATION = 'Once expected a function';

// #endregion

// #region Initialization

once.async = asyncOnce;

Object.defineProperty(once, 'async', {
	value: asyncOnce,
});

// #endregion
