import {getNumberOrDefault} from './internal/number';
import type {GenericAsyncCallback, GenericCallback} from './models';

// #region Types

type HandleType = 'clear' | 'pause' | 'resume';

class KeyedQueue<CallbackParameters extends Parameters<GenericAsyncCallback>, CallbackResult> {
	readonly #callback: GenericAsyncCallback;

	readonly #options: Required<QueueOptions>;

	readonly #queues: Map<string, Queue<Tail<CallbackParameters>, CallbackResult>> = new Map();

	/**
	 * Is any queue active?
	 */
	get active(): string[] {
		return this.#getStatus(STATUS_ACTIVE);
	}

	/**
	 * Does the queue automatically start when the first item is added?
	 */
	get autostart(): boolean {
		return this.#options.autostart;
	}

	/**
	 * Maximum number of runners to process the queue concurrently
	 */
	get concurrency(): number {
		return this.#options.concurrency;
	}

	/**
	 * Are all queues empty?
	 */
	get empty(): string[] {
		return this.#getStatus(STATUS_EMPTY);
	}

	/**
	 * Are all queues full?
	 */
	get full(): string[] {
		return this.#getStatus(STATUS_FULL);
	}

	/**
	 * Number of items in all queues
	 */
	get items(): Record<string, number> {
		const size: Record<string, number> = {};

		const queues = this.#queues.entries();

		for (const [key, queue] of queues) {
			size[key] = queue.size;
		}

		return size;
	}

	/**
	 * Keys of all queues
	 */
	get keys(): string[] {
		return [...this.#queues.keys()];
	}

	/**
	 * Maximum number of items allowed in the queue
	 */
	get maximum(): number {
		return this.#options.maximum;
	}

	/**
	 * Are all queues paused?
	 */
	get paused(): string[] {
		return this.#getStatus(STATUS_PAUSED);
	}

	/**
	 * Number of queues
	 */
	get queues(): number {
		return this.#queues.size;
	}

	constructor(callback: GenericAsyncCallback, options: Required<QueueOptions>) {
		this.#callback = callback;
		this.#options = options;
	}

	/**
	 * Queue an item for a specific key
	 * @param key Key to queue the item for
	 * @param parameters Parameters to use when item runs
	 * @param signal Optional signal to abort the item
	 * @returns Queued item
	 */
	add(
		key: string,
		parameters: Tail<CallbackParameters>,
		signal?: AbortSignal,
	): Queued<CallbackResult> {
		return this.#getQueue(key, true).add(parameters, signal);
	}

	/**
	 * Clear all items for a specific key _(or all items for all keys, if no key is provided)_
	 * @param key Optional key to clear the queue for
	 */
	clear(key?: string): void {
		this.#handleQueues(HANDLE_CLEAR, key);
	}

	/**
	 * Get the queue for a specific key
	 * @param key Key to get the queue for
	 * @returns Queue for the key, or `undefined` if it doesn't exist
	 */
	get(key: string): Queue<Tail<CallbackParameters>, CallbackResult> | undefined {
		return this.#getQueue(key);
	}

	/**
	 * Pause the queue for a specific key _(or all queues, if no key is provided)_
	 * @param key Optional key to pause the queue for
	 */
	pause(key?: string): void {
		this.#handleQueues(HANDLE_PAUSE, key);
	}

	/**
	 * Remove a specific item for a specific key
	 * @param key Key to remove the item for
	 * @param id ID of the item to remove
	 */
	remove(key: string, id: number): void;

	/**
	 * Remove a queue and its items for a specific key
	 *
	 * _(To remove all items for a specific key, use `clear()` instead)_
	 * @param key Key to remove the queue for
	 */
	remove(key: string): void;

	/**
	 * Remove all queues and their items
	 */
	remove(): void;

	remove(key?: string, id?: number): void {
		if (key == null) {
			this.#handleQueues(HANDLE_CLEAR);

			this.#queues.clear();

			return;
		}

		const queue = this.#getQueue(key);

		if (queue == null) {
			return;
		}

		if (typeof id === 'number') {
			queue.remove(id);

			return;
		}

		queue.clear();

		this.#queues.delete(key);
	}

	/**
	 * Resume the queue for a specific key _(or all queues, if no key is provided)_
	 * @param key Optional key to resume the queue for
	 */
	resume(key?: string): void {
		this.#handleQueues(HANDLE_RESUME, key);
	}

	#getQueue(key: string, add: true): Queue<Tail<CallbackParameters>, CallbackResult>;

	#getQueue(key: string): Queue<Tail<CallbackParameters>, CallbackResult> | undefined;

	#getQueue(
		key: string,
		add?: boolean,
	): Queue<Tail<CallbackParameters>, CallbackResult> | undefined {
		if (typeof key !== 'string' || key.trim().length === 0) {
			throw new TypeError(MESSAGE_KEY);
		}

		let queue = this.#queues.get(key);

		if (queue == null && add === true) {
			queue = new Queue(this.#callback, this.#options, key);

			this.#queues.set(key, queue);
		}

		return queue;
	}

	#getStatus(status: StatusKey): string[] {
		const queues = this.#queues.entries();
		const result: string[] = [];

		for (const [key, queue] of queues) {
			if (queue[status]) {
				result.push(key);
			}
		}

		return result;
	}

