import type {Key} from '../models';
import {createAborter, type Aborter} from './abort';
import {isKey, isPlainObject} from './is';

// #region Types

export type Subscription = {
	/**
	 * Is the subscription active?
	 */
	get active(): boolean;

	/**
	 * Unsubscribe from changes
	 */
	unsubscribe(): void;
};

export type SubscriptionParameters = {
	isActive?: () => boolean;
	key?: unknown;
	property: SubscriptionProperty;
	signal?: AbortSignal;
	value: unknown;
};

export type SubscriptionProperty = {
	key: string;
	value?: unknown;
};

type SubscriptionState = {
	aborter?: Aborter;
	active: boolean;
	parameters: SubscriptionParameters;
};

export type Subscriptions<Value = unknown> = {
	state: SubscriptionsState<Value>;
	clear: () => void;
	create: (parameters: SubscriptionParameters) => [Subscription, boolean];
};

type SubscriptionsState<Value = unknown> = {
	items: SubscriptionsItems;
	keys?: Set<Key>;
	values: SubscriptionsValues<Value>;
};

type SubscriptionsItems = {
	any: Set<Subscription>;
	keyed?: Map<Key, Set<Subscription>>;
};

type SubscriptionsValues<Value = unknown> = {
	from: SubscriptionsValuesItem<Value, Subscription>;
	to: SubscriptionsValuesItem<Subscription, Value>;
};

type SubscriptionsValuesItem<MapKey, MapValue> = {
	any: Map<MapKey, MapValue>;
	keyed?: Map<Key, Map<MapKey, MapValue>>;
};

// #endregion

// #region Functions

function addSubscription(
	subscriptions: Subscriptions,
	subscription: Subscription,
	state: SubscriptionState,
): void {
	const {key, value} = state.parameters;
	const {items, values} = subscriptions.state;

	if (!isKey(key)) {
		items.any.add(subscription);
		values.from.any.set(value, subscription);
		values.to.any.set(subscription, value);

		return;
	}

	/* istanbul ignore if */
	if (items.keyed == null || values.from.keyed == null || values.to.keyed == null) {
		// TODO: fix tests or document
		// istanbul ignore next
		return;
	}

	let keyedItems = items.keyed.get(key);

	if (keyedItems == null) {
		keyedItems = new Set();

		items.keyed.set(key, keyedItems);
	}

	keyedItems.add(subscription);

	let keyedFrom = values.from.keyed.get(key);

	if (keyedFrom == null) {
		keyedFrom = new Map();

		values.from.keyed.set(key, keyedFrom);
	}

	keyedFrom.set(value, subscription);

	let keyedTo = values.to.keyed.get(key);

	if (keyedTo == null) {
		keyedTo = new Map();

		values.to.keyed.set(key, keyedTo);
	}

	keyedTo.set(subscription, value);
}

function clearSubscriptions<Value>(store: SubscriptionsState<Value>): void {
	for (const susbcription of store.values.to.any.keys()) {
		susbcription.unsubscribe();
	}

	if (store.values.to.keyed != null) {
		for (const values of store.values.to.keyed.values()) {
			for (const susbcription of values.keys()) {
				susbcription.unsubscribe();
			}
		}
	}
}

function createSubscription(
	subscriptions: Subscriptions,
	parameters: SubscriptionParameters,
): [Subscription, boolean] {
	if (parameters.signal?.aborted ?? false) {
		throw new Error(parameters.signal?.reason);
	}

	const state: SubscriptionState = {
		parameters,
		active: true,
	};

	const existing = getExistingSubscription(subscriptions, state);

	if (existing != null) {
		return [existing, true];
	}

	if (
		subscriptions.state.keys != null &&
		isKey(parameters.key) &&
		!subscriptions.state.keys.has(parameters.key)
	) {
		throw new Error(SUBSCRIPTION_INVALID_KEY);
	}

	state.aborter = createAborter(parameters.signal, () =>
		unsubscribe(subscriptions, instance as Subscription, state),
	);

	const instance: unknown = {
		unsubscribe: () => unsubscribe(subscriptions, instance as Subscription, state),
	};

	Object.defineProperties(instance, {
		[SUBSCRIPTION_PROPERTY]: {
			value: true,
		},
		[parameters.property.key]: {
			value: parameters.property.value ?? SUBSCRIPTION_NAME,
		},
		active: {
			enumerable: true,
			get: () => (parameters.isActive?.() ?? true) && state.active,
		},
	});

	addSubscription(subscriptions, instance as Subscription, state);

	return [Object.freeze(instance) as Subscription, false];
}

export function createSubscriptions<Value = unknown>(keys?: Set<Key>): Subscriptions<Value> {
	const state: SubscriptionsState<Value> = {
		keys,
		items: {
			any: new Set(),
			keyed: keys == null ? undefined : new Map(),
		},
		values: {
			from: {
				any: new Map(),
				keyed: keys == null ? undefined : new Map(),
			},
			to: {
				any: new Map(),
				keyed: keys == null ? undefined : new Map(),
			},
		},
	};

	const instance: unknown = {
		state,
		clear: () => clearSubscriptions(state),
		create: (parameters: never) => createSubscription(instance as Subscriptions, parameters),
	};

	return instance as Subscriptions<Value>;
}

function getExistingSubscription(
	subscriptions: Subscriptions,
	state: SubscriptionState,
): Subscription | undefined {
	const {parameters} = state;
	const {values} = subscriptions.state;

	return isKey(parameters.key)
		? values.from.keyed?.get(parameters.key)?.get(parameters.value)
		: values.from.any.get(parameters.value);
}

/**
 * Is the value a subscription?
 *
 * @param value Value to check
 * @returns `true` if the value is a subscription, otherwise `false`
 */
export function isSubscription(value: unknown): value is Subscription {
	return (
		isPlainObject(value) && SUBSCRIPTION_PROPERTY in value && value[SUBSCRIPTION_PROPERTY] === true
	);
}

function removeFromStore(
	items: Set<Subscription>,
	values: SubscriptionsValues,
	subscription: Subscription,
	value: unknown,
	key?: Key,
): void {
	items.delete(subscription);

	if (key == null) {
		values.from.any.delete(value);
		values.to.any.delete(subscription);
	} else {
		values.from.keyed?.get(key)?.delete(value);
		values.to.keyed?.get(key)?.delete(subscription);
	}
}

function removeSubscription(
	subscriptions: Subscriptions,
	subscription: Subscription,
	state: SubscriptionState,
): void {
	if (!state.active) {
		return;
	}

	state.aborter = undefined;
	state.active = false;

	state.parameters.isActive = undefined;
	state.parameters.signal = undefined;

	const {key, value} = state.parameters;
	const {items, values} = subscriptions.state;

	if (!isKey(key)) {
		removeFromStore(items.any, values, subscription, value);

		return;
	}

	const keyed = items.keyed?.get(key);

	/* istanbul ignore if */
	if (items.keyed == null || keyed == null) {
		// TODO, fix tests or document
		// istanbul ignore next
		return;
	}

	removeFromStore(keyed, values, subscription, value, key);

	if (keyed.size === 0) {
		items.keyed.delete(key);
	}
}

function unsubscribe(
	subscriptions: Subscriptions,
	subscription: Subscription,
	state: SubscriptionState,
): void {
	state.aborter?.cancel();

	removeSubscription(subscriptions, subscription, state);
}

// #endregion

// #region Variables

const SUBSCRIPTION_INVALID_KEY = 'Invalid key for subscription';

export const SUBSCRIPTION_NAME = 'subscription';

const SUBSCRIPTION_PROPERTY = '$subscription';

// #endregion
