import type {PlainObject} from '../../models';
import {error, ok} from '../../result/misc';
import type {Result} from '../../result/models';
import {ignoreKey} from '../string';

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
): Result<unknown, undefined> {
	if (
		typeof data !== 'object' ||
		data === null ||
		typeof path !== 'string' ||
		path.trim().length === 0
	) {
		return error(undefined);
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

		current = handled.value as object;
	}

	return ok(current);
}

export function getPaths(path: string, lowercase: boolean): string | string[] {
	const normalized = lowercase ? path.toLowerCase() : path;

	if (!EXPRESSION_NESTED.test(normalized)) {
		return normalized;
	}

	return normalized.replace(EXPRESSION_BRACKET, '.$1').replace(EXPRESSION_DOTS, '').split('.');
}

export function handleValue(
	data: object,
	path: string,
	value: unknown,
	get: true,
	ignoreCase: boolean,
): Result<unknown, undefined>;

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
): Result<unknown, undefined> | void {
	if (typeof data === 'object' && data !== null && !ignoreKey(path)) {
		const key = ignoreCase ? findKey(path, data) : path;

		if (get) {
			return key in data ? ok(data[key as never]) : error(undefined);
		}

		(data as PlainObject)[key] = typeof value === 'function' ? value(data[key as never]) : value;
	}

	if (get) {
		return error(undefined);
	}
}

// #endregion

// #region Variables

const EXPRESSION_BRACKET = /\[(\w+)\]/g;

const EXPRESSION_DOTS = /^\.|\.$/g;

const EXPRESSION_NESTED = /\.|\[\w+\]/;

// #endregion
