import {getNumberOrDefault} from './internal/number';
import type {GenericAsyncCallback, GenericCallback} from './models';

// #region Types

type HandleType = 'clear' | 'pause' | 'resume';

/**
 * A queue that can be used to manage (a)synchronous tasks with a specific key
 */
export type KeyedQueue<
	CallbackParameters extends Parameters<GenericAsyncCallback>,
	CallbackResult,
> = {
	/**
	 * Get keys of all active queues
	 */
	get active(): string[];

	/**
	 * Does the queue automatically start when the first item is added?
	 */
	get autostart(): boolean;

	/**
	 * Maximum number of runners to process the queue concurrently
	 */
	get concurrency(): number;

	/**
	 * Get keys of all empty queues
	 */
	get empty(): string[];

	/**
	 * Get keys of all full queues
	 */
	get full(): string[];

	/**
	 * Number of items in all queues
	 */
	get items(): Record<string, number>;

	/**
	 * Keys of all queues
	 */
	get keys(): string[];

	/**
	 * Maximum number of items allowed in the queue
	 */
	get maximum(): number;

	/**
	 * Are all queues paused?
	 */
	get paused(): string[];

	/**
	 * Number of queues
	 */
	get queues(): number;

	/**
	 * Queue an item for a specific key
	 *
	 * @param key Key to queue the item for
	 * @param parameters Parameters to use when item runs
	 * @param signal Optional signal to abort the item
	 * @returns Queued item
	 */
	add(
		key: string,
		parameters: Tail<CallbackParameters>,
		signal?: AbortSignal,
	): Queued<CallbackResult>;

	/**
	 * Clear all items for a specific key _(or all items for all keys, if no key is provided)_
	 *
	 * @param key Optional key to clear the queue for
	 */
	clear(key?: string): void;

	/**
	 * Get the queue for a specific key
	 *
	 * @param key Key to get the queue for
	 * @returns Queue for the key, or `undefined` if it doesn't exist
	 */
	get(key: string): Queue<Tail<CallbackParameters>, CallbackResult> | undefined;

	/**
	 * Pause the queue for a specific key _(or all queues, if no key is provided)_
	 *
	 * @param key Optional key to pause the queue for
	 */
	pause(key?: string): void;

	/**
	 * Remove a specific item for a specific key
	 *
	 * @param key Key to remove the item for
	 * @param id ID of the item to remove
	 */
	remove(key: string, id: number): void;

	/**
	 * Remove a queue and its items for a specific key
	 *
	 * _(To remove all items for a specific key, use `clear()` instead)_
	 *
	 * @param key Key to remove the queue for
	 */
	remove(key: string): void;

	/**
	 * Remove all queues and their items
	 */
	remove(): void;

	/**
	 * Resume the queue for a specific key _(or all queues, if no key is provided)_
	 *
	 * @param key Optional key to resume the queue for
	 */
	resume(key?: string): void;
};

type KeyedQueueState = {
	callback: GenericAsyncCallback;
	options: Required<QueueOptions>;
	queues: Map<string, Queue<Tail<unknown[]>, unknown>>;
};

/**
 * A queue that can be used to manage (a)synchronous tasks
 */
export type Queue<CallbackParameters extends Parameters<GenericAsyncCallback>, CallbackResult> = {
	/**
	 * Is the queue active?
	 */
	get active(): boolean;

	/**
	 * Does the queue automatically start when the first item is added?
	 */
	get autostart(): boolean;

	/**
	 * Maximum number of runners to process the queue concurrently
	 */
	get concurrency(): number;

	/**
	 * Is the queue empty?
	 */
	get empty(): boolean;

	/**
	 * Is the queue full?
	 */
	get full(): boolean;

	/**
	 * Maximum number of items allowed in the queue
	 */
	get maximum(): number;

	/**
	 * Is the queue paused?
	 */
	get paused(): boolean;

	/**
	 * Number of items in the queue
	 */
	get size(): number;

	/**
	 * Add an item to the queue
	 *
	 * @param parameters Parameters to use when item runs
	 * @param signal Optional signal to abort the item
	 * @returns Queued item
	 */
	add(parameters: CallbackParameters, signal?: AbortSignal): Queued<CallbackResult>;

	/**
	 * Remove and reject all items in the queue
	 */
	clear(): void;

	/**
	 * Pause the queue
	 *
	 * - Currently running items will not be stopped
	 * - New added items will not run until the queue is resumed
	 */
	pause(): void;

	/**
	 * Remove and reject a specific item in the queue
	 *
	 * @param id ID of queued item
	 */
	remove(id: number): void;

	/**
	 * Resume the queue
	 */
	resume(): void;
};

