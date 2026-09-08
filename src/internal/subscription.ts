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

/**
 * Parameters for creating a subscription
 */
export type SubscriptionParameters = {
	/**
	 * Is the owner of the subscription alive? _(defaults to `true`)_
	 */
	isActive?: () => boolean;
	/**
	 * Key used to identify a subscription _(defaults to `undefined`)_
	 */
	key?: unknown;
	/**
	 * Signal used to abort the subscription _(defaults to `undefined`)_
	 */
	signal?: AbortSignal;
	/**
	 * Value used to identify a subscription
	 */
	value: unknown;
};

/**
 * Property information for subscription identification
 */
export type SubscriptionProperty = {
	/**
	 * Name of the property used to identify a subscription
	 */
	key: string;
	/**
	 * Value of the property used to identify a subscription
	 */
	value: unknown;
};

type SubscriptionState = {
	aborter?: Aborter;
	active: boolean;
	parameters: SubscriptionParameters;
};

export type Subscriptions<Value = unknown> = {
	/**
	 * Items of the subscriptions store
	 *
	 * - `any` - Set of subscriptions _(for unkeyed subscriptions)_
	 * - `keyed` - Map of keys to sets of subscriptions _(for keyed subscriptions)_
	 */
	readonly items: Readonly<SubscriptionsItems>;

	/**
	 * Values of the subscriptions store
	 *
	 * - `from.any` - Map of values to subscriptions _(for unkeyed subscriptions)_
	 * - `from.keyed` - Map of keys to maps of values to subscriptions _(for keyed subscriptions)_
	 * - `to.any` - Map of subscriptions to values _(for unkeyed subscriptions)_
	 * - `to.keyed` - Map of keys to maps of subscriptions to values _(for keyed subscriptions)_
	 */
	readonly values: Readonly<SubscriptionsValues<Value>>;

	/**
	 * Clear all subscriptions
	 */
	clear: () => void;

	/**
	 * Create _(or retrieve)_ a subscription
	 *
	 * @param parameters Subscription parameters
	 * @returns Tuple holding subsccription and existing boolean
	 */
	create: (parameters: SubscriptionParameters) => [Subscription, boolean];
};

/**
 * Parameters for creating a subscription store
 */
export type SubscriptionsParameters = {
	/**
	 * Allow any or specific keys for subscriptions? _(defaults to `false`, which prevents keyed subscriptions)_
	 */
	keys?: boolean | Set<Key>;
	/**
	 * Property information for subscription identification
	 */
	property?: SubscriptionProperty;
};

