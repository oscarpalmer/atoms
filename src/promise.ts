// #region Types

import type {RequiredKeys} from './models';

type Data<Items extends unknown[]> = {
	last: number;
	result: Items | PromisesResult<Items>;
};

type FulfilledPromiseResult<Value> = {
	status: typeof TYPE_FULFILLED;
	value: Value;
};

type Handlers<Items extends unknown[]> = {
	resolve: (value: Items | PromisesResult<Items>) => void;
	reject: (reason: unknown) => void;
};

type Parameters<Items extends unknown[]> = {
	abort: () => void;
	complete: boolean;
	data: Data<Items>;
	handlers: Handlers<Items>;
	index: number;
	signal?: AbortSignal;
	value?: unknown;
};

type PromiseOptions = {
	/**
	 * AbortSignal for aborting the promise; when aborted, the promise will reject with the reason of the signal
	 */
	signal?: AbortSignal;
	/**
	 * How long to wait for (in milliseconds; defaults to `0`)
	 */
	time?: number;
};

/**
 * Promise handling strategy
 */
export type PromiseStrategy = 'complete' | 'first';

export class PromiseTimeoutError extends Error {
	constructor() {
		super(MESSAGE_TIMEOUT);

		this.name = ERROR_NAME;
	}
}

type Promises<Items extends unknown[]> = {
	[K in keyof Items]: Promise<Items[K]>;
};

type PromisesOptions = {
	signal?: AbortSignal;
	strategy?: PromiseStrategy;
};

type PromisesResult<Items extends unknown[]> = {
	[K in keyof Items]: PromisesResultItem<Items[K]>;
};

type PromisesResultItem<Value> = FulfilledPromiseResult<Value> | RejectedPromiseResult;

type RejectedPromiseResult = {
	status: typeof TYPE_REJECTED;
	reason: unknown;
};

// #endregion

// #region Functions

/**
 * Create a delayed promise that resolves after a certain amount of time, or rejects if aborted
 * @param options Options for the delay
 * @returns A delayed promise
 */
export function delay(options?: PromiseOptions): Promise<void>;

/**
 * Create a delayed promise that resolves after a certain amount of time
 * @param time How long to wait for _(in milliseconds; defaults to `0`)_
 * @returns A delayed promise
 */
export function delay(time?: number): Promise<void>;

export function delay(options?: unknown): Promise<void> {
	const {signal, time} = getPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	function abort(): void {
		clearTimeout(timeout);

		rejector(signal!.reason);
	}

	signal?.addEventListener('abort', abort, ABORT_OPTIONS);

	let rejector: (reason: unknown) => void;
	let timeout: ReturnType<typeof setTimeout>;

	return new Promise((resolve, reject) => {
		rejector = reject;

		timeout = setTimeout(() => {
			settlePromise(abort, resolve, undefined, signal);
		}, time);
	});
}

function getNumberOrDefault(value: unknown): number {
	return typeof value === 'number' && value > 0 ? value : 0;
}

function getPromiseOptions(input: unknown): RequiredKeys<PromiseOptions, 'time'> {
	if (typeof input === 'number') {
		return {
			time: getNumberOrDefault(input),
		};
	}

	if (input instanceof AbortSignal) {
		return {signal: input, time: 0};
	}

	const options = typeof input === 'object' && input !== null ? (input as PromiseOptions) : {};

	return {
		signal: options.signal instanceof AbortSignal ? options.signal : undefined,
		time: getNumberOrDefault(options.time),
	};
}

function getPromisesOptions(input: unknown): RequiredKeys<PromisesOptions, 'strategy'> {
	if (typeof input === 'string') {
		return {
			strategy: getStrategyOrDefault(input),
		};
	}

	if (input instanceof AbortSignal) {
		return {signal: input, strategy: DEFAULT_STRATEGY};
	}

	const options = typeof input === 'object' && input !== null ? (input as PromisesOptions) : {};

	return {
		signal: options.signal instanceof AbortSignal ? options.signal : undefined,
		strategy: getStrategyOrDefault(options.strategy),
	};
}

function getStrategyOrDefault(value: unknown): PromiseStrategy {
	return strategies.has(value as PromiseStrategy) ? (value as PromiseStrategy) : DEFAULT_STRATEGY;
}

