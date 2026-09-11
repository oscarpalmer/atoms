import {createAborter, type Aborter} from './internal/abort';
import {getBooleanOrDefault, getNumberOrDefault} from './internal/defaults';
import type {GenericAsyncCallback, GenericCallback} from './models';

// #region Special variables

const QUEUE_NAME_KEYED = 'keyedQueue';

const QUEUE_NAME_QUEUE = 'queue';

const QUEUE_PROPERTY = '$queue';

// #endregion

// #region Types

type HandleType = 'clear' | 'pause' | 'resume';

type InternalKeyedQueue = {
	[QUEUE_SYMBOL]: KeyedQueueState;
} & KeyedQueue<GenericAsyncCallback, unknown[]>;

type InternalQueue = {
	[QUEUE_SYMBOL]: QueueState;
} & Queue<GenericAsyncCallback, unknown[]>;

/**
 * A queue that can be used to manage (a)synchronous tasks with a specific key
 */
export type KeyedQueue<
	Callback extends GenericCallback | GenericAsyncCallback,
	CallbackParameters extends unknown[] = Parameters<Callback>,
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
	): Queued<ReturnType<Callback>>;

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
	get(key: string): Queue<Callback, Tail<CallbackParameters>> | undefined;

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
	callback: GenericCallback | GenericAsyncCallback;
	options: Required<QueueOptions>;
	queues: Map<string, Queue<GenericAsyncCallback, Tail<unknown[]>>>;
};

/**
 * A queue that can be used to manage (a)synchronous tasks
 */
export type Queue<
	Callback extends GenericCallback | GenericAsyncCallback,
	CallbackParameters extends unknown[] = Parameters<Callback>,
> = {
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
	add(parameters: CallbackParameters, signal?: AbortSignal): Queued<ReturnType<Callback>>;

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

		this.name = QUEUE_ERROR_NAME;
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
	readonly promise: Promise<Value extends Promise<infer Result> ? Result : Value>;
};

type QueuedItem = {
	aborter?: Aborter;
	id: number;
	key?: string;
	parameters: unknown[];
	promise: Promise<unknown>;
	reject: (reason?: unknown) => void;
	resolve: (value: unknown) => void;
};

type StatusKey = 'active' | 'empty' | 'full' | 'paused';

type Tail<Values extends any[]> = Values extends [infer _, ...infer Rest] ? Rest : never;

// #endregion

// #region Instances

function KeyedQueue(this: any, callback: GenericAsyncCallback, options: Required<QueueOptions>) {
	this[QUEUE_SYMBOL] = {
		callback,
		options: createQueueOptions(options),
		queues: new Map(),
	} satisfies KeyedQueueState;
}

KeyedQueue.prototype[QUEUE_PROPERTY] = QUEUE_NAME_KEYED;

KeyedQueue.prototype.add = addKeyedQueue;
KeyedQueue.prototype.clear = clearQueues;
KeyedQueue.prototype.get = getQueue;
KeyedQueue.prototype.pause = pauseQueues;
KeyedQueue.prototype.remove = removeQueue;
KeyedQueue.prototype.resume = resumeQueues;

Object.defineProperties(KeyedQueue.prototype, {
	active: {
		enumerable: true,
		get(): string[] {
			return getStatus((this as InternalKeyedQueue)[QUEUE_SYMBOL], QUEUE_STATUS_ACTIVE);
		},
	},
	autostart: {
		enumerable: true,
		get(): boolean {
			return (this as InternalKeyedQueue)[QUEUE_SYMBOL].options.autostart;
		},
	},
	concurrency: {
		enumerable: true,
		get(): number {
			return (this as InternalKeyedQueue)[QUEUE_SYMBOL].options.concurrency;
		},
	},
	empty: {
		enumerable: true,
		get(): string[] {
			return getStatus((this as InternalKeyedQueue)[QUEUE_SYMBOL], QUEUE_STATUS_EMPTY);
		},
	},
	full: {
		enumerable: true,
		get(): string[] {
			return getStatus((this as InternalKeyedQueue)[QUEUE_SYMBOL], QUEUE_STATUS_FULL);
		},
	},
	items: {
		enumerable: true,
		get(): Record<string, number> {
			return getQueueItems((this as InternalKeyedQueue)[QUEUE_SYMBOL]);
		},
	},
	keys: {
		enumerable: true,
		get(): string[] {
			return [...(this as InternalKeyedQueue)[QUEUE_SYMBOL].queues.keys()];
		},
	},
	maximum: {
		enumerable: true,
		get(): number {
			return (this as InternalKeyedQueue)[QUEUE_SYMBOL].options.maximum;
		},
	},
	paused: {
		enumerable: true,
		get(): string[] {
			return getStatus((this as InternalKeyedQueue)[QUEUE_SYMBOL], QUEUE_STATUS_PAUSED);
		},
	},
	queues: {
		enumerable: true,
		get(): number {
			return (this as InternalKeyedQueue)[QUEUE_SYMBOL].queues.size;
		},
	},
});

