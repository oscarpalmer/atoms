// #region Types

type Data<Items extends unknown[]> = {
	last: number;
	result: Items | PromisesResult<Items>;
};

type Handlers<Items extends unknown[]> = {
	resolve: (value: Items | PromisesResult<Items>) => void;
	reject: (reason: unknown) => void;
};

export class PromiseTimeoutError extends Error {
	constructor() {
		super(MESSAGE_TIMEOUT);

		this.name = NAME;
	}
}

type Promises<Items extends unknown[]> = {
	[K in keyof Items]: Promise<Items[K]>;
};

type PromisesResult<Items extends unknown[]> = {
	[K in keyof Items]: ResolvedResult<Items[K]> | RejectedResult;
};

type RejectedResult = {
	status: typeof TYPE_REJECTED;
	reason: unknown;
};

type ResolvedResult<Value> = {
	status: typeof TYPE_FULFILLED;
	value: Value;
};

// #endregion

// #region Functions

/**
 * Create a delayed promise that resolves after a certain amount of time
 * @param time How long to wait for _(in milliseconds; defaults to screen refresh rate)_
 * @returns A promise that resolves after the delay
 */
export function delay(time?: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, getNumberOrDefault(time)));
}

function getBooleanOrDefault(value: unknown, defaultValue: boolean): boolean {
	return typeof value === 'boolean' ? value : defaultValue;
}

function getNumberOrDefault(value: unknown): number {
	return typeof value === 'number' ? value : 0;
}

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
 * @return List of results
 */
export async function promises<Items extends unknown[]>(
	items: Promises<Items>,
): Promise<PromisesResult<Items>>;

export async function promises<Items extends unknown[]>(
	items: Promises<Items>,
	eager?: unknown,
): Promise<Items | PromisesResult<Items>> {
	const actual = items.filter(item => item instanceof Promise);

	if (actual.length === 0) {
		return actual as unknown as Items | PromisesResult<Items>;
	}

	const isEager = getBooleanOrDefault(eager, false);

	const {length} = actual;

	const data: Data<Items> = {
		last: length - 1,
		result: [] as unknown as Items | PromisesResult<Items>,
	};

	let handlers: Handlers<Items>;

	return new Promise((resolve, reject) => {
		handlers = {reject, resolve};

		for (let index = 0; index < length; index += 1) {
			void actual[index]
				.then(value => resolveResult(index, data, handlers, value, isEager))
				.catch(reason => rejectResult(index, data, handlers, reason, isEager));
		}
	});
}

function rejectResult<Items extends unknown[]>(
	index: number,
	data: Data<Items>,
	handlers: Handlers<Items>,
	reason: unknown,
	eager: boolean,
) {
	if (eager) {
		handlers.reject(reason);
	} else {
		data.result[index] = {status: TYPE_REJECTED, reason};

		if (index === data.last) {
			handlers.resolve(data.result as Items | PromisesResult<Items>);
		}
	}
}

function resolveResult<Items extends unknown[]>(
	index: number,
	data: Data<Items>,
	handlers: Handlers<Items>,
	value: unknown,
	eager: boolean,
) {
	(data.result as unknown[])[index] = eager ? value : {status: TYPE_FULFILLED, value};

	if (index === data.last) {
		handlers.resolve(data.result as Items | PromisesResult<Items>);
	}
}

export function timed(promise: Promise<unknown>, timeout: number): Promise<unknown> {
	if (!(promise instanceof Promise)) {
		throw new TypeError(MESSAGE_EXPECTATION);
	}

	const time = getNumberOrDefault(timeout);

	if (time <= 0) {
		return promise;
	}

	return Promise.race([
		promise,
		new Promise((_, reject) => setTimeout(() => reject(new PromiseTimeoutError()), timeout)),
	]);
}

// #endregion

// #region Variables

const MESSAGE_EXPECTATION = 'Timed function expected a Promise';

const MESSAGE_TIMEOUT = 'Promise timed out';

const NAME = 'PromiseTimeoutError';

const TYPE_FULFILLED = 'fulfilled';

const TYPE_REJECTED = 'rejected';

// #endregion