async function getTimed<Value>(
	promise: Promise<Value>,
	time: number,
	signal?: AbortSignal,
): Promise<Value> {
	function abort(): void {
		clearTimeout(timeout);

		rejector(signal!.reason);
	}

	signal?.addEventListener(EVENT_NAME, abort, ABORT_OPTIONS);

	let rejector: (reason: unknown) => void;
	let timeout: ReturnType<typeof setTimeout>;

	return Promise.race<Value>([
		promise,
		new Promise((_, reject) => {
			rejector = reject;

			timeout = setTimeout(() => {
				settlePromise(abort, reject, new PromiseTimeoutError(), signal);
			}, time);
		}),
	]).then(value => {
		clearTimeout(timeout);

		signal?.removeEventListener(EVENT_NAME, abort);

		return value;
	});
}

function handleResult<Items extends unknown[]>(
	status: string,
	parameters: Parameters<Items>,
): void {
	const {abort, complete, data, handlers, index, signal, value} = parameters;

	if (signal?.aborted ?? false) {
		return;
	}

	if (!complete && status === TYPE_REJECTED) {
		settlePromise(abort, handlers.reject, value, signal);

		return;
	}

	(data.result as unknown[])[index] = !complete
		? value
		: status === TYPE_FULFILLED
			? {status, value}
			: {status, reason: value};

	if (index === data.last) {
		settlePromise(abort, handlers.resolve, data.result, signal);
	}
}

/**
 * Is the value a fulfilled promise result?
 * @param value Value to check
 * @returns `true` if the value is a fulfilled promise result, `false` otherwise
 */
export function isFulfilled<Value>(value: unknown): value is FulfilledPromiseResult<Value> {
	return isType(value, TYPE_FULFILLED);
}

/**
 * Is the value a rejected promise result?
 * @param value Value to check
 * @returns `true` if the value is a rejected promise result, `false` otherwise
 */
export function isRejected(value: unknown): value is RejectedPromiseResult {
	return isType(value, TYPE_REJECTED);
}

function isType(value: unknown, type: string): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		(value as PromisesResultItem<unknown>).status === type
	);
}

/**
 * Handle a list of promises, returning their results in an ordered array.
 *
 * Depending on the strategy, the function will either reject on the first error encountered or return an array of rejected and resolved results
 * @param items List of promises
 * @param options Options for handling the promises
 * @return List of results
 */
export async function promises<Items extends unknown[], Options extends PromisesOptions>(
	items: Promises<Items>,
	options?: Options,
): Promise<Options['strategy'] extends 'first' ? Items : PromisesResult<Items>>;

/**
 * Handle a list of promises, returning their results in an ordered array.
 *
 * If any promise in the list is rejected, the whole function will reject
 * @param items List of promises
 * @param strategy Strategy for handling the promises; rejects on the first error encountered
 * @return List of results
 */
export async function promises<Items extends unknown[]>(
	items: Promises<Items>,
	strategy: 'first',
): Promise<Items>;

/**
 * Handle a list of promises, returning their results in an ordered array of rejected and resolved results
 * @param items List of promises
 * @param signal AbortSignal for aborting the operation _(when aborted, the promise will reject with the reason of the signal)_
 * @return List of results
 */
export async function promises<Items extends unknown[]>(
	items: Promises<Items>,
	signal?: AbortSignal,
): Promise<PromisesResult<Items>>;

export async function promises<Items extends unknown[]>(
	items: Promises<Items>,
	options?: unknown,
): Promise<Items | PromisesResult<Items>> {
	const {signal, strategy} = getPromisesOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	if (!Array.isArray(items)) {
		return Promise.reject(new TypeError(MESSAGE_EXPECTATION_PROMISES));
	}

	const actual = items.filter(item => item instanceof Promise);
	const {length} = actual;

	if (length === 0) {
		return actual as unknown as Items | PromisesResult<Items>;
	}

	const complete = strategy === DEFAULT_STRATEGY;

	function abort(): void {
		handlers.reject(signal!.reason);
	}

	signal?.addEventListener('abort', abort, ABORT_OPTIONS);

	const data: Data<Items> = {
		last: length - 1,
		result: [] as unknown as Items | PromisesResult<Items>,
	};

	let handlers: Handlers<Items>;

	return new Promise((resolve, reject) => {
		handlers = {reject, resolve};

		for (let index = 0; index < length; index += 1) {
			void actual[index]
				.then(value =>
					handleResult(TYPE_FULFILLED, {abort, complete, data, handlers, index, signal, value}),
				)
				.catch(reason =>
					handleResult(TYPE_REJECTED, {
						abort,
						complete,
						data,
						handlers,
						index,
						signal,
						value: reason,
					}),
				);
		}
	});
}

