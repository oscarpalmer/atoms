import {isPlainObject} from './internal/is';
import {getNumber} from './internal/number';
import {ignoreKey, join, tryDecode, tryEncode} from './internal/string';
import {setValue} from './internal/value/set';
import type {ArrayOrPlainObject, PlainObject} from './models';

/**
 * Convert a query string to a plain _(nested)_ object
 * @param query Query string to convert
 * @returns Plain object representation of the query string
 */
export function fromQuery(query: string): PlainObject {
	if (typeof query !== 'string' || query.trim().length === 0) {
		return {};
	}

	const parts = query.split('&');
	const {length} = parts;

	const parameters: PlainObject = {};

	for (let index = 0; index < length; index += 1) {
		const decoded = parts[index].split('=').map(tryDecode);
		const key = decoded[0].replace(arraySuffixPattern, '');
		const value = decoded[1];

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

		const full = join([prefix, fromArray ? null : key], '.');

		if (Array.isArray(val)) {
			parts.push(...getParts(val, true, full));
		} else if (isPlainObject(val)) {
			parts.push(...getParts(val, false, full));
		} else if (isDecodable(val)) {
			parts.push(`${tryEncode(full)}=${tryEncode(val)}`);
		} else if (val instanceof Date) {
			parts.push(`${tryEncode(full)}=${val.toJSON()}`);
		}
	}

	return parts;
}

function getValue(value: string): unknown {
	if (booleanPattern.test(value)) {
		return value === 'true';
	}

	const asNumber = getNumber(value);

	if (!Number.isNaN(asNumber)) {
		return asNumber;
	}

	const parsed = Date.parse(value);

	if (Number.isNaN(parsed)) {
		return value;
	}

	const date = new Date(parsed);

	return date.toJSON() === value ? date : value;
}

function isDecodable(value: unknown): value is boolean | number | string {
	return types.has(typeof value);
}

/**
 * Convert a plain _(nested)_ object to a query string
 * @param parameters Plain object to convert
 * @returns Query string representation of the object
 */
export function toQuery(parameters: PlainObject): string {
	return isPlainObject(parameters)
		? getParts(parameters, false)
				.filter(part => part.length > 0)
				.join('&')
		: '';
}

//

const arraySuffixPattern = /\[\]$/;

const booleanPattern = /^(false|true)$/;

const types = new Set(['boolean', 'number', 'string']);

//

export type {PlainObject} from './models';
