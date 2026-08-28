import {isPlainObject} from './internal/is';
import {getNumber} from './internal/number';
import {getString, ignoreKey, join, tryDecode, tryEncode} from './internal/string';
import {setValue} from './internal/value/set';
import type {ArrayOrPlainObject, PlainObject} from './models';

// #region Functions

/**
 * Convert a query string to a plain _(nested)_ object
 *
 * @param query Query string to convert
 * @returns Plain object representation of the query string
 */
export function fromQuery(query: string): PlainObject {
	if (typeof query !== 'string' || query.trim().length === 0) {
		return {};
	}

	const parts = query
		.split(QUERY_AMPERSAND)
		.map(part => part.split(QUERY_EQUAL).map(tryDecode))
		.sort(([first], [second]) => first.localeCompare(second));

	const {length} = parts;

	const parameters: PlainObject = {};

	let position = 0;
	let array: string | undefined;

	for (let index = 0; index < length; index += 1) {
		const [key, value] = parts[index];

		if (QUERY_EXPRESSION_ARRAY_SUFFIX.test(key)) {
			const named = key.replace(QUERY_EXPRESSION_ARRAY_SUFFIX, '');

			if (named !== array) {
				array = named;
				position = 0;
			}
		} else {
			array = undefined;
			position = 0;
		}

		const full = array == null ? key : `${array}.${position}`;

		if (!ignoreKey(full)) {
			setValue(parameters, full, getQueryValue(value));
		}

		position += 1;
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

		const fullKey = join([prefix, fromArray ? undefined : key], QUERY_DOT);

		const encodedKey = getString(tryEncode(fullKey));
		const prefixedKey = fromArray ? join([encodedKey, index], QUERY_DOT) : encodedKey;

		if (Array.isArray(val)) {
			parts.push(...getParts(val, true, fullKey));
		} else if (isPlainObject(val)) {
			parts.push(...getParts(val, false, fullKey));
		} else if (isDecodable(val)) {
			parts.push(`${prefixedKey}=${getString(tryEncode(val))}`);
		} else if (val instanceof Date) {
			parts.push(`${prefixedKey}=${val.toJSON()}`);
		}
	}

	return parts;
}

function getQueryValue(value: string): unknown {
	if (QUERY_EXPRESSION_BOOLEAN.test(value)) {
		return value === QUERY_TRUE;
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
	return QUERY_TYPES.has(typeof value);
}

/**
 * Convert a plain _(nested)_ object to a query string
 *
 * @param parameters Plain object to convert
 * @returns Query string representation of the object
 */
export function toQuery(parameters: PlainObject): string {
	return isPlainObject(parameters)
		? join(
				getParts(parameters, false).filter(part => part.length > 0),
				QUERY_AMPERSAND,
			)
		: '';
}

// #endregion

// #region Variables

const QUERY_AMPERSAND = '&';

const QUERY_DOT = '.';

const QUERY_EQUAL = '=';

const QUERY_EXPRESSION_ARRAY_SUFFIX = /\[\]$/;

const QUERY_EXPRESSION_BOOLEAN = /^(false|true)$/;

const QUERY_TRUE = 'true';

const QUERY_TYPES = new Set(['boolean', 'number', 'string']);

// #endregion