function Queue(
	this: any,
	callback: GenericAsyncCallback,
	options: Required<QueueOptions>,
	key?: string,
) {
	this[QUEUE_SYMBOL] = {
		callback,
		key,
		options,
		handled: [],
		id: 0,
		items: [],
		paused: !options.autostart,
		runners: 0,
	} satisfies QueueState;
}

Queue.prototype[QUEUE_PROPERTY] = QUEUE_NAME_QUEUE;

Queue.prototype.add = addToQueue;
Queue.prototype.clear = clearQueue;
Queue.prototype.pause = pauseQueue;
Queue.prototype.remove = removeQueued;
Queue.prototype.resume = resumeQueue;

Object.defineProperties(Queue.prototype, {
	active: {
		enumerable: true,
		get(): boolean {
			return (this as InternalQueue)[QUEUE_SYMBOL].runners > 0;
		},
	},
	autostart: {
		enumerable: true,
		get(): boolean {
			return (this as InternalQueue)[QUEUE_SYMBOL].options.autostart;
		},
	},
	concurrency: {
		enumerable: true,
		get(): number {
			return (this as InternalQueue)[QUEUE_SYMBOL].options.concurrency;
		},
	},
	empty: {
		enumerable: true,
		get(): boolean {
			return (this as InternalQueue)[QUEUE_SYMBOL].items.length === 0;
		},
	},
	full: {
		enumerable: true,
		get(): boolean {
			const state = (this as InternalQueue)[QUEUE_SYMBOL];

			return state.options.maximum > 0 && state.items.length >= state.options.maximum;
		},
	},
	maximum: {
		enumerable: true,
		get(): number {
			return (this as InternalQueue)[QUEUE_SYMBOL].options.maximum;
		},
	},
	paused: {
		enumerable: true,
		get(): boolean {
			return (this as InternalQueue)[QUEUE_SYMBOL].paused;
		},
	},
	size: {
		enumerable: true,
		get(): number {
			return (this as InternalQueue)[QUEUE_SYMBOL].items.length;
		},
	},
});

// #endregion

// #region Functions

function addKeyedQueue(
	this: InternalKeyedQueue,
	key: string,
	parameters: unknown[],
	signal?: AbortSignal,
): Queued<unknown> {
	return getQueue.call(this, key, true)!.add(parameters, signal);
}

function addToQueue(this: InternalQueue, parameters: unknown[], signal?: unknown): Queued<unknown> {
	if (this.full) {
		throw new QueueError(QUEUE_MESSAGE_MAXIMUM);
	}

	const abortSignal = signal instanceof AbortSignal ? signal : undefined;

	if (abortSignal?.aborted ?? false) {
		throw new Error(abortSignal?.reason);
	}

	const state = this[QUEUE_SYMBOL];

	const id = identify(state);

	let rejector: (reason?: unknown) => void;
	let resolver: (value: unknown) => void;

	const promise = new Promise<unknown>((resolve, reject) => {
		rejector = reject;
		resolver = resolve;
	});

	const aborter = createAborter(abortSignal, () => rejector(abortSignal?.reason));

	state.items.push({
		aborter,
		id,
		parameters,
		promise,
		key: state.key,
		reject: rejector!,
		resolve: resolver!,
	});

	if (state.options.autostart) {
		void run(state);
	}

	return {id, promise};
}

