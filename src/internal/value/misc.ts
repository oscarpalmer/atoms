import {error, ok} from '../../internal/result/misc';
import type {PlainObject} from '../../models';
import type {Result} from '../../models/result.model';
import {
	VALUE_MISC_EXPRESSION_BRACKET,
	VALUE_MISC_EXPRESSION_DOTS,
	VALUE_MISC_EXPRESSION_NESTED,
	VALUE_MISC_NESTED_MESSAGE_INPUT,
	VALUE_MISC_NESTED_MESSAGE_MISSING,
	VALUE_MISC_NESTED_MESSAGE_PATH,
	VALUE_MISC_NESTED_MESSAGE_UNSAFE,
} from '../../models/value/value.misc.model';
import {ignoreKey} from '../string/misc';

// #region Functions

export function findKey(needle: string, haystack: object): string {
	const keys = Object.keys(haystack);
	const normalized = keys.map(key => key.toLowerCase());
	const index = normalized.indexOf(needle.toLowerCase());

	return index > -1 ? keys[index] : needle;
}

export function getNestedValue(
	data: object,
	path: string,
	ignoreCase: boolean,
): Result<unknown, string> {
	if (typeof data !== 'object' || data === null) {
		return error(VALUE_MISC_NESTED_MESSAGE_INPUT);
	}

	if (typeof path !== 'string' || path.trim().length === 0) {
		return error(VALUE_MISC_NESTED_MESSAGE_PATH);
	}

	const shouldIgnoreCase = ignoreCase === true;
	const paths = getPaths(path, shouldIgnoreCase);

	if (typeof paths === 'string') {
		return handleValue(data, paths, null, true, shouldIgnoreCase);
	}

	const {length} = paths;

	let current = data;

	for (let index = 0; index < length; index += 1) {
		const part = paths[index];

		const handled = handleValue(current, part, null, true, shouldIgnoreCase);

		if (!handled.ok) {
			return handled;
		}

		current = handled.value;
	}

	return ok(current);
}

export function getPaths(path: string, lowercase: boolean): string | string[] {
	const normalized = lowercase ? path.toLowerCase() : path;

	if (!VALUE_MISC_EXPRESSION_NESTED.test(normalized)) {
		return normalized;
	}

	return normalized
		.replace(VALUE_MISC_EXPRESSION_BRACKET, '.$1')
		.replace(VALUE_MISC_EXPRESSION_DOTS, '')
		.split('.');
}

export function handleValue(
	data: object,
	path: string,
	value: unknown,
	get: true,
	ignoreCase: boolean,
): Result<object, string>;

export function handleValue(
	data: object,
	path: string,
	value: unknown,
	get: false,
	ignoreCase: boolean,
): void;

export function handleValue(
	data: object,
	path: string,
	value: unknown,
	get: boolean,
	ignoreCase: boolean,
): Result<unknown, string> | void {
	if (typeof data === 'object' && data !== null) {
		if (ignoreKey(path)) {
			return error(VALUE_MISC_NESTED_MESSAGE_UNSAFE);
		}

		const dataObject = data as PlainObject;
		const key = ignoreCase ? findKey(path, dataObject) : path;

		if (get) {
			return key in dataObject ? ok(dataObject[key]) : error(VALUE_MISC_NESTED_MESSAGE_MISSING);
		}

		dataObject[key] = typeof value === 'function' ? value(dataObject[key]) : value;
	}

	if (get) {
		return error(VALUE_MISC_NESTED_MESSAGE_MISSING);
	}
}

// #endregion
