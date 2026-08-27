import {noop} from './internal/function/misc';
import {isPlainObject} from './internal/is';
import {
	clearSubscriptions,
	getSubscription,
	getSubscriptions,
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
		subscriptions: getSubscriptions(),
	};

	const instance = {
		deactivate: (): void => {
			finishBeacon(state, false);
		},
		emit: (value: never, finish?: never): void => {
			update(TYPE_NEXT, state, value, finish);
		},
		error: (value: never, finish?: never): void => {
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

	for (const [, observer] of state.subscriptions.values.to.any) {
		if (emit) {
			observer.complete?.();
		}
	}

	clearSubscriptions(state.subscriptions);

	state.observable?.deactivate();

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

function observe<Value>(beacon: BeaconState<Value>): Observable<Value> {
	const state: ObservableState<Value> = {
		beacon,
		active: beacon.active,
	};

	const instance = {
		deactivate: (): void => {
			state.active = false;
		},
		subscribe(first: never, second?: never, third?: never): Subscription {
			if (!beacon.active || !state.active) {
				throw new Error(MESSAGE_OBSERVABLE);
			}

			const observer = getObserver(first, second, third);

			const subscription = getSubscription({
				isActive: () => beacon.active && state.active,
				property: beaconSubscription,
				subscriptions: beacon.subscriptions,
				value: observer,
			});

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
	});

	return Object.freeze(instance) as Observable<Value>;
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

	for (const [, observer] of state.subscriptions.values.to.any) {
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

const TYPE_ERROR = 'error';

const TYPE_NEXT = 'next';

const beaconSubscription: SubscriptionProperty = {
	key: KEY_BEACON,
};

// #endregion
