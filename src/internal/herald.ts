import type {GenericCallback} from '../models';
import {
	HERALD_MESSAGE_ARRAY,
	HERALD_MESSAGE_ONCREATE,
	HERALD_MESSAGE_PROPERTY,
	HERALD_NAME_EVENTS,
	HERALD_NAME_HERALD,
	HERALD_PROPERTY,
	HERALD_SYMBOL,
	heraldSubscription,
	type Herald,
	type HeraldEvents,
	type HeraldOnCreate,
	type HeraldOptions,
	type HeraldState,
	type InternalHerald,
} from '../models/herald.model';
import {SUBSCRIPTION_NAME} from '../models/subscription.model';
import type {Subscription, SubscriptionProperty} from '../subscription';
import {isPlainObject} from './is';
import {isSubscription, subscriptions} from './subscription';

// #region Instances

function Events(this: any, herald: InternalHerald, state: HeraldState): void {
	for (const key of state.keys) {
		Object.defineProperty(this, key, {
			value: (callback: never, signal?: AbortSignal) => herald.subscribe(key, callback, signal),
		});
	}
}

Events.prototype[HERALD_PROPERTY] = HERALD_NAME_EVENTS;

function Herald(this: any, state: HeraldState): void {
	this[HERALD_SYMBOL] = {
		state,
		// @ts-expect-error All good, no worries :-)
		events: new Events(this, state),
	};
}

Herald.prototype[HERALD_PROPERTY] = HERALD_NAME_HERALD;

Herald.prototype.clear = clearHerald;
Herald.prototype.emit = emitForHerald;
Herald.prototype.observed = eventIsObserved;
Herald.prototype.subscribe = subscribeToHerald;

Object.defineProperty(Herald.prototype, 'events', {
	enumerable: true,
	get: getHeraldEvents,
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

	const store = subscriptions<GenericCallback>({
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
		callback(...parameters);
	}
}

function eventIsObserved(this: InternalHerald, event: string): boolean {
	return (this[HERALD_SYMBOL].state.store.items.keyed?.get(event)?.size ?? 0) > 0;
}

function getHeraldEvents(this: InternalHerald): HeraldEvents<Record<string, GenericCallback>> {
	return this[HERALD_SYMBOL].events;
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
		value[HERALD_PROPERTY] === name
	);
}

/**
 * Is the value a herald subscription?
 *
 * @param value Value to check
 * @returns `true` if the value is a herald subscription, otherwise `false`
 */
export function isHeraldSubscription(value: unknown): value is Subscription {
	return (
		isSubscription(value) &&
		HERALD_PROPERTY in value &&
		value[HERALD_PROPERTY] === SUBSCRIPTION_NAME
	);
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
