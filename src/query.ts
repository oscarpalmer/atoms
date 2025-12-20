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
		const key = decoded[0].replace(EXPRESSION_ARRAY_SUFFIX, '');

		if (!ignoreKey(key)) {
			setQueryValue(parameters, key, decoded[1]);
		}
	}

	return parameters;
}

function getParts(value: ArrayOrPlainObject, fromArray: boolean, prefix?: string): string[] {
	const keys = Object.keys(value);
	const {length} = keys;

	const parts: string[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const val = value[key as never];

		const full = join([prefix, fromArray ? undefined : key], '.');

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

function getQueryValue(value: string): unknown {
	if (EXPRESSION_BOOLEAN.test(value)) {
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
	return TYPES.has(typeof value);
}

function setQueryValue(parameters: PlainObject, key: string, value: string): void {
	if (key.includes('.')) {
		setValue(parameters, key, getQueryValue(value));
	} else {
		if (key in parameters) {
			if (!Array.isArray(parameters[key])) {
				parameters[key] = [parameters[key]];
			}

			(parameters[key] as unknown[]).push(getQueryValue(value) as never);
		} else {
			parameters[key] = getQueryValue(value) as never;
		}
	}
}

/**
 * Convert a plain _(nested)_ object to a query string
 * @param parameters Plain object to convert
 * @returns Query string representation of the object
 */
export function toQuery(parameters: PlainObject): string {
	return isPlainObject(parameters)
		? join(
				getParts(parameters, false).filter(part => part.length > 0),
				'&',
			)
		: '';
}

//

const EXPRESSION_ARRAY_SUFFIX = /\[\]$/;

const EXPRESSION_BOOLEAN = /^(false|true)$/;

const TYPES: Set<string> = new Set(['boolean', 'number', 'string']);

//

export type {PlainObject} from './models';