type QueueState = {
	callback: GenericCallback | GenericAsyncCallback;
	handled: GenericCallback[];
	id: number;
	items: Array<QueuedItem>;
	key: string | undefined;
	options: Required<QueueOptions>;
	paused: boolean;
	runners: number;
};

/**
 * An error thrown by the Queue when an operation fails
 */
export class QueueError extends Error {
	constructor(message: string) {
		super(message);

		this.name = ERROR_NAME;
	}
}

export type QueueOptions = {
	/**
	 * Automatically start processing the queue when the first item is added _(defaults to `true`)_
	 */
	autostart?: boolean;
	/**
	 * Number of runners to process the queue concurrently _(defaults to `1`)_
	 */
	concurrency?: number;
	/**
	 * Maximum number of items allowed in the queue _(defaults to `0`, which means no limit)_
	 */
	maximum?: number;
};

/**
 * A queued item
 */
export type Queued<Value> = {
	/**
	 * ID of the queued item _(can be used to remove it from the queue)_
	 */
	readonly id: number;
	/**
	 * Queued promise
	 */
	readonly promise: Promise<QueuedResult<Value>>;
};

type QueuedItem = {
	abort?: () => void;
	id: number;
	key?: string;
	parameters: unknown[];
	promise: Promise<QueuedResult<unknown>>;
	reject: (reason?: unknown) => void;
	resolve: (value: QueuedResult<unknown>) => void;
	signal?: AbortSignal;
};

export type QueuedResult<Value> = {
	/**
	 * Has the queue finished processing all items?
	 */
	finished: boolean;
	/**
	 * Result for the queued promise
	 */
	value: Value extends Promise<infer Result> ? Result : Value;
};

type StatusKey = 'active' | 'empty' | 'full' | 'paused';

type Tail<Values extends any[]> = Values extends [infer _, ...infer Rest] ? Rest : never;

// #endregion

// #region Functions

function createQueue(
	callback: GenericCallback | GenericAsyncCallback,
	options?: QueueOptions,
	key?: string,
): Queue<unknown[], unknown> {
	if (typeof callback !== 'function') {
		throw new TypeError(MESSAGE_CALLBACK);
	}

	const state: QueueState = {
		callback,
		key,
		handled: [],
		id: 0,
		items: [],
		options: getOptions(options),
		paused: !getBooleanOrDefault(options?.autostart, true),
		runners: 0,
	};

	const instance = {
		add: (parameters: unknown[], signal?: AbortSignal) => {
			if ((instance as Queue<unknown[], unknown>).full) {
				throw new QueueError(MESSAGE_MAXIMUM);
			}

			const abortSignal = signal instanceof AbortSignal ? signal : undefined;

			if (abortSignal?.aborted ?? false) {
				throw new Error(abortSignal!.reason);
			}

			const id = identify(state);

			let rejector: (reason?: unknown) => void;
			let resolver: (value: QueuedResult<unknown>) => void;

			const promise = new Promise<QueuedResult<unknown>>((resolve, reject) => {
				rejector = reject;
				resolver = resolve;
			});

			const aborter = abortSignal == null ? undefined : () => rejector(abortSignal.reason);

			signal?.addEventListener(EVENT_NAME, aborter!, EVENT_OPTIONS);

			state.items.push({
				id,
				parameters,
				promise,
				abort: aborter,
				key: state.key,
				reject: rejector!,
				resolve: resolver!,
				signal: abortSignal,
			});

			if (state.options.autostart) {
				void run(state);
			}

			return {id, promise};
		},
		clear: () => {
			const items = state.items.splice(0);
			const {length} = items;

			for (let index = 0; index < length; index += 1) {
				const {abort, reject, signal} = items[index];

				reject(new QueueError(MESSAGE_CLEAR));

				signal?.removeEventListener(EVENT_NAME, abort!);
			}
		},
		pause: () => {
			state.paused = true;
		},
		remove: (id: number) => {
			const index = state.items.findIndex(item => item.id === id);

			if (index > -1) {
				const {abort, reject, signal} = state.items.splice(index, 1)[0];

				reject(new QueueError(MESSAGE_REMOVE));

				signal?.removeEventListener(EVENT_NAME, abort!);
			}
		},
		resume: () => {
			if (state.paused) {
				const handled = state.handled.splice(0);
				const {length} = handled;

				for (let index = 0; index < length; index += 1) {
					handled[index]();
				}
			}

			state.paused = false;

			const length = Math.min(state.options.concurrency, state.items.length);

			for (let index = 0; index < length; index += 1) {
				void run(state);
			}
		},
	};

	Object.defineProperties(instance, {
		[KEY_QUEUE]: {
			enumerable: false,
			value: NAME_QUEUE,
		},
		active: {
			enumerable: true,
			get: () => state.runners > 0,
		},
		autostart: {
			enumerable: true,
			get: () => state.options.autostart,
		},
		concurrency: {
			enumerable: true,
			get: () => state.options.concurrency,
		},
		empty: {
			enumerable: true,
			get: () => state.items.length === 0,
		},
		full: {
			enumerable: true,
			get: () => state.options.maximum > 0 && state.items.length >= state.options.maximum,
		},
		maximum: {
			enumerable: true,
			get: () => state.options.maximum,
		},
		paused: {
			enumerable: true,
			get: () => state.paused,
		},
		size: {
			enumerable: true,
			get: () => state.items.length,
		},
	});

	return Object.freeze(instance) as Queue<unknown[], unknown>;
}

