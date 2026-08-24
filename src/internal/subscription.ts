import type {Key} from '../models';
import {isPlainObject} from './is';

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
	key?: Key;
	property: SubscriptionProperty;
	subscriptions: Subscriptions;
	value: unknown;
};

export type SubscriptionProperty = {
	key: string;
	value: unknown;
};

type SubscriptionState = {
	active: boolean;
	parameters: SubscriptionParameters;
};

export type Subscriptions<Value = unknown> = {
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

function addSubscription(subscription: Subscription, state: SubscriptionState): void {
	const {key, subscriptions, value} = state.parameters;
	const {items, values} = subscriptions;

	if (key == null) {
		items.any.add(subscription);
		values.from.any.set(value, subscription);
		values.to.any.set(subscription, value);

		return;
	}

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

export function clearSubscriptions(store: Subscriptions): void {
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

function getExistingSubscription(state: SubscriptionState): Subscription | undefined {
	const {parameters} = state;
	const {values} = parameters.subscriptions;

	return parameters.key == null
		? values.from.any.get(parameters.value)
		: values.from.keyed?.get(parameters.key)?.get(parameters.value);
}

export function getSubscription(parameters: SubscriptionParameters): Subscription {
	const state: SubscriptionState = {
		parameters,
		active: true,
	};

	const existing = getExistingSubscription(state);

	if (existing != null) {
		return existing;
	}

	if (
		parameters.subscriptions.keys != null &&
		parameters.key != null &&
		!parameters.subscriptions.keys.has(parameters.key)
	) {
		throw new Error();
	}

	const instance = {
		unsubscribe: () => {
			removeSubscription(instance as Subscription, state);
		},
	};

	Object.defineProperties(instance, {
		[PROPERTY]: {
			enumerable: false,
			value: true,
		},
		[parameters.property.key]: {
			enumerable: false,
			value: parameters.property.value,
		},
		active: {
			enumerable: true,
			get: () => (parameters.isActive?.() ?? true) && state.active,
		},
	});

	addSubscription(instance as Subscription, state);

	return Object.freeze(instance) as Subscription;
}

export function getSubscriptions<Value = unknown>(keys?: Set<Key>): Subscriptions<Value> {
	return {
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
}

/**
 * Is the value a subscription?
 *
 * @param value Value to check
 * @returns `true` if the value is a subscription, otherwise `false`
 */
export function isSubscription(value: unknown): value is Subscription {
	return isPlainObject(value) && PROPERTY in value && value[PROPERTY] === true;
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

function removeSubscription(subscription: Subscription, state: SubscriptionState): void {
	if (!state.active) {
		return;
	}

	state.active = false;

	const {key, subscriptions, value} = state.parameters;
	const {items, values} = subscriptions;

	if (key == null) {
		removeFromStore(items.any, values, subscription, value);

		return;
	}

	const keyed = items.keyed?.get(key);

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

// #endregion

// #region Variables

const PROPERTY = '$subscription';

// #endregion
