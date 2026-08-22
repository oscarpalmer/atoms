import {noop} from './internal/function/misc';
import {isPlainObject} from './internal/is';
import type {PlainObject} from './models';

// #region Types

/**
 * A beacon is a lighthouse, holding an observable value that can be subscribed to and emitted from
 */
export type Beacon<Value> = {
	/**
	 * Is the beacon active?
	 */
	get active(): boolean;

	/**
	 * Is the beacon closed?
	 */
	get closed(): boolean;

	/**
	 * The observable that can be subscribed to
	 */
	get observable(): Observable<Value>;

	/**
	 * The current value
	 */
	get value(): Value;

	/**
	 * Close the beacon
	 */
	close(): void;

	/**
	 * Emit a new value
	 *
	 * @param value Value to set and emit
	 * @param finish Finish the beacon after emitting? _(defaults to `false`)_
	 */
	emit(value: Value, finish?: boolean): void;

	/**
	 * Emit an error
	 *
	 * @param value Error to emit
	 * @param finish Finish the beacon after emitting? _(defaults to `false`)_
	 */
	error(value: Error, finish?: boolean): void;

	/**
	 * Finish the beacon
	 */
	finish(): void;
};

/**
 * Options for Beacon
 */
export type BeaconOptions<Value> = {
	/**
	 * Method for comparing values for equality
	 *
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
	observers: Map<Subscription, Observer<Value>>;
	options: Required<BeaconOptions<Value>>;
	value: Value;
};

export type Observable<Value> = {
	/**
	 * Is the observable active?
	 */
	get active(): boolean;

	/**
	 * Is the observable closed?
	 */
	get closed(): boolean;

	/**
	 * Close the observable
	 */
	close(): void;

	/**
	 * Subscribe to value changes
	 *
	 * @param onNext Callback for when the observable receives a new value
	 * @param onError Callback for when the observable receives an error
	 * @param onComplete Callback for when the observable is completed
	 * @returns Subscription to the observable
	 */
	subscribe(
		onNext: (value: Value) => void,
		onError?: (error: Error) => void,
		onComplete?: () => void,
	): Subscription;

	/**
	 * Subscribe to value changes
	 *
	 * @param observer Observer for changes
	 * @returns Subscription to the observable
	 */
	subscribe(observer: Observer<Value>): Subscription;
};

type ObservableState<Value> = {
	active: boolean;
	beacon: BeaconState<Value>;
};

/**
 * An observer receives notifications from an observable
 */
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

export type Subscription = {
	/**
	 * Is the subscription active?
	 */
	get active(): boolean;

	/**
	 * Is the subscription closed?
	 */
	get closed(): boolean;

	/**
	 * Close the subscription
	 */
	close(): void;

	/**
	 * Unsubscribe from its observable
	 */
	unsubscribe(): void;
};

// #endregion

// #region Functions

/**
 * Create a new beacon
 *
 * @param value Initial value
 * @param options Beacon options
 * @returns Beacon instance
 */
export function beacon<Value>(value: Value, options?: BeaconOptions<Value>): Beacon<Value> {
	const state: BeaconState<Value> = {
		value,
		active: true,
		observable: undefined as never,
		observers: new Map(),
		options: getBeaconOptions(options),
	};

	const instance = {
		close: (): void => {
			finishBeacon(state, false);
		},
		emit: (value: Value, finish?: boolean): void => {
			update(TYPE_NEXT, state, value, finish);
		},
		error: (value: Error, finish?: boolean): void => {
			update(TYPE_ERROR, state, value, finish);
		},
		finish: (): void => {
			finishBeacon(state, true);
		},
	};

	Object.defineProperties(instance, {
		[KEY_BEACON]: {
			enumerable: false,
			value: NAME_BEACON,
		},
		active: {
			enumerable: true,
			get: () => state.active,
		},
		closed: {
			enumerable: true,
			get: () => !state.active,
		},
		observable: {
			enumerable: true,
			get: () => {
				if (!state.active) {
					throw new Error(MESSAGE_BEACON);
				}

				state.observable ??= observe(state);

				return state.observable;
			},
		},
		value: {
			enumerable: true,
			get: () => state.value,
		},
	});

	return Object.freeze(instance) as Beacon<Value>;
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

		subscription.close();
	}

	state.observable?.close();
	state.observers.clear();

	state.observable = undefined as never;
}