function getBooleanOrDefault(value: unknown, defaultValue: boolean): boolean {
	return typeof value === 'boolean' ? value : defaultValue;
}

function getOptions(input?: QueueOptions): Required<QueueOptions> {
	const options = typeof input === 'object' && input != null ? input : {};

	return {
		autostart: getBooleanOrDefault(options.autostart, true),
		concurrency: getNumberOrDefault(options.concurrency, 1, 1),
		maximum: getNumberOrDefault(options.maximum, 0),
	};
}

function getQueue(state: KeyedQueueState, key: string, add: true): Queue<Tail<unknown[]>, unknown>;

function getQueue(state: KeyedQueueState, key: string): Queue<Tail<unknown[]>, unknown> | undefined;

function getQueue(
	state: KeyedQueueState,
	key: string,
	add?: boolean,
): Queue<Tail<unknown[]>, unknown> | undefined {
	if (typeof key !== 'string' || key.trim().length === 0) {
		throw new TypeError(MESSAGE_KEY);
	}

	let queue = state.queues.get(key);

	if (queue == null && add === true) {
		queue = createQueue(state.callback, state.options, key);

		state.queues.set(key, queue);
	}

	return queue;
}

function getStatus(state: KeyedQueueState, status: StatusKey): string[] {
	const queues = state.queues.entries();

	const result: string[] = [];

	for (const [key, queue] of queues) {
		if (queue[status]) {
			result.push(key);
		}
	}

	return result;
}

function handleQueuedResult(
	item: QueuedItem,
	error: boolean,
	result: unknown,
	finished: boolean,
): void {
	item.signal?.removeEventListener(EVENT_NAME, item.abort!);

	if (item.signal?.aborted ?? false) {
		item.reject();

		return;
	}

	if (error) {
		item.reject(result);

		return;
	}

	item.resolve({
		finished,
		value: result as never,
	});
}

function handleQueues(state: KeyedQueueState, type: HandleType, key?: string): void {
	if (typeof key === 'string') {
		getQueue(state, key)?.[type]();

		return;
	}

	const queues = state.queues.values();

	for (const queue of queues) {
		queue[type]();
	}
}

function identify(state: QueueState): number {
	state.id += 1;

	return state.id;
}

/**
 * Is the value keyed queue?
 *
 * @param value Value to check
 * @returns `true` if the value is a keyed queue, otherwise `false`
 */
export function isKeyedQueue(value: unknown): value is KeyedQueue<unknown[], unknown> {
	return isQueueInstance(NAME_KEYED, value);
}

/**
 * Is the value a queue?
 *
 * @param value Value to check
 * @returns `true` if the value is a queue, otherwise `false`
 */
export function isQueue(value: unknown): value is Queue<unknown[], unknown> {
	return isQueueInstance(NAME_QUEUE, value);
}

export function isQueueInstance<Instance>(name: string, value: unknown): value is Instance {
	return (
		typeof value === 'object' &&
		value != null &&
		(value as Record<string, unknown>)[KEY_QUEUE] === name
	);
}

export function keyedQueue<Callback extends (key: string, ...parameters: any[]) => Promise<void>>(
	callback: Callback,
	options?: QueueOptions,
): KeyedQueue<Parameters<Callback>, Awaited<ReturnType<Callback>>>;

export function keyedQueue<Callback extends (key: string, ...parameters: any[]) => void>(
	callback: Callback,
	options?: QueueOptions,
): KeyedQueue<Parameters<Callback>, ReturnType<Callback>>;

