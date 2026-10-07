import type {GenericAsyncCallback, GenericCallback} from '.';
import type {Aborter} from './aborter.model';

// #region Types

export type InternalKeyedQueue = {
	[QUEUE_SYMBOL]: KeyedQueueState;
} & KeyedQueue<GenericAsyncCallback, unknown[]>;

export type InternalQueue = {
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

export type KeyedQueueState = {
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

export type QueueHandleType = 'clear' | 'pause' | 'resume';

export type QueueState = {
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

export type QueuedItem = {
	aborter?: Aborter;
	id: number;
	key?: string;
	parameters: unknown[];
	promise: Promise<unknown>;
	reject(reason?: unknown): void;
	resolve(value: unknown): void;
};

export type QueueStatusKey = 'active' | 'empty' | 'full' | 'paused';

type Tail<Values extends any[]> = Values extends [infer _, ...infer Rest] ? Rest : never;

// #endregion

// #region Variables

export const QUEUE_ERROR_NAME = 'QueueError';

export const QUEUE_HANDLE_CLEAR: QueueHandleType = 'clear';

export const QUEUE_HANDLE_PAUSE: QueueHandleType = 'pause';

export const QUEUE_HANDLE_RESUME: QueueHandleType = 'resume';

export const QUEUE_MESSAGE_CALLBACK = 'A Queue requires a callback function';

export const QUEUE_MESSAGE_CLEAR = 'Queue was cleared';

export const QUEUE_MESSAGE_KEY = 'Key must be a non-empty string';

export const QUEUE_MESSAGE_MAXIMUM = 'Queue has reached its maximum size';

export const QUEUE_MESSAGE_REMOVE = 'Item removed from queue';

export const QUEUE_NAME_KEYED = 'keyedQueue';

export const QUEUE_NAME_QUEUE = 'queue';

export const QUEUE_PROPERTY = '$queue';

export const QUEUE_STATUS_ACTIVE: QueueStatusKey = 'active';

export const QUEUE_STATUS_EMPTY: QueueStatusKey = 'empty';

export const QUEUE_STATUS_FULL: QueueStatusKey = 'full';

export const QUEUE_STATUS_PAUSED: QueueStatusKey = 'paused';

export const QUEUE_SYMBOL: unique symbol = Symbol(QUEUE_PROPERTY);

// #endregion
