import {noop} from './internal/function';
import {isPlainObject} from './internal/is';
import type {PlainObject} from './models';

// #region Types and classes

class Beacon<Value> {
	readonly #options: Options;
	readonly #state: BeaconState<Value>;

	/**
	 * Is the beacon active?
	 */
	get active(): boolean {
		return this.#state.active;
	}

	/**
	 * The observable that can be subscribed to
	 */
	get observable(): Observable<Value> {
		if (!this.#state.active) {
			throw new Error(DESTROYED_BEACON);
		}

		return this.#state.observable;
	}

	/**
	 * The current value
	 */
	get value(): Value {
		return this.#state.value;
	}

	constructor(value: Value, options?: BeaconOptions<Value>) {
		const observers = new Map<Subscription<Value>, Observer<Value>>();

		this.#options = getBeaconOptions(options);

		this.#state = {
			observers,
			value,
			active: true,
			observable: new Observable(this, observers),
		};
	}

	/**
	 * Destroy the beacon
	 */
	destroy(): void {
		finishBeacon(this.#state, false);
	}

	/**
	 * Emit a new value
	 * @param value Value to set and emit
	 * @param finish Finish the beacon after emitting? _(defaults to `false`)_
	 */
	emit(value: Value, finish?: boolean): void {
		this.#on('next', value, finish);
	}

	/**
	 * Emit an error
	 * @param value Error to emit
	 * @param finish Finish the beacon after emitting? _(defaults to `false`)_
	 */
	error(value: Error, finish?: boolean): void {
		this.#on('error', value, finish);
	}

	/**
	 * Finish the beacon
	 */
	finish(): void {
		finishBeacon(this.#state, true);
	}

	#on(type: keyof Observer<never>, value: Error | Value, finish?: boolean): void {
		if (!this.#state.active) {
			return;
		}

		if (type === 'next') {
			if (this.#options.equal(this.#state.value, value as Value)) {
				return;
			}

			this.#state.value = value as Value;
		}

		for (const [, observer] of this.#state.observers) {
			observer[type]?.(value as never);
		}

		if (finish === true) {
			finishBeacon(this.#state, true);
		}
	}
}

/**
 * Options for Beacon
 */
type BeaconOptions<Value> = {
	/**
	 * Method for comparing values for equality
	 * @param first First value
	 * @param second Second value
	 * @returns `true` if the values are equal, otherwise `false`
	 * @default Object.is
	 */
	equal?: (first: Value, second: Value) => boolean;
};

type BeaconState<Value> = {
	active: boolean;
	observable: Observable<Value>;
	observers: Map<Subscription<Value>, Observer<Value>>;
	value: Value;
};

class Observable<Value> {
	readonly #state: ObservableState<Value>;

	constructor(instance: Beacon<Value>, observers: Map<Subscription<Value>, Observer<Value>>) {
		this.#state = {
			observers,
			beacon: instance,
			closed: false,
		};
	}

	/**
	 * Destroy the observable
	 */
	destroy(): void {
		this.#state.closed = true;
	}

	/**
	 * Subscribe to value changes
	 * @param onNext Callback for when the observable receives a new value
	 * @param onError Callback for when the observable receives an error
	 * @param onComplete Callback for when the observable is completed
	 * @returns Subscription to the observable
	 */
	subscribe(
		onNext: (value: Value) => void,
		onError?: (error: Error) => void,
		onComplete?: () => void,
	): Subscription<Value>;

	/**
	 * Subscribe to value changes
	 * @param observer Observer for changes
	 * @returns Subscription to the observable
	 */
	subscribe(observer: Observer<Value>): Subscription<Value>;

	subscribe(
		first: Observer<Value> | ((value: Value) => void),
		second?: (error: Error) => void,
		third?: () => void,
	): Subscription<Value> {
		if (this.#state.closed) {
			throw new Error(DESTROYED_OBSERVABLE);
		}

		const observer = getObserver(first, second, third);
		const instance = new Subscription(this.#state);

		this.#state.observers.set(instance, observer);

		observer.next?.(this.#state.beacon.value);

		return instance;
	}
}

type ObservableState<Value> = {
	beacon: Beacon<Value>;
	closed: boolean;
	observers: Map<Subscription<Value>, Observer<Value>>;
};

type Observer<Value> = {
	/**
	 * Callback for when the observable is completed
	 */
	complete?: () => void;
	/**
	 * Callback for when the observable receives an error
	 */
	error?: (error: Error) => void;
	/**
	 * Callback for when the observable receives a new value
	 */
	next?: (value: Value) => void;
};

type Options = Required<BeaconOptions<unknown>>;

class Subscription<Value> {
	readonly #state: SubscriptionState<Value>;

	constructor(state: ObservableState<Value>) {
		this.#state = {
			...state,
			closed: false,
		};
	}

	/**
	 * Is the subscription closed?
	 */
	get closed(): boolean {
		return this.#state.closed || !this.#state.beacon.active;
	}

	/**
	 * Destroy the subscription
	 */
	destroy(): void {
		if (!this.#state.closed) {
			this.unsubscribe();
		}
	}

	/**
	 * Unsubscribe from its observable
	 */
	unsubscribe(): void {
		if (!this.#state.closed) {
			this.#state.closed = true;

			this.#state.observers.delete(this);
		}
	}
}

type SubscriptionState<Value> = {
	closed: boolean;
	beacon: Beacon<Value>;
	observers: Map<Subscription<Value>, Observer<Value>>;
};

// #endregion

// #region Functions

/**
 * Create a new beacon
 * @param value Initial value
 * @param options Beacon options
 * @returns Beacon instance
 */
export function beacon<Value>(value: Value, options?: BeaconOptions<Value>): Beacon<Value> {
	return new Beacon(value, options);
}

function finishBeacon<Value>(state: BeaconState<Value>, emit: boolean): void {
	if (!state.active) {
		return;
	}

	state.active = false;

	const entries = [...state.observers.entries()];
	const {length} = entries;

	for (let index = 0; index < length; index += 1) {
		const [subscription, observer] = entries[index];

		if (emit) {
			observer.complete?.();
		}

		subscription.destroy();
	}

	state.observable?.destroy();

	state.observers.clear();
}

function getBeaconOptions(input?: BeaconOptions<never>): Options {
	const options: Partial<Options> = isPlainObject(input) ? (input as PlainObject) : {};

	options.equal = typeof options.equal === 'function' ? options.equal : Object.is;

	return options as Options;
}

function getObservableCallback<Callback>(value: Callback): Callback {
	return typeof value === 'function' ? value : (noop as Callback);
}

function getObserver<Value>(
	first: Observer<Value> | ((value: Value) => void),
	second?: (error: Error) => void,
	third?: () => void,
): Observer<Value> {
	let observer: Observer<Value> = {
		next: noop,
	};

	if (typeof first === 'function') {
		observer = {
			error: getObservableCallback(second),
			next: getObservableCallback(first),
			complete: getObservableCallback(third),
		};
	} else if (typeof first === 'object') {
		observer.complete = getObservableCallback(first?.complete);
		observer.error = getObservableCallback(first?.error);
		observer.next = getObservableCallback(first?.next);
	}

	return observer;
}

// #endregion

// #region Constants

const DESTROYED_BEACON = 'Cannot retrieve observable from a destroyed beacon';

const DESTROYED_OBSERVABLE = 'Cannot subscribe to a destroyed observable';

// #endregion

// #region Exports

export type {Beacon, BeaconOptions, Observable, Observer, Subscription};

// #endregion
