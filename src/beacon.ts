import {noop} from './internal/function/misc';
import {isPlainObject} from './internal/is';
import {isSubscription, subscriptions} from './internal/subscription';
import {
	BEACON_MESSAGE_RETRIEVE,
	BEACON_MESSAGE_SUBSCRIBE,
	BEACON_NAME,
	BEACON_OBSERVABLE,
	BEACON_PROPERTY,
	BEACON_SYMBOL,
	BEACON_TYPE_ERROR,
	BEACON_TYPE_NEXT,
	type Beacon,
	type BeaconOptions,
	type BeaconState,
	type InternalBeacon,
	type InternalObservable,
	type Observable,
	type Observer,
	beaconSubscription,
} from './models/beacon.model';
import type {GenericCallback, PlainObject} from './models/index';
import {SUBSCRIPTION_NAME} from './models/subscription.model';
import type {Subscription} from './subscription';

// #region Instances

function Beacon(this: any, value: unknown, options?: BeaconOptions<unknown>): void {
	this[BEACON_SYMBOL] = {
		value,
		active: true,
		options: createBeaconOptions(options),
	};
}

Beacon.prototype[BEACON_PROPERTY] = BEACON_NAME;

Beacon.prototype.deactivate = deactivateBeacon;
Beacon.prototype.emit = emitBeaconValue;
Beacon.prototype.error = emitBeaconError;
Beacon.prototype.finish = finishBeacon;

Object.defineProperties(Beacon.prototype, {
	active: {
		enumerable: true,
		get: getBeaconActive,
	},
	observable: {
		enumerable: true,
		get: getBeaconObservable,
	},
	value: {
		enumerable: true,
		get: getBeaconValue,
	},
});

function Observable(this: any, beacon: BeaconState<unknown>): void {
	this[BEACON_SYMBOL] = {
		beacon,
		active: beacon.active,
	};
}

Observable.prototype[BEACON_PROPERTY] = BEACON_OBSERVABLE;

Observable.prototype.deactivate = deactivateObservable;
Observable.prototype.subscribe = subscribeToObservable;

Object.defineProperty(Observable.prototype, 'active', {
	enumerable: true,
	get: getObservableActive,
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
				observer.complete?.();
			}
		}
	}

	state.subscriptions?.clear();

	state.observable?.deactivate();

	state.observable = undefined;
}

function createBeaconOptions<Value>(input?: BeaconOptions<Value>): Required<BeaconOptions<Value>> {
	const options: BeaconOptions<Value> = isPlainObject(input) ? input : {};

	return {
		equal: typeof options.equal === 'function' ? options.equal : Object.is,
	};
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
		const object = first as Record<string, unknown>;

		observer.complete = getObservableCallback(object?.complete);
		observer.error = getObservableCallback(object?.error);
		observer.next = getObservableCallback(object?.next);
	}

	return observer;
}

function deactivateBeacon(this: InternalBeacon): void {
	closeBeacon(this[BEACON_SYMBOL], false);
}

function deactivateObservable(this: InternalObservable): void {
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

function getBeaconActive(this: InternalBeacon): boolean {
	return this[BEACON_SYMBOL].active;
}

function getBeaconObservable(this: InternalBeacon): Observable<unknown> {
	const state = this[BEACON_SYMBOL];

	if (!state.active) {
		throw new Error(BEACON_MESSAGE_RETRIEVE);
	}

	// @ts-expect-error All good, no worries :-)
	state.observable ??= new Observable(state);

	return state.observable!;
}

function getBeaconValue(this: InternalBeacon): unknown {
	return this[BEACON_SYMBOL].value;
}

function getObservableActive(this: InternalObservable): boolean {
	const state = this[BEACON_SYMBOL];

	return state.beacon.active && state.active;
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
		typeof value === 'object' &&
		value !== null &&
		BEACON_PROPERTY in value &&
		value[BEACON_PROPERTY] === name
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
			observer[type]?.(value as never);
		}
	}

	if (finish === true) {
		closeBeacon(state, true);
	}
}

// #endregion

// #region Exports

export type {Beacon, BeaconOptions, Observable, Observer};

// #endregion
