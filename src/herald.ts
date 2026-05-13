import {noop} from './internal/function/misc';
import type {GenericCallback} from './models';

// #region Types

class Events<Map extends Record<string, GenericCallback>> {
	readonly #herald: Herald<Map>;

	constructor(herald: Herald<Map>) {
		this.#herald = herald;
	}

	/**
	 * Subscribe to an event with a callback
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @returns Unsubscriber function
	 */
	subscribe<Event extends keyof Map>(event: Event, callback: Map[Event]): Unsubscriber {
		return this.#herald.subscribe(event, callback);
	}

	/**
	 * Unsubscribe from an event with a callback _(or all callbacks, if no callback is provided)_
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @returns Unsubscriber function
	 */
	unsubscribe<Event extends keyof Map>(event: Event, callback?: Map[Event]): void {
		return this.#herald.unsubscribe(event, callback);
	}
}

/**
 * A _Herald_ is an announcer for named events, allowing emission, subscription, and unsubscription of events
 */
class Herald<Map extends Record<string, GenericCallback>> {
	readonly #names: Set<keyof Map>;

	readonly #subscribers = new Map<keyof Map, Set<Map[keyof Map]>>();

	/**
	 * Events interface for subscribing to and unsubscribing from events
	 */
	declare readonly events: Events<Map>;

	constructor(names: (keyof Map)[]) {
		this.#names = new Set(names);

		Object.defineProperty(this, 'events', {
			value: new Events(this),
		});
	}

	/**
	 * Remove all event subscribers
	 */
	clear(): void {
		this.#subscribers.clear();
	}

	/**
	 * Emit an event with parameters
	 *
	 * @param event Event name
	 * @param parameters Event parameters
	 */
	emit<Event extends keyof Map>(event: Event, ...parameters: Parameters<Map[Event]>) {
		const subscribers = this.#subscribers.get(event);

		if (subscribers == null) {
			return;
		}

		for (const callback of subscribers) {
			callback(...parameters);
		}
	}

	/**
	 * Subscribe to an event with a callback
	 *
	 * @param event Event name
	 * @param callback Callback function
	 * @returns Unsubscriber function
	 */
	subscribe<Event extends keyof Map>(event: Event, callback: Map[Event]): Unsubscriber {
		if (!this.#names.has(event) || typeof callback !== 'function') {
			return noop;
		}

		let subscribers = this.#subscribers.get(event);

		if (subscribers == null) {
			subscribers = new Set();

			this.#subscribers.set(event, subscribers);
		}

		subscribers.add(callback);

		return () => {
			subscribers?.delete(callback);
		};
	}

	/**
	 * Unsubscribe from an event with a callback _(or all callbacks, if no callback is provided)_
	 *
	 * @param event Event name
	 * @param callback Callback function
	 */
	unsubscribe<Event extends keyof Map>(event: Event, callback?: Map[Event]): void {
		if (!this.#names.has(event) || (callback != null ? typeof callback !== 'function' : false)) {
			return;
		}

		const subscribers = this.#subscribers.get(event);

		if (subscribers == null) {
			return;
		}

		if (callback == null) {
			subscribers.clear();
		} else {
			subscribers.delete(callback);
		}

		if (callback == null || subscribers.size === 0) {
			this.#subscribers.delete(event);
		}
	}
}

export type Unsubscriber = () => void;

// #endregion

// #region Functions

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

	return new Herald<Events>(names);
}

// #endregion

// #region Variables

const MESSAGE = 'Herald requires an array of event names.';

// #endregion

// #region Exports

export {type Events, type Herald};

// #endregion
