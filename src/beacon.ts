import {noop} from './internal/function/misc';
import {isPlainObject} from './internal/is';
import {
	isSubscription,
	SUBSCRIPTION_NAME,
	subscriptions,
	type Subscription,
	type SubscriptionProperty,
	type Subscriptions,
} from './internal/subscription';
import type {GenericCallback, PlainObject} from './models';

// #region Special variables

const BEACON_PROPERTY = '$beacon';

const BEACON_NAME = 'beacon';

const BEACON_OBSERVABLE = 'observable';

// #endregion

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
	observable?: Observable<Value>;
	options: Required<BeaconOptions<Value>>;
	subscriptions?: Subscriptions;
	value: Value;
};

type InternalBeacon = {
	[BEACON_SYMBOL]: BeaconState<unknown>;
} & Beacon<unknown>;

type InternalObservable = {
	[BEACON_SYMBOL]: ObservableState<unknown>;
} & Observable<unknown>;

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

// #region Instances

function Beacon(this: any, value: unknown, options?: BeaconOptions<unknown>) {
	this[BEACON_SYMBOL] = {
		value,
		active: true,
		options: createBeaconOptions(options),
	} satisfies BeaconState<unknown>;
}

Beacon.prototype[BEACON_PROPERTY] = BEACON_NAME;

Beacon.prototype.deactivate = deactivateBeacon;
Beacon.prototype.emit = emitBeaconValue;
Beacon.prototype.error = emitBeaconError;
Beacon.prototype.finish = finishBeacon;

Object.defineProperties(Beacon.prototype, {
	active: {
		enumerable: true,
		get(): boolean {
			return (this as InternalBeacon)[BEACON_SYMBOL].active;
		},
	},
	observable: {
		enumerable: true,
		get(): Observable<unknown> {
			return getObservable((this as InternalBeacon)[BEACON_SYMBOL]);
		},
	},
	value: {
		enumerable: true,
		get(): unknown {
			return (this as InternalBeacon)[BEACON_SYMBOL].value;
		},
	},
});

function Observable(this: any, beacon: BeaconState<unknown>) {
	this[BEACON_SYMBOL] = {
		beacon,
		active: beacon.active,
	} satisfies ObservableState<unknown>;
}

Observable.prototype[BEACON_PROPERTY] = BEACON_OBSERVABLE;

Observable.prototype.deactivate = deactiveateObservable;
Observable.prototype.subscribe = subscribeToObservable;

Object.defineProperty(Observable.prototype, 'active', {
	enumerable: true,
	get(): boolean {
		const state = (this as InternalObservable)[BEACON_SYMBOL];

		return state.beacon.active && state.active;
	},
});

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
	// @ts-expect-error All good, no worries :-)
	return new Beacon(value, options);
}

function closeBeacon<Value>(state: BeaconState<Value>, emit: boolean): void {
	if (!state.active) {
		return;
	}

	state.active = false;

	const subscriptions = state.subscriptions?.values.to.any;

	if (subscriptions != null && subscriptions.size > 0) {
		for (const [, observer] of subscriptions) {
			if (emit) {
				(observer as Observer<Value>).complete?.();
			}
		}
	}

	state.subscriptions?.clear();

	state.observable?.deactivate();

	state.observable = undefined as never;
}

function createBeaconOptions<Value>(input?: BeaconOptions<Value>): Required<BeaconOptions<Value>> {
	const options: BeaconOptions<Value> = isPlainObject(input) ? (input as PlainObject) : {};

	options.equal = typeof options.equal === 'function' ? options.equal : Object.is;

	return options as Required<BeaconOptions<Value>>;
}

function createObserver<Value>(first: unknown, second?: unknown, third?: unknown): Observer<Value> {
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
		observer.complete = getObservableCallback((first as Record<string, unknown>)?.complete);
		observer.error = getObservableCallback((first as Record<string, unknown>)?.error);
		observer.next = getObservableCallback((first as Record<string, unknown>)?.next);
	}

	return observer;
}

function deactivateBeacon(this: InternalBeacon): void {
	closeBeacon(this[BEACON_SYMBOL], false);
}

function deactiveateObservable(this: InternalObservable): void {
	this[BEACON_SYMBOL].active = false;
}

function emitBeaconError(this: InternalBeacon, error: unknown, finish?: boolean): void {
	updateBeacon(this, BEACON_TYPE_ERROR, error, finish ?? false);
}

function emitBeaconValue(this: InternalBeacon, value: unknown, finish?: boolean): void {
	updateBeacon(this, BEACON_TYPE_NEXT, value, finish ?? false);
}

function finishBeacon(this: InternalBeacon): void {
	closeBeacon(this[BEACON_SYMBOL], true);
}

function getObservable<Value>(state: BeaconState<Value>): Observable<Value> {
	if (!state.active) {
		throw new Error(BEACON_MESSAGE_RETRIEVE);
	}

	// @ts-expect-error All good, no worries :-)
	state.observable ??= new Observable(state);

	return state.observable!;
}

function getObservableCallback(value: unknown): GenericCallback {
	return typeof value === 'function' ? (value as GenericCallback) : noop;
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
	return (
		typeof value === 'object' && value !== null && (value as PlainObject)[BEACON_PROPERTY] === name
	);
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

function subscribeToObservable(
	this: InternalObservable,
	first: unknown,
	second?: unknown,
	third?: unknown,
): Subscription {
	const state = this[BEACON_SYMBOL];

	if (!state.beacon.active || !state.active) {
		throw new Error(BEACON_MESSAGE_SUBSCRIBE);
	}

	state.beacon.subscriptions ??= subscriptions({
		property: beaconSubscription,
	});

	const observer = createObserver(first, second, third);

	const [subscription] = state.beacon.subscriptions.create({
		isActive: () => state.beacon.active && state.active,
		value: observer,
	});

	observer.next?.(state.beacon.value);

	return subscription;
}

function updateBeacon(
	instance: InternalBeacon,
	type: typeof BEACON_TYPE_NEXT | typeof BEACON_TYPE_ERROR,
	value: unknown,
	finish?: boolean,
): void {
	const state = instance[BEACON_SYMBOL];

	if (!state.active) {
		return;
	}

	if (type === BEACON_TYPE_NEXT) {
		if (state.options.equal(state.value, value)) {
			return;
		}

		state.value = value;
	}

	const subscriptions = state.subscriptions?.values.to.any;

	if (subscriptions != null && subscriptions.size > 0) {
		for (const [, observer] of subscriptions) {
			(observer as Observer<unknown>)[type]?.(value as never);
		}
	}

	if (finish === true) {
		closeBeacon(state, true);
	}
}

// #endregion

// #region Variables

const BEACON_MESSAGE_RETRIEVE = 'Cannot retrieve observable from a closed beacon';

const BEACON_MESSAGE_SUBSCRIBE = 'Cannot subscribe to a closed observable';

const BEACON_SYMBOL = Symbol(BEACON_PROPERTY);

const BEACON_TYPE_ERROR = 'error';

const BEACON_TYPE_NEXT = 'next';

const beaconSubscription: SubscriptionProperty = {
	key: BEACON_PROPERTY,
	value: SUBSCRIPTION_NAME,
};

// #endregion
