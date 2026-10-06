import type {GenericCallback} from '../../models';
import {
	SUBSCRIPTION_NAME,
	type Subscription,
	type SubscriptionProperty,
	type Subscriptions,
} from '../subscription';

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

export type HeraldOnCreate<Events extends Record<string, GenericCallback>> = <Event extends keyof Events>(
	event: Event,
	callback: Events[Event],
	subscription: Subscription,
) => void;

export type HeraldOptions<Events extends Record<string, GenericCallback>> = {
	names: Array<keyof Events>;
	property?: SubscriptionProperty;
	onCreate?: HeraldOnCreate<Events>;
};

export type HeraldState = {
	keys: Set<string>;
	store: Subscriptions<GenericCallback>;
	onCreate?: HeraldOnCreate<Record<string, GenericCallback>>;
};

export type InternalHerald = {
	[HERALD_SYMBOL]: {
		events: HeraldEvents<Record<string, GenericCallback>>;
		state: HeraldState;
	};
} & Herald<Record<string, GenericCallback>>;

// #endregion

// #region Variables

export const HERALD_MESSAGE_ARRAY = 'Herald requires an array of event names.';

export const HERALD_MESSAGE_ONCREATE = `Herald requires a valid onCreate callback for subscription creation`;

export const HERALD_MESSAGE_PROPERTY = `Herald requires valid property information for subscription identification`;

export const HERALD_NAME_EVENTS = 'events';

export const HERALD_NAME_HERALD = 'herald';

export const HERALD_PROPERTY = '$herald';

export const HERALD_SYMBOL: unique symbol = Symbol(HERALD_PROPERTY);

export const heraldSubscription: SubscriptionProperty = {
	key: HERALD_PROPERTY,
	value: SUBSCRIPTION_NAME,
};

// #endregion
