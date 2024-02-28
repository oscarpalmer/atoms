import {
	ArrayOrObject,
	GenericObject,
	clone,
	isArrayOrObject,
	merge,
} from './value';

class Manager<T extends ArrayOrObject = GenericObject> {
	constructor(readonly owner: Proxied<T>) {}

	clone(): Proxied<T> {
		return clone(merge(this.owner)) as Proxied<T>;
	}
}

export type Proxied<T extends ArrayOrObject = GenericObject> = {
	$: Manager<T>;
} & T;

function _createProxy<T extends ArrayOrObject>(
	existing: Manager | undefined,
	value: T,
): unknown {
	if (!isArrayOrObject(value) || (_isProxy(value) && value.$ === existing)) {
		return value;
	}

	const isArray = Array.isArray(value);

	const proxy = new Proxy(isArray ? [] : {}, {
		get(target, property) {
			return property === '$' ? manager : Reflect.get(target, property);
		},
		set(target, property, value) {
			return (
				property === '$' ||
				Reflect.set(target, property, _createProxy(manager, value))
			);
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

function _isProxy(value: unknown): value is Proxied {
	return (value as Proxied)?.$ instanceof Manager;
}

export function proxy<T extends ArrayOrObject>(value: T): Proxied<T> {
	if (!isArrayOrObject(value)) {
		throw new Error('Proxy value must be an array or object');
	}

	return _createProxy(undefined, value) as Proxied<T>;
}
