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
	data: Data<Items>;
	eager: boolean;
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
	eager?: boolean;
	signal?: AbortSignal;
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

	signal?.addEventListener('abort', abort, abortOptions);

	let rejector: (reason: unknown) => void;
	let timeout: ReturnType<typeof setTimeout>;

	return new Promise((resolve, reject) => {
		rejector = reject;

		timeout = setTimeout(() => {
			signal?.removeEventListener('abort', abort);

			resolve();
		}, time);
	});
}

function getBooleanOrDefault(value: unknown, defaultValue: boolean): boolean {
	return typeof value === 'boolean' ? value : defaultValue;
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

	const options = typeof input === 'object' && input !== null ? (input as PromiseOptions) : {};

	return {
		signal: options.signal instanceof AbortSignal ? options.signal : undefined,
		time: getNumberOrDefault(options.time),
	};
}

function getPromisesOptions(input: unknown): RequiredKeys<PromisesOptions, 'eager'> {
	if (typeof input === 'boolean') {
		return {eager: input};
	}

	if (input instanceof AbortSignal) {
		return {eager: false, signal: input};
	}

	const options = typeof input === 'object' && input !== null ? (input as PromisesOptions) : {};

	return {
		eager: getBooleanOrDefault(options.eager, false),
		signal: options.signal instanceof AbortSignal ? options.signal : undefined,
	};
}

function handleResult<Items extends unknown[]>(
	status: string,
	parameters: Parameters<Items>,
): void {
	const {data, eager, handlers, index, signal, value} = parameters;

	if (signal?.aborted ?? false) {
		return;
	}

	if (eager && status === TYPE_REJECTED) {
		handlers.reject(value);

		return;
	}

	(data.result as unknown[])[index] = eager
		? value
		: status === TYPE_FULFILLED
			? {status, value}
			: {status, reason: value};

	if (index === data.last) {
		handlers.resolve(data.result as Items | PromisesResult<Items>);
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
 * ---
 * @param items List of promises
 * @param options Options for handling the promises
 * @return List of results
 */
export async function promises<Items extends unknown[], Options extends PromisesOptions>(
	items: Promises<Items>,
	options?: Options,
): Promise<Options['eager'] extends true ? Items : PromisesResult<Items>>;

/**
 * Handle a list of promises, returning their results in an ordered array. If any promise in the list is rejected, the whole function will reject
 * @param items List of promises
 * @param eager Reject immediately if any promise is rejected
 * @return List of results
 */
export async function promises<Items extends unknown[]>(
	items: Promises<Items>,
	eager: true,
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
	const actual = items.filter(item => item instanceof Promise);
	const {length} = actual;

	const {eager, signal} = getPromisesOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	if (length === 0) {
		return actual as unknown as Items | PromisesResult<Items>;
	}

	function abort(): void {
		handlers.reject(signal!.reason);
	}

	signal?.addEventListener('abort', abort, abortOptions);

	const data: Data<Items> = {
		last: length - 1,
		result: [] as unknown as Items | PromisesResult<Items>,
	};

	let handlers: Handlers<Items>;

	return new Promise((resolve, reject) => {
		handlers = {reject, resolve};

		for (let index = 0; index < length; index += 1) {
			void actual[index]
				.then(value => handleResult(TYPE_FULFILLED, {data, eager, handlers, index, signal, value}))
				.catch(reason =>
					handleResult(TYPE_REJECTED, {data, eager, handlers, index, signal, value: reason}),
				);
		}
	});
}

export function timed(promise: Promise<unknown>, options: PromiseOptions): Promise<unknown>;

export function timed(promise: Promise<unknown>, time: number): Promise<unknown>;

export function timed(promise: Promise<unknown>, options: unknown): Promise<unknown> {
	if (!(promise instanceof Promise)) {
		throw new TypeError(MESSAGE_EXPECTATION);
	}

	const {signal, time} = getPromiseOptions(options);

	if (signal?.aborted ?? false) {
		return Promise.reject(signal!.reason);
	}

	if (time <= 0) {
		return promise;
	}

	function abort(): void {
		clearTimeout(timeout);

		rejector(signal!.reason);
	}

	signal?.addEventListener(EVENT_NAME, abort, abortOptions);

	let rejector: (reason: unknown) => void;
	let timeout: ReturnType<typeof setTimeout>;

	return Promise.race([
		promise,
		new Promise((_, reject) => {
			rejector = reject;

			timeout = setTimeout(() => {
				signal?.removeEventListener(EVENT_NAME, abort);

				reject(new PromiseTimeoutError());
			}, time);
		}),
	]);
}

// #endregion

// #region Variables

const abortOptions = {once: true};

const ERROR_NAME = 'PromiseTimeoutError';

const EVENT_NAME = 'abort';

const MESSAGE_EXPECTATION = 'Timed function expected a Promise';

const MESSAGE_TIMEOUT = 'Promise timed out';

const TYPE_FULFILLED = 'fulfilled';

const TYPE_REJECTED = 'rejected';

// #endregion