export function keyedQueue(
	callback: GenericCallback | GenericAsyncCallback,
	options?: QueueOptions,
): KeyedQueue<unknown[], unknown> {
	if (typeof callback !== 'function') {
		throw new TypeError(MESSAGE_CALLBACK);
	}

	const state: KeyedQueueState = {
		callback,
		options: getOptions(options),
		queues: new Map(),
	};

	const instance = {
		add: (key: string, parameters: Tail<unknown[]>, signal?: AbortSignal) =>
			getQueue(state, key, true).add(parameters, signal),
		clear: (key?: string) => {
			handleQueues(state, HANDLE_CLEAR, key);
		},
		get: (key: string) => getQueue(state, key),
		pause: (key?: string): void => {
			handleQueues(state, HANDLE_PAUSE, key);
		},
		remove: (key?: string, id?: number): void => {
			if (key == null) {
				handleQueues(state, HANDLE_CLEAR);

				state.queues.clear();

				return;
			}

			const queue = getQueue(state, key);

			if (queue == null) {
				return;
			}

			if (typeof id === 'number') {
				queue.remove(id);

				return;
			}

			queue.clear();

			state.queues.delete(key);
		},
		resume: (key?: string): void => {
			handleQueues(state, HANDLE_RESUME, key);
		},
	};

	Object.defineProperties(instance, {
		[KEY_QUEUE]: {
			enumerable: false,
			value: NAME_KEYED,
		},
		active: {
			enumerable: true,
			get: () => getStatus(state, STATUS_ACTIVE),
		},
		autostart: {
			enumerable: true,
			get: () => state.options.autostart,
		},
		concurrency: {
			enumerable: true,
			get: () => state.options.concurrency,
		},
		empty: {
			enumerable: true,
			get: () => getStatus(state, STATUS_EMPTY),
		},
		full: {
			enumerable: true,
			get: () => getStatus(state, STATUS_FULL),
		},
		items: {
			enumerable: true,
			get: () => {
				const size: Record<string, number> = {};

				const queues = state.queues.entries();

				for (const [key, queue] of queues) {
					size[key] = queue.size;
				}

				return size;
			},
		},
		keys: {
			enumerable: true,
			get: () => [...state.queues.keys()],
		},
		maximum: {
			enumerable: true,
			get: () => state.options.maximum,
		},
		paused: {
			enumerable: true,
			get: () => getStatus(state, STATUS_PAUSED),
		},
		queues: {
			enumerable: true,
			get: () => state.queues.size,
		},
	});

	return Object.freeze(instance) as KeyedQueue<unknown[], unknown>;
}

/**
 * Create a queue for an asynchronous callback function
 *
 * @param callback Callback function for queued items
 * @param options Queue options
 * @returns Queue instance
 */
export function queue<Callback extends GenericAsyncCallback>(
	callback: Callback,
	options?: QueueOptions,
): Queue<Parameters<Callback>, Awaited<ReturnType<Callback>>>;

/**
 * Create a queue for a synchronous callback function
 *
 * @param callback Callback function for queued items
 * @param options Queue options
 * @returns Queue instance
 */
export function queue<Callback extends GenericCallback>(
	callback: Callback,
	options?: QueueOptions,
): Queue<Parameters<Callback>, ReturnType<Callback>>;

export function queue(
	callback: GenericCallback | GenericAsyncCallback,
	options?: QueueOptions,
): Queue<unknown[], unknown> {
	return createQueue(callback, options);
}

queue.keyed = keyedQueue;

async function run(state: QueueState): Promise<void> {
	if (state.paused || state.runners >= state.options.concurrency) {
		return;
	}

	state.runners += 1;

	let item = state.items.shift();

	while (item != null) {
		let error = false;

		let result: unknown;

		try {
			if (!(item.signal?.aborted ?? false)) {
				const parameters = item.key == null ? item.parameters : [item.key, ...item.parameters];

				result = await state.callback(...parameters);
			}
		} catch (thrown) {
			error = true;
			result = thrown;
		}

		if (state.paused) {
			const paused = item;

			state.handled.push(() => {
				handleQueuedResult(paused, error, result, state.items.length === 0);
			});

			break;
		}

		handleQueuedResult(item, error, result, state.items.length === 0);

		item = state.items.shift();
	}

	state.runners -= 1;
}

// #endregion

// #region Variables

const ERROR_NAME = 'QueueError';

const EVENT_NAME = 'abort';

const EVENT_OPTIONS = {once: true};

const KEY_QUEUE = '$queue';

const HANDLE_CLEAR: HandleType = 'clear';

const HANDLE_PAUSE: HandleType = 'pause';

const HANDLE_RESUME: HandleType = 'resume';

const MESSAGE_CALLBACK = 'A Queue requires a callback function';

const MESSAGE_CLEAR = 'Queue was cleared';

const MESSAGE_KEY = 'Key must be a non-empty string';

const MESSAGE_MAXIMUM = 'Queue has reached its maximum size';

const MESSAGE_REMOVE = 'Item removed from queue';

const NAME_KEYED = 'keyedQueue';

const NAME_QUEUE = 'queue';

const STATUS_ACTIVE: StatusKey = 'active';

const STATUS_EMPTY: StatusKey = 'empty';

const STATUS_FULL: StatusKey = 'full';

const STATUS_PAUSED: StatusKey = 'paused';

// #endregion