function clearQueue(this: InternalQueue): void {
	const state = this[QUEUE_SYMBOL];
	const items = state.items.splice(0);
	const {length} = items;

	for (let index = 0; index < length; index += 1) {
		const {aborter, reject} = items[index];

		aborter?.cancel();

		reject(new QueueError(QUEUE_MESSAGE_CLEAR));
	}
}

function clearQueues(this: InternalKeyedQueue, key?: string): void {
	handleQueues(this, QUEUE_HANDLE_CLEAR, key);
}

function createQueue(
	callback: GenericAsyncCallback,
	options?: QueueOptions,
	key?: string,
): Queue<never, never> {
	if (typeof callback !== 'function') {
		throw new TypeError(QUEUE_MESSAGE_CALLBACK);
	}

	// @ts-expect-error All good, no worries :-)
	return new Queue(callback, createQueueOptions(options), key);
}

function createQueueOptions(input?: QueueOptions): Required<QueueOptions> {
	const options = typeof input === 'object' && input != null ? input : {};

	return {
		autostart: getBooleanOrDefault(options.autostart, true),
		concurrency: getNumberOrDefault(options.concurrency, 1, 1),
		maximum: getNumberOrDefault(options.maximum, 0),
	};
}

function getQueue(
	this: InternalKeyedQueue,
	key: string,
	add?: boolean,
): Queue<GenericCallback> | undefined {
	if (typeof key !== 'string' || key.trim().length === 0) {
		throw new TypeError(QUEUE_MESSAGE_KEY);
	}

	const state = this[QUEUE_SYMBOL];

	let queue = state.queues.get(key);

	if (queue == null && add === true) {
		queue = createQueue(state.callback, state.options, key);

		state.queues.set(key, queue);
	}

	return queue;
}

