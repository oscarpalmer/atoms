import {
	type Subscription,
	type SubscriptionProperty,
	type Subscriptions,
	SUBSCRIPTION_NAME,
} from './subscription.model';

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

export type BeaconState<Value> = {
	active: boolean;
	observable?: Observable<Value>;
	options: Required<BeaconOptions<Value>>;
	subscriptions?: Subscriptions<Observer<unknown>>;
	value: Value;
};

export type InternalBeacon = {
	[BEACON_SYMBOL]: BeaconState<unknown>;
} & Beacon<unknown>;

export type InternalObservable = {
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

export type ObservableState<Value> = {
	active: boolean;
	beacon: BeaconState<Value>;
};

export type Observer<Value> = {
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

// #region Variables

export const BEACON_MESSAGE_RETRIEVE = 'Cannot retrieve observable from a closed beacon';

export const BEACON_MESSAGE_SUBSCRIBE = 'Cannot subscribe to a closed observable';

export const BEACON_PROPERTY = '$beacon';

export const BEACON_NAME = 'beacon';

export const BEACON_OBSERVABLE = 'observable';

export const BEACON_SYMBOL: unique symbol = Symbol(BEACON_PROPERTY);

export const BEACON_TYPE_ERROR = 'error';

export const BEACON_TYPE_NEXT = 'next';

export const beaconSubscription: SubscriptionProperty = {
	key: BEACON_PROPERTY,
	value: SUBSCRIPTION_NAME,
};

// #endregion
