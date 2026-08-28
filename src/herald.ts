import {isPlainObject} from './internal/is';
import {
	createSubscriptions,
	isSubscription,
	SUBSCRIPTION_NAME,
	type Subscription,
	type SubscriptionProperty,
	type Subscriptions,
} from './internal/subscription';
import type {GenericCallback, PlainObject} from './models';

// #region Types

export type Herald<Events extends Record<string, GenericCallback>> = {
	readonly events: HeraldEvents<Events>;

	/**
	 * Remove all event subscribers
	 */
	clear(): void;

	/**
	 * Emit an event with parameters
	 *
	 * @param event Event name
	 * @param parameters Event parameters
	 */
	emit<Event extends keyof Events>(event: Event, ...parameters: Parameters<Events[Event]>): void;

	/**
	 * Subscribe to an event with a callback
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @param signal Optional abort signal to cancel the subscription
	 * @returns Subscription instance
	 */
	subscribe<Event extends keyof Events>(
		event: Event,
		callback: Events[Event],
		signal?: AbortSignal,
	): Subscription;
};

export type HeraldEvents<Events extends Record<string, GenericCallback>> = {
	/**
	 * Subscribe to an event with a callback
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @param signal Optional abort signal to cancel the subscription
	 * @returns Subscription instance
	 */
	subscribe<Event extends keyof Events>(
		event: Event,
		callback: Events[Event],
		signal?: AbortSignal,
	): Subscription;
};

// #endregion

// #region Functions

function emit(
	subscriptions: Subscriptions<GenericCallback>,
	event: string,
	...parameters: unknown[]
): void {
	const items = subscriptions.state.values.from.keyed?.get(event);

	if (items == null || items.size === 0) {
		return;
	}

	for (const [callback] of items) {
		callback(...parameters);
	}
}

function getEvents<Events extends Record<string, GenericCallback>>(
	herald: Herald<Events>,
): HeraldEvents<Events> {
	const events = {
		subscribe: (event: never, callback: never, signal: never) =>
			herald.subscribe(event, callback, signal),
	};

	Object.defineProperty(events, HERALD_PROPERTY, {
		enumerable: false,
		value: HERALD_NAME_EVENTS,
	});

	return Object.freeze(events) as HeraldEvents<Events>;
}

/**
 * Create a _Herald_ for announcing named events
 *
 * @param names Event names
 * @returns _Herald_ instance
 */
export function herald<Events extends Record<string, GenericCallback>>(
	names: (keyof Events)[],
): Herald<Events> {
	if (
		!Array.isArray(names) ||
		names.length === 0 ||
		!names.every(name => typeof name === 'string')
	) {
		throw new Error(HERALD_MESSAGE_ARRAY);
	}

	const keys = new Set(names);
	const subscriptions = createSubscriptions<GenericCallback>(keys);

	const instance: unknown = {
		clear: () => subscriptions.clear(),
		emit: (event: never, ...parameters: never[]) => emit(subscriptions, event, ...parameters),
		subscribe: (key: never, callback: never, signal: never) =>
			subscribeToHerald(subscriptions, keys, key, callback, signal),
	};

	Object.defineProperties(instance, {
		[HERALD_PROPERTY]: {
			enumerable: false,
			value: HERALD_NAME_HERALD,
		},
		events: {
			enumerable: true,
			value: getEvents(instance as never),
		},
	});

	return Object.freeze(instance) as unknown as Herald<Events>;
}

/**
 * Is the value events for a herald?
 *
 * @param value Value to check
 * @returns `true` if the value is events for a herald, otherwise `false`
 */
export function isEvents<
	Events extends Record<string, GenericCallback> = Record<string, GenericCallback>,
>(value: unknown): value is HeraldEvents<Events> {
	return isHeraldInstance(HERALD_NAME_EVENTS, value);
}

/**
 * Is the value a herald?
 *
 * @param value Value to check
 * @returns `true` if the value is a herald, otherwise `false`
 */
export function isHerald<
	Events extends Record<string, GenericCallback> = Record<string, GenericCallback>,
>(value: unknown): value is Herald<Events> {
	return isHeraldInstance(HERALD_NAME_HERALD, value);
}

function isHeraldInstance<Instance>(name: string, value: unknown): value is Instance {
	return (
		isPlainObject(value) &&
		HERALD_PROPERTY in value &&
		(value as Record<string, unknown>)[HERALD_PROPERTY] === name
	);
}

export function isHeraldSubscription(value: unknown): value is Subscription {
	return isSubscription(value) && (value as PlainObject)[HERALD_PROPERTY] === SUBSCRIPTION_NAME;
}

function subscribeToHerald(
	subscriptions: Subscriptions<GenericCallback>,
	keys: Set<string>,
	key: never,
	callback: never,
	signal?: AbortSignal,
): Subscription {
	if (!keys.has(key)) {
		throw new Error(HERALD_MESSAGE_EVENT.replace(HERALD_TEMPLATE, String(key)));
	}

	const [subscription] = subscriptions.create({
		key,
		signal,
		property: heraldSubscription,
		value: callback,
	});

	return subscription;
}

// #endregion

// #region Variables

const HERALD_PROPERTY = '$herald';

const HERALD_MESSAGE_ARRAY = 'Herald requires an array of event names.';

const HERALD_MESSAGE_EVENT = `'<>' is not a registered event name`;

const HERALD_NAME_EVENTS = 'events';

const HERALD_NAME_HERALD = 'herald';

const HERALD_TEMPLATE = '<>';

const heraldSubscription: SubscriptionProperty = {
	key: HERALD_PROPERTY,
};

// #endregion