function getBeaconOptions<Value>(input?: BeaconOptions<Value>): Required<BeaconOptions<Value>> {
	const options: BeaconOptions<Value> = isPlainObject(input) ? (input as PlainObject) : {};

	options.equal = typeof options.equal === 'function' ? options.equal : Object.is;

	return options as Required<BeaconOptions<Value>>;
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

/**
 * Is the value a beacon?
 *
 * @param value Value to check
 * @returns `true` if the value is a beacon, otherwise `false`
 */
export function isBeacon<Value = unknown>(value: unknown): value is Beacon<Value> {
	return isBeaconInstance<Beacon<Value>>(NAME_BEACON, value);
}

function isBeaconInstance<Instance>(name: string, value: unknown): value is Instance {
	return isPlainObject(value) && (value as PlainObject)[KEY_BEACON] === name;
}

/**
 * Is the value an observable?
 *
 * @param value Value to check
 * @returns `true` if the value is an observable, otherwise `false`
 */
export function isObservable<Value = unknown>(value: unknown): value is Observable<Value> {
	return isBeaconInstance<Observable<Value>>(NAME_OBSERVABLE, value);
}

/**
 * Is the value a subscription?
 *
 * @param value Value to check
 * @returns `true` if the value is a subscription, otherwise `false`
 */
export function isSubscription(value: unknown): value is Subscription {
	return isBeaconInstance<Subscription>(NAME_SUBSCRIPTION, value);
}

function observe<Value>(beacon: BeaconState<Value>): Observable<Value> {
	const state: ObservableState<Value> = {
		beacon,
		active: beacon.active,
	};

	const instance = {
		close: (): void => {
			state.active = false;
		},
		subscribe(
			first: Observer<Value> | ((value: Value) => void),
			second?: (error: Error) => void,
			third?: () => void,
		): Subscription {
			if (!beacon.active || !state.active) {
				throw new Error(MESSAGE_OBSERVABLE);
			}

			const observer = getObserver(first, second, third);
			const subscription = subscribe(state);

			beacon.observers.set(subscription, observer);

			observer.next?.(beacon.value);

			return subscription;
		},
	};

	Object.defineProperties(instance, {
		[KEY_BEACON]: {
			enumerable: false,
			value: NAME_OBSERVABLE,
		},
		active: {
			enumerable: true,
			get: () => beacon.active && state.active,
		},
		closed: {
			enumerable: true,
			get: () => !beacon.active || !state.active,
		},
	});

	return Object.freeze(instance) as Observable<Value>;
}

function subscribe<Value>(observable: ObservableState<Value>): Subscription {
	function unsubscribe(): void {
		if (active) {
			active = false;

			observable.beacon.observers.delete(instance as Subscription);
		}
	}

	let active = true;

	const instance = {
		close: (): void => {
			unsubscribe();
		},
		unsubscribe: (): void => {
			unsubscribe();
		},
	};

	Object.defineProperties(instance, {
		[KEY_BEACON]: {
			enumerable: false,
			value: NAME_SUBSCRIPTION,
		},
		active: {
			enumerable: true,
			get: () => observable.beacon.active && observable.active && active,
		},
		closed: {
			enumerable: true,
			get: () => !observable.beacon.active || !observable.active || !active,
		},
	});

	return Object.freeze(instance) as Subscription;
}

function update<Value>(
	type: keyof Observer<never>,
	state: BeaconState<Value>,
	value: Error | Value,
	finish?: boolean,
): void {
	if (!state.active) {
		return;
	}

	if (type === TYPE_NEXT) {
		if (state.options.equal(state.value, value as Value)) {
			return;
		}

		state.value = value as Value;
	}

	for (const [, observer] of state.observers) {
		observer[type]?.(value as never);
	}

	if (finish === true) {
		finishBeacon(state, true);
	}
}

// #endregion

// #region Variables

const KEY_BEACON = '$beacon';

const MESSAGE_BEACON = 'Cannot retrieve observable from a closed beacon';

const MESSAGE_OBSERVABLE = 'Cannot subscribe to a closed observable';

const NAME_BEACON = 'beacon';

const NAME_OBSERVABLE = 'observable';

const NAME_SUBSCRIPTION = 'subscription';

const TYPE_ERROR = 'error';

const TYPE_NEXT = 'next';

// #endregion