type SubscriptionsState = {
	items: SubscriptionsItems;
	keys: boolean | Set<Key>;
	values: SubscriptionsValues;
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
	subscriptions: SubscriptionsState,
	subscription: Subscription,
	state: SubscriptionState,
): void {
	const {items, values} = subscriptions;
	const {key, value} = state.parameters;

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

function clearSubscriptions(store: SubscriptionsState): void {
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
	subscriptions: SubscriptionsState,
	property: SubscriptionProperty,
	params: SubscriptionParameters,
): [Subscription, boolean] {
	const parameters = createSubscriptionParameters(params);

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

	if (subscriptions.keys != null && isKey(parameters.key)) {
		if (subscriptions.keys === false) {
			throw new Error(SUBSCRIPTION_DISALLOWED_KEY);
		} else if (subscriptions.keys !== true && !subscriptions.keys.has(parameters.key)) {
			throw new Error(SUBSCRIPTION_INVALID_KEY);
		}
	}

	state.aborter = createAborter(parameters.signal, () =>
		unsubscribe(subscriptions, instance as Subscription, state),
	);

	const instance: unknown = {
		unsubscribe: () => unsubscribe(subscriptions, instance as Subscription, state),
	};

	Object.defineProperties(instance, {
		[SUBSCRIPTION_PROPERTY]: {
			value: SUBSCRIPTION_NAME,
		},
		[property.key]: {
			value: property.value,
		},
		active: {
			enumerable: true,
			get: () => (parameters.isActive?.() ?? true) && state.active,
		},
	});

	addSubscription(subscriptions, instance as Subscription, state);

	return [Object.freeze(instance) as Subscription, false];
}

function getExistingSubscription(
	subscriptions: SubscriptionsState,
	state: SubscriptionState,
): Subscription | undefined {
	const {values} = subscriptions;
	const {parameters} = state;

	return isKey(parameters.key)
		? values.from.keyed?.get(parameters.key)?.get(parameters.value)
		: values.from.any.get(parameters.value);
}

function createSubscriptionParameters(input: unknown): SubscriptionParameters {
	const values = (isPlainObject(input) ? input : {}) as Partial<SubscriptionParameters>;

	if (values.value == null) {
		throw new Error(SUBSCRIPTION_INVALID_VALUE);
	}

	return {
		isActive: typeof values.isActive === 'function' ? values.isActive : undefined,
		key: isKey(values.key) ? values.key : undefined,
		signal: values.signal instanceof AbortSignal ? values.signal : undefined,
		value: values.value,
	};
}

function createSubscriptionsParameters(input: unknown): Required<SubscriptionsParameters> {
	const values = (isPlainObject(input) ? input : {}) as Partial<SubscriptionsParameters>;

	let keys: boolean | Set<Key>;

	if (values.keys instanceof Set) {
		keys = values.keys;
	} else {
		keys = typeof values.keys === 'boolean' ? values.keys : false;
	}

	return {
		keys,
		property: createSubscriptionsProperty(values.property),
	};
}

function createSubscriptionsProperty(input: unknown): Required<SubscriptionProperty> {
	const values = (isPlainObject(input) ? input : {}) as Partial<SubscriptionProperty>;

	return {
		key: typeof values.key === 'string' ? values.key : SUBSCRIPTION_PROPERTY,
		value: values.value == null ? SUBSCRIPTION_NAME : values.value,
	};
}

function createSubscriptionsState(keys: boolean | Set<Key>): SubscriptionsState {
	return {
		keys: keys,
		items: {
			any: new Set(),
			keyed: keys === false ? undefined : new Map(),
		},
		values: {
			from: {
				any: new Map(),
				keyed: keys === false ? undefined : new Map(),
			},
			to: {
				any: new Map(),
				keyed: keys === false ? undefined : new Map(),
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
	return isSubscriptionInstance(value, SUBSCRIPTION_NAME);
}

function isSubscriptionInstance(value: unknown, name: string): boolean {
	return (
		isPlainObject(value) && SUBSCRIPTION_PROPERTY in value && value[SUBSCRIPTION_PROPERTY] === name
	);
}

/**
 * Is the value a subscriptions store?
 *
 * @param value Value to check
 * @returns `true` if the value is a subscriptions store, otherwise `false`
 */
export function isSubscriptions(value: unknown): value is Subscriptions {
	return isSubscriptionInstance(value, SUBSCRIPTION_STORE);
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
	subscriptionsState: SubscriptionsState,
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

	const {items, values} = subscriptionsState;
	const {key, value} = state.parameters;

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

/**
 * Create a subscription store
 *
 * @param parameters Store parameters
 * @returns Subscription store
 */
export function subscriptions<Value = unknown>(
	parameters?: SubscriptionsParameters,
): Subscriptions<Value> {
	const {keys, property} = createSubscriptionsParameters(parameters);

	const state = createSubscriptionsState(keys);

	const instance: unknown = {
		clear: () => clearSubscriptions(state),
		create: (parameters: never) => createSubscription(state, property, parameters),
	};

	Object.defineProperties(instance, {
		[SUBSCRIPTION_PROPERTY]: {
			value: SUBSCRIPTION_STORE,
		},
		items: {
			enumerable: true,
			value: state.items,
		},
		values: {
			enumerable: true,
			value: state.values,
		},
	});

	return Object.freeze(instance) as Subscriptions<Value>;
}

function unsubscribe(
	subscriptionsState: SubscriptionsState,
	subscription: Subscription,
	state: SubscriptionState,
): void {
	state.aborter?.cancel();

	removeSubscription(subscriptionsState, subscription, state);
}

// #endregion

// #region Variables

const SUBSCRIPTION_DISALLOWED_KEY = 'Disallowed key for subscription';

const SUBSCRIPTION_INVALID_KEY = 'Invalid key for subscription';

const SUBSCRIPTION_INVALID_VALUE = 'A subscription requires a non-null value to identify it';

export const SUBSCRIPTION_NAME = 'subscription';

const SUBSCRIPTION_PROPERTY = '$subscriptions';

const SUBSCRIPTION_STORE = 'subscriptions';

// #endregion
