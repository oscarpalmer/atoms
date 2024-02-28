import {ArrayOrObject, GenericObject, isArrayOrObject} from './value';

class ProxyBlob {}

type ProxyValue = {
	$: ProxyBlob;
};

function _createProxy<T extends ArrayOrObject>(
	blob: ProxyBlob | undefined,
	value: T,
): T {
	if (!isArrayOrObject(value) || _isProxy(value)) {
		return value;
	}

	const isArray = Array.isArray(value);
	const proxyBlob = blob ?? new ProxyBlob();
	const proxyValue = new Proxy(isArray ? [] : {}, {});

	Object.defineProperty(proxyValue, '$', {
		value: proxyBlob,
	});

	const keys =  Object.keys(value);
	const size = keys.length ?? 0;

	let index = 0;

	for (; index < size; index += 1) {
		const key = keys[index];

		proxyValue[key as never] = _createProxy(proxyBlob, value[key as never]);
	}

	return proxyValue as T;
}

function _isProxy(value: unknown): value is ProxyValue {
	return (value as GenericObject)?.$ instanceof ProxyBlob;
}

export function proxy<T extends ArrayOrObject>(value: T): T {
	if (!isArrayOrObject(value)) {
		throw new Error('Proxy value must be an array or object');
	}

	return _createProxy(undefined, value);
}
