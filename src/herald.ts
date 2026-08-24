import {noop} from './internal/function/misc';
import type {GenericCallback, Unsubscriber} from './models';

// #region Types

export type Events<Map extends Record<string, GenericCallback>> = {
	/**
	 * Subscribe to an event with a callback
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @returns Unsubscriber function
	 */
	subscribe<Event extends keyof Map>(event: Event, callback: Map[Event]): Unsubscriber;

	/**
	 * Unsubscribe from an event with a callback _(or all callbacks, if no callback is provided)_
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @returns Unsubscriber function
	 */
	unsubscribe<Event extends keyof Map>(event: Event, callback?: Map[Event]): void;
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
	 * @returns Unsubscriber function
	 */
	subscribe<Event extends keyof Map>(event: Event, callback: Map[Event]): Unsubscriber;

	/**
	 * Unsubscribe from an event with a callback _(or all callbacks, if no callback is provided)_
	 *
	 * @param event Event name
	 * @param callback Callback function
	 */
	unsubscribe<Event extends keyof Map>(event: Event, callback?: Map[Event]): void;
};

// #endregion

// #region Functions

function getEvents<Map extends Record<string, GenericCallback>>(herald: Herald<Map>): Events<Map> {
	const events = {
		subscribe: (event: string, callback: GenericCallback) =>
			herald.subscribe(event, callback as Map[keyof Map]),
		unsubscribe: (event: string, callback?: GenericCallback) =>
			herald.unsubscribe(event, callback as Map[keyof Map]),
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

	const set = new Set<keyof Events>(names);
	const subscribers = new Map<keyof Events, Set<Events[keyof Events]>>();

	const instance = {
		clear() {
			subscribers.clear();
		},
		emit<Event extends keyof Events>(event: Event, ...parameters: Parameters<Events[Event]>) {
			const callbacks = subscribers.get(event);

			if (callbacks == null) {
				return;
			}

			for (const callback of callbacks) {
				callback(...parameters);
			}
		},
		subscribe<Event extends keyof Events>(event: Event, callback: Events[Event]): Unsubscriber {
			if (!set.has(event) || typeof callback !== 'function') {
				return noop;
			}

			let eventSubscribers = subscribers.get(event);

			if (eventSubscribers == null) {
				eventSubscribers = new Set();

				subscribers.set(event, eventSubscribers);
			}

			eventSubscribers.add(callback);

			return () => {
				eventSubscribers?.delete(callback);
			};
		},
		unsubscribe<Event extends keyof Events>(event: Event, callback?: Events[Event]): void {
			if (!set.has(event) || (callback != null ? typeof callback !== 'function' : false)) {
				return;
			}

			const eventSubscribers = subscribers.get(event);

			if (eventSubscribers == null) {
				return;
			}

			if (callback == null) {
				eventSubscribers.clear();
			} else {
				eventSubscribers.delete(callback);
			}

			if (callback == null || eventSubscribers.size === 0) {
				subscribers.delete(event);
			}
		},
	};

	Object.defineProperties(instance, {
		[KEY_HERALD]: {
			enumerable: false,
			value: NAME_HERALD,
		},
		events: {
			enumerable: true,
			value: getEvents<Events>(instance as Herald<Events>),
		},
	});

	return Object.freeze(instance) as Herald<Events>;
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

// #endregion
