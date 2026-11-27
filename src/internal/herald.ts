import {
	HERALD_MESSAGE_ARRAY,
	HERALD_MESSAGE_ONCREATE,
	HERALD_NAME_EVENTS,
	HERALD_NAME_HERALD,
	HERALD_SYMBOL,
	type Herald,
	type HeraldEvents,
	type HeraldOnCreate,
	type HeraldOptions,
	type HeraldState,
	type InternalHerald,
} from '../models/herald.model';
import type {GenericCallback, PlainObject} from '../models/misc.model';
import type {Subscription} from '../models/subscription.model';
import {isPlainObject} from './is';
import {subscriptions} from './subscription';

// #region Instances

function Events(this: any, herald: InternalHerald, state: HeraldState): void {
	this[HERALD_SYMBOL] = {
		name: HERALD_NAME_EVENTS,
	};

	for (const key of state.keys) {
		Object.defineProperty(this, key, {
			value: (callback: never, signal?: AbortSignal) => herald.subscribe(key, callback, signal),
		});
	}
}

function Herald(this: any, state: HeraldState): void {
	this[HERALD_SYMBOL] = {
		state,
		// @ts-expect-error Using old school function constructor, so all good, no worries :-)
		events: new Events(this, state),
		name: HERALD_NAME_HERALD,
	};
}

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

	const store = subscriptions<GenericCallback>({
		keys,
	});

	return {
		keys,
		store,
		onCreate: options.onCreate as HeraldOnCreate<Record<string, GenericCallback>>,
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
 * @param options _Herald_ options
 * @returns _Herald_ instance
 */
export function herald<Events extends Record<string, GenericCallback>>(
	options: HeraldOptions<Events>,
): Herald<Events> {
	// @ts-expect-error Using old school function constructor, so all good, no worries :-)
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
		HERALD_SYMBOL in value &&
		(value[HERALD_SYMBOL] as PlainObject).name === name
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
