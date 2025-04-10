import {ignoreKey} from './internal/string/key';
import {isPlainObject} from './is';
import type {ArrayOrPlainObject, PlainObject} from './models';
import {join} from './string/misc';
import {setValue} from './value/set';

/**
 * Convert a query string to a plain _(nested)_ object
 */
export function fromQuery(query: string): PlainObject {
	const parts = query.split('&');
	const {length} = parts;

	const parameters: PlainObject = {};

	for (let index = 0; index < length; index += 1) {
		const [key, value] = parts[index].split('=').map(tryDecode);

		if (ignoreKey(key)) {
			continue;
		}

		if (key.includes('.')) {
			setValue(parameters, key, getValue(value));
		} else {
			if (key in parameters) {
				if (!Array.isArray(parameters[key])) {
					parameters[key] = [parameters[key]];
				}

				(parameters[key] as unknown[]).push(getValue(value) as never);
			} else {
				parameters[key] = getValue(value) as never;
			}
		}
	}

	return parameters;
}

function getParts(
	value: ArrayOrPlainObject,
	fromArray: boolean,
	prefix?: string,
): string[] {
	const keys = Object.keys(value);
	const {length} = keys;

	const parts: string[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const val = value[key as never];

		if (Array.isArray(val)) {
			parts.push(
				...getParts(val, true, join([prefix, fromArray ? null : key], '.')),
			);
		} else if (isPlainObject(val)) {
			parts.push(...getParts(val, false, join([prefix, key], '.')));
		} else if (isDecodable(val)) {
			parts.push(
				`${tryEncode(join([prefix, fromArray ? null : key], '.'))}=${tryEncode(val)}`,
			);
		}
	}

	return parts;
}

function getValue(value: string): boolean | number | string {
	if (/^(false|true)$/.test(value)) {
		return value === 'true';
	}

	const asNumber = Number(value);

	if (!Number.isNaN(asNumber)) {
		return asNumber;
	}

	return value;
}

function isDecodable(value: unknown): value is boolean | number | string {
	return ['boolean', 'number', 'string'].includes(typeof value);
}

/**
 * Convert a plain _(nested)_ object to a query string
 */
export function toQuery(parameters: PlainObject): string {
	return getParts(parameters, false)
		.filter(part => part.length > 0)
		.join('&');
}

function tryCallback<T, U>(value: T, callback: (value: T) => U): U {
	try {
		return callback(value);
	} catch {
		return value as never;
	}
}

function tryDecode(value: string): string {
	return tryCallback(value, decodeURIComponent);
}

function tryEncode(value: boolean | number | string): unknown {
	return tryCallback(value, encodeURIComponent);
}