function getQueueItems(state: KeyedQueueState): Record<string, number> {
	const size: Record<string, number> = {};

	const queues = state.queues.entries();

	for (const [key, queue] of queues) {
		size[key] = queue.size;
	}

	return size;
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

function handleQueuedResult(item: QueuedItem, error: boolean, result: unknown): void {
	item.aborter?.cancel();

	if (item.aborter?.signal?.aborted ?? false) {
		item.reject();

		return;
	}

	if (error) {
		item.reject(result);

		return;
	}

	item.resolve(result);
}

function handleQueues(instance: InternalKeyedQueue, type: HandleType, key?: string): void {
	if (typeof key === 'string') {
		getQueue.call(instance, key)?.[type]();

		return;
	}

	const queues = instance[QUEUE_SYMBOL].queues.values();

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
export function isKeyedQueue(value: unknown): value is KeyedQueue<GenericAsyncCallback> {
	return isQueueInstance(QUEUE_NAME_KEYED, value);
}

/**
 * Is the value a queue?
 *
 * @param value Value to check
 * @returns `true` if the value is a queue, otherwise `false`
 */
export function isQueue(value: unknown): value is Queue<GenericCallback | GenericAsyncCallback> {
	return isQueueInstance(QUEUE_NAME_QUEUE, value);
}

export function isQueueInstance<Instance>(name: string, value: unknown): value is Instance {
	return (
		typeof value === 'object' &&
		value != null &&
		QUEUE_PROPERTY in value &&
		value[QUEUE_PROPERTY] === name
	);
}

/**
 * Create a keyed queue for an asynchronous callback function, where each key has its own queue
 *
 * _Available as `keyedQueue` and `queue.keyed`_
 *
 * @param callback Callback function for queued items
 * @param options Queue options
 */
export function keyedQueue<Callback extends (key: string, ...parameters: any[]) => Promise<void>>(
	callback: Callback,
	options?: QueueOptions,
): KeyedQueue<Callback, Parameters<Callback>>;

/**
 * Create a keyed queue for an asynchronous callback function, where each key has its own queue
 *
 * _Available as `keyedQueue` and `queue.keyed`_
 *
 * @param callback Callback function for queued items
 * @param options Queue options
 */
export function keyedQueue<Callback extends (key: string, ...parameters: any[]) => void>(
	callback: Callback,
	options?: QueueOptions,
): KeyedQueue<Callback, Parameters<Callback>>;

export function keyedQueue<Callback extends (key: string, ...parameters: any[]) => Promise<void>>(
	callback: Callback,
	options?: QueueOptions,
): KeyedQueue<Callback, Parameters<Callback>> {
	if (typeof callback !== 'function') {
		throw new TypeError(QUEUE_MESSAGE_CALLBACK);
	}

	// @ts-expect-error All good, no worries :-)
	return new KeyedQueue(callback, createQueueOptions(options));
}

function pauseQueue(this: InternalQueue): void {
	this[QUEUE_SYMBOL].paused = true;
}

function pauseQueues(this: InternalKeyedQueue, key?: string): void {
	handleQueues(this, QUEUE_HANDLE_PAUSE, key);
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
): Queue<Callback, Parameters<Callback>>;

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
): Queue<Callback, Parameters<Callback>>;

export function queue<Callback extends GenericCallback | GenericAsyncCallback>(
	callback: Callback,
	options?: QueueOptions,
): Queue<Callback, Parameters<Callback>> {
	return createQueue(callback, options);
}

function removeQueue(this: InternalKeyedQueue, key?: string, id?: number): void {
	const state = this[QUEUE_SYMBOL];

	if (key == null) {
		handleQueues(this, QUEUE_HANDLE_CLEAR);

		state.queues.clear();

		return;
	}

	const queue = getQueue.call(this, key);

	if (queue == null) {
		return;
	}

	if (typeof id === 'number') {
		queue.remove(id);

		return;
	}

	queue.clear();

	state.queues.delete(key);
}

function removeQueued(this: InternalQueue, id: number): void {
	const state = this[QUEUE_SYMBOL];

	const index = state.items.findIndex(item => item.id === id);

	if (index > -1) {
		const {aborter, reject} = state.items.splice(index, 1)[0];

		aborter?.cancel();

		reject(new QueueError(QUEUE_MESSAGE_REMOVE));
	}
}

function resumeQueue(this: InternalQueue): void {
	const state = this[QUEUE_SYMBOL];

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
}

function resumeQueues(this: InternalKeyedQueue, key?: string): void {
	handleQueues(this, QUEUE_HANDLE_RESUME, key);
}

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
			if (!(item.aborter?.signal?.aborted ?? false)) {
				const parameters = item.key == null ? item.parameters : [item.key, ...item.parameters];

				result = await state.callback(...parameters);
			}
		} catch (thrown) {
			error = true;
			result = thrown;
		}

		if (state.paused) {
			const paused = item;

			state.handled.push(() => handleQueuedResult(paused, error, result));

			break;
		}

		handleQueuedResult(item, error, result);

		item = state.items.shift();
	}

	state.runners -= 1;
}

// #endregion

// #region Variables

const QUEUE_ERROR_NAME = 'QueueError';

const QUEUE_HANDLE_CLEAR: HandleType = 'clear';

const QUEUE_HANDLE_PAUSE: HandleType = 'pause';

const QUEUE_HANDLE_RESUME: HandleType = 'resume';

const QUEUE_MESSAGE_CALLBACK = 'A Queue requires a callback function';

const QUEUE_MESSAGE_CLEAR = 'Queue was cleared';

const QUEUE_MESSAGE_KEY = 'Key must be a non-empty string';

const QUEUE_MESSAGE_MAXIMUM = 'Queue has reached its maximum size';

const QUEUE_MESSAGE_REMOVE = 'Item removed from queue';

const QUEUE_STATUS_ACTIVE: StatusKey = 'active';

const QUEUE_STATUS_EMPTY: StatusKey = 'empty';

const QUEUE_STATUS_FULL: StatusKey = 'full';

const QUEUE_STATUS_PAUSED: StatusKey = 'paused';

const QUEUE_SYMBOL = Symbol(QUEUE_PROPERTY);

// #endregion

// #region Initialization

queue.keyed = keyedQueue;

Object.defineProperty(queue, 'keyed', {
	value: keyedQueue,
});

// #endregion
