import {noop} from './internal/function/misc';
import {isPlainObject} from './internal/is';
import {
	createSubscriptions,
	isSubscription,
	SUBSCRIPTION_NAME,
	type Subscription,
	type SubscriptionProperty,
	type Subscriptions,
} from './internal/subscription';
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
	 * The observable that can be subscribed to
	 */
	get observable(): Observable<Value>;

	/**
	 * The current value
	 */
	get value(): Value;

	/**
	 * Deactivate the beacon
	 */
	deactivate(): void;

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
	options: Required<BeaconOptions<Value>>;
	subscriptions: Subscriptions<Observer<unknown>>;
	value: Value;
};

export type Observable<Value> = {
	/**
	 * Is the observable active?
	 */
	get active(): boolean;

	/**
	 * Deactivate the observable
	 */
	deactivate(): void;

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
		options: getBeaconOptions(options),
		subscriptions: createSubscriptions(),
	};

	const instance: unknown = {
		deactivate: (): void => finishBeacon(state, false),
		emit: (value: never, finish?: never): void => update(BEACON_TYPE_NEXT, state, value, finish),
		error: (value: never, finish?: never): void => update(BEACON_TYPE_ERROR, state, value, finish),
		finish: (): void => finishBeacon(state, true),
	};

	Object.defineProperties(instance, {
		[BEACON_PROPERTY]: {
			value: BEACON_NAME,
		},
		active: {
			enumerable: true,
			get: () => state.active,
		},
		observable: {
			enumerable: true,
			get: () => getObservable(state),
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

	for (const [, observer] of state.subscriptions.state.values.to.any) {
		if (emit) {
			observer.complete?.();
		}
	}

	state.subscriptions.clear();

	state.observable?.deactivate();

	state.observable = undefined as never;
}

function getBeaconOptions<Value>(input?: BeaconOptions<Value>): Required<BeaconOptions<Value>> {
	const options: BeaconOptions<Value> = isPlainObject(input) ? (input as PlainObject) : {};

	options.equal = typeof options.equal === 'function' ? options.equal : Object.is;

	return options as Required<BeaconOptions<Value>>;
}

function getObservable<Value>(state: BeaconState<Value>): Observable<Value> {
	if (!state.active) {
		throw new Error(BEACON_MESSAGE_RETRIEVE);
	}

	state.observable ??= observe(state);

	return state.observable;
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
	return isBeaconInstance<Beacon<Value>>(BEACON_NAME, value);
}

function isBeaconInstance<Instance>(name: string, value: unknown): value is Instance {
	return isPlainObject(value) && (value as PlainObject)[BEACON_PROPERTY] === name;
}

/**
 * Is the value a beacon subscription?
 *
 * @param value Value to check
 * @returns `true` if the value is a beacon subscription, otherwise `false`
 */
export function isBeaconSubscription(value: unknown): value is Subscription {
	return isSubscription(value) && (value as PlainObject)[BEACON_PROPERTY] === SUBSCRIPTION_NAME;
}

/**
 * Is the value an observable?
 *
 * @param value Value to check
 * @returns `true` if the value is an observable, otherwise `false`
 */
export function isObservable<Value = unknown>(value: unknown): value is Observable<Value> {
	return isBeaconInstance<Observable<Value>>(BEACON_OBSERVABLE, value);
}

function observe<Value>(beacon: BeaconState<Value>): Observable<Value> {
	const state: ObservableState<Value> = {
		beacon,
		active: beacon.active,
	};

	const instance: unknown = {
		deactivate: () => {
			state.active = false;
		},
		subscribe: (first: never, second?: never, third?: never) =>
			subscribeToObservable(state, first, second, third),
	};

	Object.defineProperties(instance, {
		[BEACON_PROPERTY]: {
			value: BEACON_OBSERVABLE,
		},
		active: {
			enumerable: true,
			get: () => beacon.active && state.active,
		},
	});

	return Object.freeze(instance) as Observable<Value>;
}

function subscribeToObservable<Value>(
	state: ObservableState<Value>,
	first: never,
	second?: never,
	third?: never,
): Subscription {
	if (!state.beacon.active || !state.active) {
		throw new Error(BEACON_MESSAGE_SUBSCRIBE);
	}

	const observer = getObserver(first, second, third);

	const [subscription] = state.beacon.subscriptions.create({
		isActive: () => state.beacon.active && state.active,
		property: beaconSubscription,
		value: observer,
	});

	observer.next?.(state.beacon.value);

	return subscription;
}

function update<Value>(
	type: typeof BEACON_TYPE_NEXT | typeof BEACON_TYPE_ERROR,
	state: BeaconState<Value>,
	value: Error | Value,
	finish?: boolean,
): void {
	if (!state.active) {
		return;
	}

	if (type === BEACON_TYPE_NEXT) {
		if (state.options.equal(state.value, value as Value)) {
			return;
		}

		state.value = value as Value;
	}

	for (const [, observer] of state.subscriptions.state.values.to.any) {
		observer[type]?.(value as never);
	}

	if (finish === true) {
		finishBeacon(state, true);
	}
}

// #endregion

// #region Variables

const BEACON_MESSAGE_RETRIEVE = 'Cannot retrieve observable from a closed beacon';

const BEACON_MESSAGE_SUBSCRIBE = 'Cannot subscribe to a closed observable';

const BEACON_PROPERTY = '$beacon';

const BEACON_NAME = 'beacon';

const BEACON_OBSERVABLE = 'observable';

const BEACON_TYPE_ERROR = 'error';

const BEACON_TYPE_NEXT = 'next';

const beaconSubscription: SubscriptionProperty = {
	key: BEACON_PROPERTY,
};

// #endregion