function settlePromise(
	aborter: () => void,
	settler: (value: any) => void,
	value: unknown,
	signal?: AbortSignal,
): void {
	signal?.removeEventListener(EVENT_NAME, aborter);

	settler(value);
}

/**
 * Create a promise that should be settled within a certain amount of time
 * @param promise Promise to settle
 * @param options Timed options
 * @returns A timed promise
 */
export async function timed<Value>(
	promise: Promise<Value>,
	options: RequiredKeys<PromiseOptions, 'time'>,
): Promise<Value>;

/**
 * Create a promise that should be settled within a certain amount of time
 * @param promise Promise to settle
 * @param time How long to wait for _(in milliseconds; defaults to `0`)_
 * @returns A timed promise
 */
export async function timed<Value>(promise: Promise<Value>, time: number): Promise<Value>;

export async function timed<Value>(promise: Promise<Value>, options: unknown): Promise<Value> {
	if (!(promise instanceof Promise)) {
		return Promise.reject(new TypeError(MESSAGE_EXPECTATION_TIMED));
	}

	const {signal, time} = getPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	return time > 0 ? getTimed(promise, time, signal) : promise;
}

/**
 * Wrap a promise with safety handlers, with optional abort capabilities and timeout
 * @param promise Promise to wrap
 * @param options Options for the promise
 * @returns A wrapped promise
 */
export async function tryPromise<Value>(
	promise: Promise<Value>,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value>;

/**
 * Wrap a promise-returning callback with safety handlers, with optional abort capabilities and timeout
 * @param callback Callback to wrap
 * @param options Options for the promise
 * @returns A promise-wrapped callback
 */
export async function tryPromise<Value>(
	callback: () => Promise<Value>,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value>;

/**
 * Wrap a callback with a promise and safety handlers, with optional abort capabilities and timeout
 * @param callback Callback to wrap
 * @param options Options for the promise
 * @returns A promise-wrapped callback
 */
export async function tryPromise<Value>(
	callback: () => Value,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value>;

export async function tryPromise<Value>(
	value: (() => Value) | Promise<Value>,
	options?: PromiseOptions | AbortSignal | number,
): Promise<Value> {
	const isFunction = typeof value === 'function';

	if (!isFunction && !(value instanceof Promise)) {
		return Promise.reject(new TypeError(MESSAGE_EXPECTATION_TRY));
	}

	const {signal, time} = getPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	function abort(): void {
		rejector(signal!.reason);
	}

	async function handler(
		resolve: (value: Value) => void,
		reject: (reason: unknown) => void,
	): Promise<void> {
		try {
			let result = isFunction ? value() : await value;

			if (result instanceof Promise) {
				result = await result;
			}

			settlePromise(abort, resolve, result, signal);
		} catch (error) {
			settlePromise(abort, reject, error, signal);
		}
	}

	let rejector: (reason: unknown) => void;

	signal?.addEventListener(EVENT_NAME, abort, ABORT_OPTIONS);

	const promise = new Promise<Value>((resolve, reject) => {
		rejector = reject;

		handler(resolve, reject);
	});

	return time > 0 ? getTimed(promise, time, signal) : promise;
}

// #endregion

// #region Variables

const ABORT_OPTIONS = {once: true};

const DEFAULT_STRATEGY: PromiseStrategy = 'complete';

const ERROR_NAME = 'PromiseTimeoutError';

const EVENT_NAME = 'abort';

const MESSAGE_EXPECTATION_PROMISES = 'Promises expected an array of promises';

const MESSAGE_EXPECTATION_TIMED = 'Timed function expected a Promise';

const MESSAGE_EXPECTATION_TRY = 'TryPromise expected a function or a promise';

const MESSAGE_TIMEOUT = 'Promise timed out';

const strategies = new Set<PromiseStrategy>(['complete', 'first']);

const TYPE_FULFILLED = 'fulfilled';

const TYPE_REJECTED = 'rejected';

// #endregion
