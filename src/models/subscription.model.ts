import type {Aborter} from './aborter.model';
import type {Key} from './index';

// #region Types

export type InternalSubscription = {
	[SUBSCRIPTION_SYMBOL]: SubscriptionState;
} & Subscription;

export type InternalSubscriptions = {
	[SUBSCRIPTION_SYMBOL]: SubscriptionsState;
} & Subscriptions;

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

export type SubscriptionState = {
	aborter?: Aborter;
	active: boolean;
	parameters: SubscriptionParameters;
	subscriptions: SubscriptionsState;
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
	clear(): void;

	/**
	 * Create _(or retrieve)_ a subscription
	 *
	 * @param parameters Subscription parameters
	 * @returns Tuple holding subsccription and existing boolean
	 */
	create(parameters: SubscriptionParameters): [Subscription, boolean];
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

export type SubscriptionsState = {
	items: SubscriptionsItems;
	keys: boolean | Set<Key>;
	property: SubscriptionProperty;
	values: SubscriptionsValues;
};

export type SubscriptionsItems = {
	any: Set<Subscription>;
	keyed?: Map<Key, Set<Subscription>>;
};

export type SubscriptionsValues<Value = unknown> = {
	from: SubscriptionsValuesItem<Value, Subscription>;
	to: SubscriptionsValuesItem<Subscription, Value>;
};

export type SubscriptionsValuesItem<MapKey, MapValue> = {
	any: Map<MapKey, MapValue>;
	keyed?: Map<Key, Map<MapKey, MapValue>>;
};

// #endregion

// #region Variables

export const SUBSCRIPTION_DISALLOWED_KEY = 'Disallowed key for subscription';

export const SUBSCRIPTION_INVALID_KEY = 'Invalid key for subscription';

export const SUBSCRIPTION_INVALID_VALUE = 'A subscription requires a non-null value to identify it';

export const SUBSCRIPTION_NAME = 'subscription';

export const SUBSCRIPTION_PROPERTY = '$subscription';

export const SUBSCRIPTION_STORE = 'subscriptions';

export const SUBSCRIPTION_SYMBOL: unique symbol = Symbol(SUBSCRIPTION_PROPERTY);

// #endregion
