import {createAborter} from './internal/aborter';
import {getBooleanOrDefault, getNumberOrDefault} from './internal/defaults';
import {min} from './internal/math/aggregate';
import {asyncAttempt} from './internal/result/attempt';
import type {GenericAsyncCallback, GenericCallback} from './models/index';
import {
	type InternalKeyedQueue,
	type InternalQueue,
	type KeyedQueue,
	type KeyedQueueState,
	type Queue,
	QUEUE_HANDLE_CLEAR,
	QUEUE_HANDLE_PAUSE,
	QUEUE_HANDLE_RESUME,
	QUEUE_MESSAGE_CALLBACK,
	QUEUE_MESSAGE_CLEAR,
	QUEUE_MESSAGE_KEY,
	QUEUE_MESSAGE_MAXIMUM,
	QUEUE_MESSAGE_REMOVE,
	QUEUE_NAME_KEYED,
	QUEUE_NAME_QUEUE,
	QUEUE_PROPERTY,
	QUEUE_STATUS_ACTIVE,
	QUEUE_STATUS_EMPTY,
	QUEUE_STATUS_FULL,
	QUEUE_STATUS_PAUSED,
	QUEUE_SYMBOL,
	type Queued,
	type QueuedItem,
	QueueError,
	type QueueHandleType,
	type QueueOptions,
	type QueueState,
	type QueueStatusKey,
} from './models/queue.model';

// #region Instances

function KeyedQueue(
	this: any,
	callback: GenericAsyncCallback,
	options: Required<QueueOptions>,
): void {
	this[QUEUE_SYMBOL] = {
		callback,
		options: createQueueOptions(options),
		queues: new Map(),
	};
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
		get: getActiveQueues,
	},
	autostart: {
		enumerable: true,
		get: getQueueAutostart,
	},
	concurrency: {
		enumerable: true,
		get: getQueueConcurrency,
	},
	empty: {
		enumerable: true,
		get: getEmptyQueues,
	},
	full: {
		enumerable: true,
		get: getFullQueues,
	},
	items: {
		enumerable: true,
		get: getKeyedQueueItems,
	},
	keys: {
		enumerable: true,
		get: getQueueKeys,
	},
	maximum: {
		enumerable: true,
		get: getQueueMaximum,
	},
	paused: {
		enumerable: true,
		get: getPausedQueues,
	},
	queues: {
		enumerable: true,
		get: getKeyedQueueSize,
	},
});

function Queue(
	this: any,
	callback: GenericAsyncCallback,
	options: Required<QueueOptions>,
	key?: string,
): void {
	this[QUEUE_SYMBOL] = {
		callback,
		key,
		options,
		handled: [],
		id: 0,
		items: [],
		paused: !options.autostart,
		runners: 0,
	};
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
		get: getQueueActive,
	},
	autostart: {
		enumerable: true,
		get: getQueueAutostart,
	},
	concurrency: {
		enumerable: true,
		get: getQueueConcurrency,
	},
	empty: {
		enumerable: true,
		get: getQueueEmpty,
	},
	full: {
		enumerable: true,
		get: getQueueFull,
	},
	maximum: {
		enumerable: true,
		get: getQueueMaximum,
	},
	paused: {
		enumerable: true,
		get: getQueuePaused,
	},
	size: {
		enumerable: true,
		get: getQueueSize,
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
		const item = items[index];

		item.aborter?.cancel();

		item.reject(new QueueError(QUEUE_MESSAGE_CLEAR));
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

function getActiveQueues(this: InternalKeyedQueue): string[] {
	return getStatus(this[QUEUE_SYMBOL], QUEUE_STATUS_ACTIVE);
}

function getEmptyQueues(this: InternalKeyedQueue): string[] {
	return getStatus(this[QUEUE_SYMBOL], QUEUE_STATUS_EMPTY);
}

function getFullQueues(this: InternalKeyedQueue): string[] {
	return getStatus(this[QUEUE_SYMBOL], QUEUE_STATUS_FULL);
}

function getPausedQueues(this: InternalKeyedQueue): string[] {
	return getStatus(this[QUEUE_SYMBOL], QUEUE_STATUS_PAUSED);
}

function getKeyedQueueItems(this: InternalKeyedQueue): Record<string, number> {
	const state = this[QUEUE_SYMBOL];

	const size: Record<string, number> = {};

	const queues = state.queues.entries();

	for (const [key, queue] of queues) {
		size[key] = queue.size;
	}

	return size;
}

function getKeyedQueueSize(this: InternalKeyedQueue): number {
	return this[QUEUE_SYMBOL].queues.size;
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

function getQueueActive(this: InternalQueue): boolean {
	return this[QUEUE_SYMBOL].runners > 0;
}

function getQueueAutostart(this: InternalKeyedQueue | InternalQueue): boolean {
	return this[QUEUE_SYMBOL].options.autostart === true;
}

function getQueueConcurrency(this: InternalKeyedQueue | InternalQueue): number {
	return this[QUEUE_SYMBOL].options.concurrency;
}

function getQueueEmpty(this: InternalQueue): boolean {
	return this[QUEUE_SYMBOL].items.length === 0;
}

function getQueueFull(this: InternalQueue): boolean {
	const state = this[QUEUE_SYMBOL];

	return state.options.maximum > 0 && state.items.length >= state.options.maximum;
}

function getQueueKeys(this: InternalKeyedQueue): string[] {
	return [...this[QUEUE_SYMBOL].queues.keys()];
}

function getQueueMaximum(this: InternalKeyedQueue | InternalQueue): number {
	return this[QUEUE_SYMBOL].options.maximum;
}

function getQueuePaused(this: InternalQueue): boolean {
	return this[QUEUE_SYMBOL].paused === true;
}

function getQueueSize(this: InternalQueue): number {
	return this[QUEUE_SYMBOL].items.length;
}

function getStatus(state: KeyedQueueState, status: QueueStatusKey): string[] {
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

function handleQueues(instance: InternalKeyedQueue, type: QueueHandleType, key?: string): void {
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
		const item = state.items.splice(index, 1)[0];

		item.aborter?.cancel();

		item.reject(new QueueError(QUEUE_MESSAGE_REMOVE));
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

	const length = min([state.options.concurrency, state.items.length]);

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

		const attempted = await asyncAttempt(async () => {
			if (item != null && !(item.aborter?.signal?.aborted ?? false)) {
				const parameters = item.key == null ? item.parameters : [item.key, ...item.parameters];

				return await state.callback(...parameters);
			}

			throw new Error();
		});

		if (attempted.ok) {
			result = attempted.value;
		} else {
			error = true;
			result = attempted.error;
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

// #region Namespace

export declare namespace queue {
	export var keyed: typeof keyedQueue;
}

// #endregion

// #region Initialization

queue.keyed = keyedQueue;

// #endregion

// #region Exports

export type {KeyedQueue, Queue, Queued, QueueOptions};

// #endregion
