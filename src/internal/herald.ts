import type {GenericCallback, PlainObject} from '../models';
import {isPlainObject} from './is';
import {
	createSubscriptions,
	isSubscription,
	SUBSCRIPTION_NAME,
	type Subscription,
	type SubscriptionProperty,
	type Subscriptions,
} from './subscription';

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
	 * Is the event observed by any subscribers?
	 *
	 * @param event Event name
	 * @returns `true` if the event is observed, otherwise `false`
	 */
	observed<Event extends keyof Events>(event: Event): boolean;

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
	[Key in keyof Events]: Key extends '*'
		? never
		: (callback: Events[Key], signal?: AbortSignal) => void;
};

type HeraldOnCreate<Events extends Record<string, GenericCallback>> = <Event extends keyof Events>(
	event: Event,
	callback: Events[Event],
	subscription: Subscription,
) => void;

export type HeraldOptions<Events extends Record<string, GenericCallback>> = {
	names: Array<keyof Events>;
	property?: SubscriptionProperty;
	onCreate?: HeraldOnCreate<Events>;
};

type HeraldState = {
	keys: Set<string>;
	subscriptions: Subscriptions<GenericCallback>;
	onCreate?: HeraldOnCreate<Record<string, GenericCallback>>;
};

// #endregion

// #region Functions

function createEvents<Events extends Record<string, GenericCallback>>(
	herald: Herald<Events>,
	state: HeraldState,
): HeraldEvents<Events> {
	const events: PlainObject = {};

	Object.defineProperty(events, HERALD_PROPERTY, {
		value: HERALD_NAME_EVENTS,
	});

	for (const key of state.keys) {
		events[key] = (callback: never, signal?: AbortSignal) =>
			herald.subscribe(key, callback, signal);
	}

	return Object.freeze(events) as HeraldEvents<Events>;
}

function emitForHerald(state: HeraldState, event: string, ...parameters: unknown[]): void {
	const items = state.subscriptions.state.values.from.keyed?.get(event);

	if (items == null || items.size === 0) {
		return;
	}

	for (const [callback] of items) {
		callback(...parameters);
	}
}

function getHeraldSubscriptionProperty(input: unknown): SubscriptionProperty {
	if (input == null) {
		return heraldSubscription;
	}

	const property = isPlainObject(input) ? input : {};

	if (
		typeof property.key !== 'string' ||
		(property.value != null && typeof property.value !== 'string')
	) {
		throw new Error(HERALD_MESSAGE_PROPERTY);
	}

	return {
		key: property.key,
		value: property.value,
	};
}

function getHeraldState(input: unknown): HeraldState {
	const options = isPlainObject(input) ? input : {};

	if (
		!Array.isArray(options.names) ||
		options.names.length === 0 ||
		!options.names.every(name => typeof name === 'string')
	) {
		throw new Error(HERALD_MESSAGE_ARRAY);
	}

	if (options.onCreate != null && typeof options.onCreate !== 'function') {
		throw new Error(HERALD_MESSAGE_ONCREATE);
	}

	const keys = new Set(options.names);
	const property = getHeraldSubscriptionProperty(options.property);

	const subscriptions = createSubscriptions<GenericCallback>({
		keys,
		property,
	});

	return {
		keys,
		subscriptions,
		onCreate: options.onCreate as HeraldOnCreate<Record<string, GenericCallback>>,
	};
}

/**
 * Create a _Herald_ for announcing named events
 *
 * @param names Event names
 * @param property Optional property for subscription identification _(defaults to `$herald`)_
 * @returns _Herald_ instance
 */
export function herald<Events extends Record<string, GenericCallback>>(
	options: HeraldOptions<Events>,
): Herald<Events> {
	const state = getHeraldState(options);

	const instance: unknown = {
		clear: () => state.subscriptions.clear(),
		emit: (event: never, ...parameters: never[]) => emitForHerald(state, event, ...parameters),
		observed: (event: never) => (state.subscriptions.state.items.keyed?.get(event)?.size ?? 0) > 0,
		subscribe: (key: never, callback: never, signal: never) =>
			subscribeToHerald(state, key, callback, signal),
	};

	Object.defineProperties(instance, {
		[HERALD_PROPERTY]: {
			value: HERALD_NAME_HERALD,
		},
		events: {
			enumerable: true,
			value: createEvents(instance as never, state),
		},
	});

	return Object.freeze(instance) as unknown as Herald<Events>;
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

/**
 * Is the value events for a herald?
 *
 * @param value Value to check
 * @returns `true` if the value is events for a herald, otherwise `false`
 */
export function isHeraldEvents<
	Events extends Record<string, GenericCallback> = Record<string, GenericCallback>,
>(value: unknown): value is HeraldEvents<Events> {
	return isHeraldInstance(HERALD_NAME_EVENTS, value);
}

function isHeraldInstance<Instance>(name: string, value: unknown): value is Instance {
	return (
		isPlainObject(value) &&
		HERALD_PROPERTY in value &&
		(value as Record<string, unknown>)[HERALD_PROPERTY] === name
	);
}

/**
 * Is the value a herald subscription?
 *
 * @param value Value to check
 * @returns `true` if the value is a herald subscription, otherwise `false`
 */
export function isHeraldSubscription(value: unknown): value is Subscription {
	return isSubscription(value) && (value as PlainObject)[HERALD_PROPERTY] === SUBSCRIPTION_NAME;
}

function subscribeToHerald(
	state: HeraldState,
	key: never,
	callback: never,
	signal?: AbortSignal,
): Subscription {
	const [subscription, existing] = state.subscriptions.create({
		key,
		signal,
		value: callback,
	});

	if (!existing) {
		state.onCreate?.(key, callback, subscription);
	}

	return subscription;
}

// #endregion

// #region Variables

const HERALD_PROPERTY = '$herald';

const HERALD_MESSAGE_ARRAY = 'Herald requires an array of event names.';

const HERALD_MESSAGE_ONCREATE = `Herald requires a valid onCreate callback for subscription creation`;

const HERALD_MESSAGE_PROPERTY = `Herald requires valid property information for subscription identification`;

const HERALD_NAME_EVENTS = 'events';

const HERALD_NAME_HERALD = 'herald';

const heraldSubscription: SubscriptionProperty = {
	key: HERALD_PROPERTY,
};

// #endregion
