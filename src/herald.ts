import {
	clearSubscriptions,
	getSubscription,
	getSubscriptions,
	type Subscription,
	type SubscriptionProperty,
} from './internal/subscription';
import type {GenericCallback} from './models';

// #region Types

export type Events<Map extends Record<string, GenericCallback>> = {
	/**
	 * Subscribe to an event with a callback
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @param signal Optional abort signal to cancel the subscription
	 * @returns Subscription instance
	 */
	subscribe<Event extends keyof Map>(
		event: Event,
		callback: Map[Event],
		signal?: AbortSignal,
	): Subscription;
};

export type Herald<Map extends Record<string, GenericCallback>> = {
	readonly events: Events<Map>;

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
	emit<Event extends keyof Map>(event: Event, ...parameters: Parameters<Map[Event]>): void;

	/**
	 * Subscribe to an event with a callback
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @param signal Optional abort signal to cancel the subscription
	 * @returns Subscription instance
	 */
	subscribe<Event extends keyof Map>(
		event: Event,
		callback: Map[Event],
		signal?: AbortSignal,
	): Subscription;
};

// #endregion

// #region Functions

function getEvents<Map extends Record<string, GenericCallback>>(herald: Herald<Map>): Events<Map> {
	const events = {
		subscribe: (event: never, callback: never, signal: never) =>
			herald.subscribe(event, callback, signal),
	};

	Object.defineProperty(events, KEY_HERALD, {
		enumerable: false,
		value: NAME_EVENTS,
	});

	return Object.freeze(events) as Events<Map>;
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
		throw new Error(MESSAGE);
	}

	const keys = new Set(names);
	const subscriptions = getSubscriptions<GenericCallback>(keys);

	const instance = {
		clear() {
			clearSubscriptions(subscriptions);
		},
		emit(event: never, ...parameters: never[]) {
			const items = subscriptions.values.from.keyed?.get(event);

			if (items == null || items.size === 0) {
				return;
			}

			for (const [callback] of items) {
				callback(...parameters);
			}
		},
		subscribe(key: never, callback: never, signal: never): Subscription {
			if (!keys.has(key)) {
				throw new Error(`Event "${String(key)}" is not registered.`);
			}

			return getSubscription({
				key,
				signal,
				subscriptions,
				property: heraldSubscription,
				value: callback,
			});
		},
	};

	Object.defineProperties(instance, {
		[KEY_HERALD]: {
			enumerable: false,
			value: NAME_HERALD,
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
	Map extends Record<string, GenericCallback> = Record<string, GenericCallback>,
>(value: unknown): value is Events<Map> {
	return isHeraldInstance(NAME_EVENTS, value);
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
	return isHeraldInstance(NAME_HERALD, value);
}

function isHeraldInstance<Instance>(name: string, value: unknown): value is Instance {
	return (
		typeof value === 'object' &&
		value != null &&
		KEY_HERALD in value &&
		(value as Record<string, unknown>)[KEY_HERALD] === name
	);
}

// #endregion

// #region Variables

const KEY_HERALD = '$herald';

const MESSAGE = 'Herald requires an array of event names.';

const NAME_EVENTS = 'events';

const NAME_HERALD = 'herald';

const heraldSubscription: SubscriptionProperty = {
	key: KEY_HERALD,
};

// #endregion
