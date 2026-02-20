import type {GenericAsyncCallback, GenericCallback} from './models';

// #region Types and classes

class Queue<CallbackParameters extends Parameters<GenericAsyncCallback>, CallbackResult> {
	readonly #callback: GenericAsyncCallback;

	readonly #handled: Array<GenericCallback> = [];

	#id = 0;

	readonly #items: Array<QueuedItem<CallbackParameters, CallbackResult>> = [];

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

	constructor(callback: GenericAsyncCallback, options: Required<QueueOptions>) {
		this.#callback = callback;
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
		let resolver: (value: CallbackResult) => void;

		const promise = new Promise<CallbackResult>((resolve, reject) => {
			rejector = reject;
			resolver = resolve;
		});

		const aborter = abortSignal == null ? undefined : () => rejector(abortSignal.reason);

		signal?.addEventListener(EVENT_NAME, aborter!, abortOptions);

		this.#items.push({
			id,
			parameters,
			promise,
			abort: aborter,
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
			let handler: GenericCallback;
			let result: unknown | CallbackResult;

			try {
				if (!(item.signal?.aborted ?? false)) {
					result = await this.#callback(...item.parameters);
					handler = item.resolve;
				}
			} catch (thrown) {
				result = thrown;
				handler = item.reject;
			}

			if (this.#paused) {
				const paused = item;

				this.#handled.push(() => {
					paused.signal?.removeEventListener(EVENT_NAME, paused.abort!);

					if (!(paused.signal?.aborted ?? false)) {
						handler(result);
					}
				});

				break;
			}

			item.signal?.removeEventListener(EVENT_NAME, item.abort!);

			if (!(item.signal?.aborted ?? false)) {
				handler!(result as CallbackResult);
			}

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
	readonly id: number;
	readonly promise: Promise<Value>;
};

type QueuedItem<CallbackParameters extends Parameters<GenericAsyncCallback>, CallbackResult> = {
	abort?: () => void;
	id: number;
	parameters: CallbackParameters;
	promise: Promise<CallbackResult>;
	reject: (reason?: unknown) => void;
	resolve: (value: CallbackResult) => void;
	signal?: AbortSignal;
};

// #endregion

// #region Functions

function getBooleanOrDefault(value: unknown, defaultValue: boolean): boolean {
	return typeof value === 'boolean' ? value : defaultValue;
}

function getNumberOrDefault(value: unknown, defaultValue: number): number {
	return typeof value === 'number' && value > 0 ? Math.floor(value) : defaultValue;
}

function getOptions(input?: QueueOptions): Required<QueueOptions> {
	const options = typeof input === 'object' && input != null ? input : {};

	return {
		autostart: getBooleanOrDefault(options.autostart, true),
		concurrency: getNumberOrDefault(options.concurrency, 1),
		maximum: getNumberOrDefault(options.maximum, 0),
	};
}

/**
 * Create a queue for an asynchronous callback function
 * @param callback Callback function for queued items
 * @param options Queue options
 * @returns Queue instance
 */
function queue<Callback extends GenericAsyncCallback>(
	callback: Callback,
	options?: QueueOptions,
): Queue<Parameters<Callback>, Awaited<ReturnType<Callback>>>;

/**
 * Create a queue for an asynchronous callback function
 * @param callback Callback function for queued items
 * @param options Queue options
 * @returns Queue instance
 */
function queue<Callback extends GenericCallback>(
	callback: Callback,
	options?: QueueOptions,
): Queue<Parameters<Callback>, ReturnType<Callback>>;

function queue(
	callback: GenericCallback,
	options?: QueueOptions,
): Queue<Parameters<GenericCallback>, ReturnType<GenericCallback>> {
	if (typeof callback !== 'function') {
		throw new TypeError(MESSAGE_CALLBACK);
	}

	return new Queue(callback, getOptions(options));
}

// #endregion

// #region Variables

const abortOptions = {once: true};

const ERROR_NAME = 'QueueError';

const EVENT_NAME = 'abort';

const MESSAGE_CALLBACK = 'A Queue requires a callback function';

const MESSAGE_CLEAR = 'Queue was cleared';

const MESSAGE_MAXIMUM = 'Queue has reached its maximum size';

const MESSAGE_REMOVE = 'Item removed from queue';

// #endregion

// #region Exports

export {queue, QueueError, type Queue, type Queued, type QueueOptions};

// #endregion
