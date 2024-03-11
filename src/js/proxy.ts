import {
	type ArrayOrPlainObject,
	type PlainObject,
	isArrayOrPlainObject,
} from './is';
import {queue} from './queue';
import {clone, diff, get, merge} from './value';

class Manager<T extends ArrayOrPlainObject = PlainObject> {
	private count = 0;

	declare readonly emitter: () => void;
	readonly subscribers = new Map<string, Set<Subscriber>>();

	get subscribed(): boolean {
		return this.count > 0;
	}

	constructor(readonly owner: Proxied<T>) {
		this.emitter = function (this: Manager<T>) {
			_emit(this as never);
		}.bind(this);
	}

	clone(): T {
		return _createProxy(undefined, clone(merge(this.owner))) as T;
	}

	off<T1 = unknown, T2 = T1>(
		key: string,
		subscriber: Subscriber<T1, T2>,
	): void {
		if (this.subscribers.get(key)?.delete(subscriber as never) ?? false) {
			this.count -= 1;
		}
	}

	on<T1 = unknown, T2 = T1>(key: string, subscriber: Subscriber<T1, T2>): void {
		let subscribers = this.subscribers.get(key);

		if (subscribers === undefined) {
			subscribers = new Set<Subscriber>();

			this.subscribers.set(key, subscribers);
		}

		subscribers.add(subscriber as never);

		this.count += 1;
	}
}

type Proxied<T extends ArrayOrPlainObject = PlainObject> = {
	$: Manager<T>;
} & T;

export type Subscriber<T1 = unknown, T2 = T1> = (to: T1, from: T2) => void;

const cloned = new Map<Manager, unknown>();

function _createProxy<T extends ArrayOrPlainObject>(
	existing: Manager | undefined,
	value: T,
): unknown {
	if (
		!isArrayOrPlainObject(value) ||
		(_isProxy(value) && value.$ === existing)
	) {
		return value;
	}

	const isArray = Array.isArray(value);

	const proxy = new Proxy(isArray ? [] : {}, {
		get(target, property) {
			return property === '$' ? manager : Reflect.get(target, property);
		},
		set(target, property, value) {
			if (property === '$') {
				return true;
			}

			const isSubscribed = manager.subscribed;

			const original =
				isSubscribed && !cloned.has(manager)
					? clone(merge(manager.owner))
					: undefined;

			const actual = _createProxy(manager, value);
			const result = Reflect.set(target, property, actual);

			if (result && isSubscribed) {
				_onChange(manager, original);
			}

			return result;
		},
	}) as Proxied;

	const manager = existing ?? new Manager(proxy);

	Object.defineProperty(proxy, '$', {
		value: manager,
	});

	const keys = Object.keys(value);
	const {length} = keys;

	let index = 0;

	for (; index < length; index += 1) {
		const key = keys[index];

		proxy[key as never] = value[key as never];
	}

	return proxy;
}

function _emit(manager: Manager): void {
	const difference = diff(
		cloned.get(manager) ?? {},
		clone(merge(manager.owner)),
	);

	const keys = Object.keys(difference.values);
	const {length} = keys;

	let index = 0;

	for (; index < length; index += 1) {
		const key = keys[index];
		const subscribers = manager.subscribers.get(key);

		if (subscribers === undefined || subscribers.size === 0) {
			continue;
		}

		const {from} = difference.values[key];
		const to = get(manager.owner, key);

		for (const subscriber of subscribers) {
			subscriber(to, from);
		}
	}

	cloned.delete(manager);
}

function _isProxy(value: unknown): value is Proxied {
	return (value as Proxied)?.$ instanceof Manager;
}

function _onChange(manager: Manager, value: unknown): void {
	if (!cloned.has(manager)) {
		cloned.set(manager, value);
	}

	queue(manager.emitter);
}

/**
 * Clones and creates a new proxy
 */
export function cloneProxy<T extends ArrayOrPlainObject>(proxy: T): T {
	if (!_isProxy(proxy)) {
		throw new Error('Value must be a proxy');
	}

	return proxy.$.clone() as T;
}

/**
 * Creates a proxy for an array or object
 */
export function proxy<T extends PlainObject>(value: T): T {
	if (!isArrayOrPlainObject(value)) {
		throw new Error('Proxy value must be an array or object');
	}

	return _createProxy(undefined, value) as T;
}

/**
 * Subscribes to changes for a key in a proxy
 */
export function subscribe<T1 = ArrayOrPlainObject, T2 = unknown, T3 = T2>(
	proxy: T1,
	key: string,
	subscriber: Subscriber<T2, T3>,
): void {
	if (_isProxy(proxy)) {
		proxy.$.on(key, subscriber);
	}
}

/**
 * Unsubscribes from changes for a key in a proxy
 */
export function unsubscribe<T1 = ArrayOrPlainObject, T2 = unknown, T3 = T2>(
	proxy: T1,
	key: string,
	subscriber: Subscriber<T2, T3>,
): void {
	if (_isProxy(proxy)) {
		proxy.$.off(key, subscriber);
	}
}