	#handleQueues(type: HandleType, key?: string): void {
		if (typeof key === 'string') {
			this.#getQueue(key)?.[type]();

			return;
		}

		const queues = this.#queues.values();

		for (const queue of queues) {
			queue[type]();
		}
	}
}

class Queue<CallbackParameters extends Parameters<GenericAsyncCallback>, CallbackResult> {
	readonly #callback: GenericAsyncCallback;

	readonly #handled: Array<GenericCallback> = [];

	#id = 0;

	readonly #items: Array<QueuedItem<CallbackParameters, CallbackResult>> = [];

	readonly #key: string | undefined;

	readonly #options: Required<QueueOptions>;

	#paused: boolean;

	#runners = 0;

	/**
	 * Is the queue active?
	 */
	get active(): boolean {
		return this.#runners > 0;
	}

	/**
	 * Does the queue automatically start when the first item is added?
	 */
	get autostart(): boolean {
		return this.#options.autostart;
	}

	/**
	 * Maximum number of runners to process the queue concurrently
	 */
	get concurrency(): number {
		return this.#options.concurrency;
	}

	/**
	 * Is the queue empty?
	 */
	get empty(): boolean {
		return this.#items.length === 0;
	}

	/**
	 * Is the queue full?
	 */
	get full(): boolean {
		return this.#options.maximum > 0 && this.#items.length >= this.#options.maximum;
	}

	/**
	 * Maximum number of items allowed in the queue
	 */
	get maximum(): number {
		return this.#options.maximum;
	}

	/**
	 * Is the queue paused?
	 */
	get paused(): boolean {
		return this.#paused;
	}

	/**
	 * Number of items in the queue
	 */
	get size(): number {
		return this.#items.length;
	}

	constructor(callback: GenericAsyncCallback, options: Required<QueueOptions>, key?: string) {
		this.#callback = callback;
		this.#key = key;
		this.#options = options;

		this.#paused = !options.autostart;
	}

	/**
	 * Add an item to the queue
	 * @param parameters Parameters to use when item runs
	 * @param signal Optional signal to abort the item
	 * @returns Queued item
	 */
	add(parameters: CallbackParameters, signal?: AbortSignal): Queued<CallbackResult> {
		if (this.full) {
			throw new QueueError(MESSAGE_MAXIMUM);
		}

		const abortSignal = signal instanceof AbortSignal ? signal : undefined;

		if (abortSignal?.aborted ?? false) {
			throw new Error(abortSignal!.reason);
		}

		const id = this.#identify();

		let rejector: (reason?: unknown) => void;
		let resolver: (value: QueuedResult<CallbackResult>) => void;

		const promise = new Promise<QueuedResult<CallbackResult>>((resolve, reject) => {
			rejector = reject;
			resolver = resolve;
		});

		const aborter = abortSignal == null ? undefined : () => rejector(abortSignal.reason);

		signal?.addEventListener(EVENT_NAME, aborter!, EVENT_OPTIONS);

		this.#items.push({
			id,
			parameters,
			promise,
			abort: aborter,
			key: this.#key,
			reject: rejector!,
			resolve: resolver!,
			signal: abortSignal,
		});

		if (this.#options.autostart) {
			void this.#run();
		}

		return {id, promise};
	}

	/**
	 * Remove and reject all items in the queue
	 */
	clear(): void {
		const items = this.#items.splice(0);
		const {length} = items;

		for (let index = 0; index < length; index += 1) {
			const {abort, reject, signal} = items[index];

			reject(new QueueError(MESSAGE_CLEAR));

			signal?.removeEventListener(EVENT_NAME, abort!);
		}
	}

	/**
	 * Pause the queue
	 *
	 * - Currently running items will not be stopped
	 * - New added items will not run until the queue is resumed
	 */
	pause(): void {
		this.#paused = true;
	}

	/**
	 * Remove and reject a specific item in the queue
	 * @param id ID of queued item
	 */
	remove(id: number): void {
		const index = this.#items.findIndex(item => item.id === id);

		if (index > -1) {
			const {abort, reject, signal} = this.#items.splice(index, 1)[0];

			reject(new QueueError(MESSAGE_REMOVE));

			signal?.removeEventListener(EVENT_NAME, abort!);
		}
	}

	/**
	 * Resume the queue
	 */
	resume(): void {
		if (this.#paused) {
			const handled = this.#handled.splice(0);
			const {length} = handled;

			for (let index = 0; index < length; index += 1) {
				handled[index]();
			}
		}

		this.#paused = false;

		const length = Math.min(this.#options.concurrency, this.#items.length);

		for (let index = 0; index < length; index += 1) {
			void this.#run();
		}
	}

	#identify(): number {
		this.#id += 1;

		return this.#id;
	}

	async #run(): Promise<void> {
		if (this.#paused || this.#runners >= this.#options.concurrency) {
			return;
		}

		this.#runners += 1;

		let item = this.#items.shift();

		while (item != null) {
			let error = false;

			let result: unknown | CallbackResult;

			try {
				if (!(item.signal?.aborted ?? false)) {
					const parameters =
						item.key == null
							? item.parameters
							: ([item.key, ...item.parameters] as Parameters<GenericAsyncCallback>);

					result = await this.#callback(...parameters);
				}
			} catch (thrown) {
				error = true;
				result = thrown;
			}

			if (this.#paused) {
				const paused = item;

				this.#handled.push(() => {
					handleQueuedResult(paused, error, result, this.#items.length === 0);
				});

				break;
			}

			handleQueuedResult(item, error, result, this.#items.length === 0);

			item = this.#items.shift();
		}

		this.#runners -= 1;
	}
}

