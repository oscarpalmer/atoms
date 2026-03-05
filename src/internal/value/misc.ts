import type {PlainObject} from '../../models';
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
): {exists: boolean; value: unknown} {
	if (
		typeof data !== 'object' ||
		data === null ||
		typeof path !== 'string' ||
		path.trim().length === 0
	) {
		return {exists: false, value: undefined};
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

		if (!handled.exists) {
			return handled;
		}

		current = handled.value as object;
	}

	return {exists: true, value: current};
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
): {exists: boolean; value: unknown};

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
): {exists: boolean; value: unknown} | void {
	if (typeof data === 'object' && data !== null && !ignoreKey(path)) {
		const key = ignoreCase ? findKey(path, data) : path;

		if (get) {
			return {exists: key in data, value: data[key as never]};
		}

		(data as PlainObject)[key] = typeof value === 'function' ? value(data[key as never]) : value;
	}

	if (get) {
		return {exists: false, value: undefined};
	}
}

// #endregion

// #region Variables

const EXPRESSION_BRACKET = /\[(\w+)\]/g;

const EXPRESSION_DOTS = /^\.|\.$/g;

const EXPRESSION_NESTED = /\.|\[\w+\]/;

// #endregion
