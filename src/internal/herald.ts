import type {GenericCallback, PlainObject} from '../models';
import {isPlainObject} from './is';
import {
	isSubscription,
	SUBSCRIPTION_NAME,
	subscriptions,
	type Subscription,
	type SubscriptionProperty,
	type Subscriptions,
} from './subscription';

// #region Special variables

const HERALD_NAME_EVENTS = 'events';

const HERALD_NAME_HERALD = 'herald';

const HERALD_PROPERTY = '$herald';

// #endregion

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
	store: Subscriptions;
	onCreate?: HeraldOnCreate<Record<string, GenericCallback>>;
};

type InternalHerald = {
	[HERALD_SYMBOL]: {
		events: HeraldEvents<Record<string, GenericCallback>>;
		state: HeraldState;
	};
} & Herald<Record<string, GenericCallback>>;

// #endregion

// #region Instances

function Events(this: any, herald: InternalHerald, state: HeraldState) {
	for (const key of state.keys) {
		Object.defineProperty(this, key, {
			value: (callback: never, signal?: AbortSignal) => herald.subscribe(key, callback, signal),
		});
	}
}

Events.prototype[HERALD_PROPERTY] = HERALD_NAME_EVENTS;

function Herald(this: any, state: HeraldState) {
	Object.defineProperty(this, HERALD_SYMBOL, {
		value: {
			state,
			// @ts-expect-error All good, no worries :-)
			events: new Events(this, state),
		},
	});
}

Object.defineProperties(Herald.prototype, {
	[HERALD_PROPERTY]: {
		value: HERALD_NAME_HERALD,
	},
	clear: {
		value: clearHerald,
	},
	emit: {
		value: emitForHerald,
	},
	events: {
		enumerable: true,
		get(): HeraldEvents<Record<string, GenericCallback>> {
			return (this as InternalHerald)[HERALD_SYMBOL].events;
		},
	},
	observed: {
		value: eventIsObserved,
	},
	subscribe: {
		value: subscribeToHerald,
	},
});

// #endregion

// #region Functions

function clearHerald(this: InternalHerald): void {
	this[HERALD_SYMBOL].state.store.clear();
}

function createHeraldState(input: unknown): HeraldState {
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
	const property = createHeraldSubscriptionProperty(options.property);

	const store = subscriptions({
		keys,
		property,
	});

	return {
		keys,
		store,
		onCreate: options.onCreate as HeraldOnCreate<Record<string, GenericCallback>>,
	};
}

function createHeraldSubscriptionProperty(input: unknown): SubscriptionProperty {
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

function emitForHerald(this: InternalHerald, event: string, ...parameters: unknown[]): void {
	const {state} = this[HERALD_SYMBOL];

	const items = state.store.values.from.keyed?.get(event);

	if (items == null || items.size === 0) {
		return;
	}

	for (const [callback] of items) {
		(callback as GenericCallback)(...parameters);
	}
}

function eventIsObserved(this: InternalHerald, event: string): boolean {
	return (this[HERALD_SYMBOL].state.store.items.keyed?.get(event)?.size ?? 0) > 0;
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
	// @ts-expect-error All good, no worries :-)
	return new Herald(createHeraldState(options));
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
		typeof value === 'object' &&
		value !== null &&
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
	this: InternalHerald,
	key: string,
	callback: GenericCallback,
	signal?: AbortSignal,
): Subscription {
	const {state} = this[HERALD_SYMBOL];

	const [subscription, existing] = state.store.create({
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

const HERALD_MESSAGE_ARRAY = 'Herald requires an array of event names.';

const HERALD_MESSAGE_ONCREATE = `Herald requires a valid onCreate callback for subscription creation`;

const HERALD_MESSAGE_PROPERTY = `Herald requires valid property information for subscription identification`;

const HERALD_SYMBOL = Symbol(HERALD_PROPERTY);

const heraldSubscription: SubscriptionProperty = {
	key: HERALD_PROPERTY,
	value: SUBSCRIPTION_NAME,
};

// #endregion