class QueueError extends Error {
	constructor(message: string) {
		super(message);

		this.name = ERROR_NAME;
	}
}

type QueueOptions = {
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

type Queued<Value> = {
	/**
	 * ID of the queued promise _(can be used to remove it from the queue)_
	 */
	readonly id: number;
	/**
	 * Queued promise
	 */
	readonly promise: Promise<QueuedResult<Value>>;
};

type QueuedItem<CallbackParameters extends Parameters<GenericAsyncCallback>, CallbackResult> = {
	abort?: () => void;
	id: number;
	key?: string;
	parameters: CallbackParameters;
	promise: Promise<QueuedResult<CallbackResult>>;
	reject: (reason?: unknown) => void;
	resolve: (value: QueuedResult<CallbackResult>) => void;
	signal?: AbortSignal;
};

type QueuedResult<Value> = {
	/**
	 * Has the queue finished processing all items?
	 */
	finished: boolean;
	/**
	 * Result for the queued promise
	 */
	value: Value;
};

type StatusKey = 'active' | 'empty' | 'full' | 'paused';

type Tail<Values extends any[]> = Values extends [infer _, ...infer Rest] ? Rest : never;

// #endregion

// #region Functions

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

function handleQueuedResult<
	CallbackParameters extends Parameters<GenericAsyncCallback>,
	CallbackResult,
>(
	item: QueuedItem<CallbackParameters, CallbackResult>,
	error: boolean,
	result: unknown,
	finished: boolean,
): void {
	item.signal?.removeEventListener(EVENT_NAME, item.abort!);

	if (item.signal?.aborted ?? false) {
		item.reject();
	} else {
		if (error) {
			item.reject(result);
		} else {
			item.resolve({
				finished,
				value: result as CallbackResult,
			});
		}
	}
}

export function keyedQueue<Callback extends GenericAsyncCallback>(
	callback: Callback,
	options?: QueueOptions,
): KeyedQueue<Parameters<Callback>, Awaited<ReturnType<Callback>>> {
	if (typeof callback !== 'function') {
		throw new TypeError(MESSAGE_CALLBACK);
	}

	return new KeyedQueue(callback, getOptions(options));
}

/**
 * Create a queue for an asynchronous callback function
 * @param callback Callback function for queued items
 * @param options Queue options
 * @returns Queue instance
 */
export function queue<Callback extends (key: string, ...parameters: any[]) => Promise<void>>(
	callback: Callback,
	options?: QueueOptions,
): Queue<Parameters<Callback>, Awaited<ReturnType<Callback>>>;

/**
 * Create a queue for an asynchronous callback function
 * @param callback Callback function for queued items
 * @param options Queue options
 * @returns Queue instance
 */
export function queue<Callback extends GenericCallback>(
	callback: Callback,
	options?: QueueOptions,
): Queue<Parameters<Callback>, ReturnType<Callback>>;

export function queue(
	callback: GenericCallback,
	options?: QueueOptions,
): Queue<Parameters<GenericCallback>, ReturnType<GenericCallback>> {
	if (typeof callback !== 'function') {
		throw new TypeError(MESSAGE_CALLBACK);
	}

	return new Queue(callback, getOptions(options));
}

queue.keyed = keyedQueue;

// #endregion

// #region Variables

const ERROR_NAME = 'QueueError';

const EVENT_NAME = 'abort';

const EVENT_OPTIONS = {once: true};

const HANDLE_CLEAR: HandleType = 'clear';

const HANDLE_PAUSE: HandleType = 'pause';

const HANDLE_RESUME: HandleType = 'resume';

const MESSAGE_CALLBACK = 'A Queue requires a callback function';

const MESSAGE_CLEAR = 'Queue was cleared';

const MESSAGE_KEY = 'Key must be a non-empty string';

const MESSAGE_MAXIMUM = 'Queue has reached its maximum size';

const MESSAGE_REMOVE = 'Item removed from queue';

const STATUS_ACTIVE: StatusKey = 'active';

const STATUS_EMPTY: StatusKey = 'empty';

const STATUS_FULL: StatusKey = 'full';

const STATUS_PAUSED: StatusKey = 'paused';

// #endregion

// #region Exports

export {
	type KeyedQueue,
	type Queue,
	type Queued,
	type QueuedResult,
	type QueueError,
	type QueueOptions,
};

// #endregion
