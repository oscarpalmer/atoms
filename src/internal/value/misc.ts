import type {ArrayOrPlainObject, PlainObject} from '../../models';
import {ignoreKey} from '../string';

// #region Functions

function findKey(needle: string, haystack: ArrayOrPlainObject): string {
	const keys = Object.keys(haystack);
	const normalized = keys.map(key => key.toLowerCase());
	const index = normalized.indexOf(needle.toLowerCase());

	return index > -1 ? keys[index] : needle;
}

export function getPaths(path: string, lowercase: boolean): string | string[] {
	const normalized = lowercase ? path.toLowerCase() : path;

	if (!EXPRESSION_NESTED.test(normalized)) {
		return normalized;
	}

	return normalized.replace(EXPRESSION_BRACKET, '.$1').replace(EXPRESSION_DOTS, '').split('.');
}

export function handleValue(
	data: ArrayOrPlainObject,
	path: string,
	value: unknown,
	get: boolean,
	ignoreCase: boolean,
): unknown {
	if (typeof data === 'object' && data !== null && !ignoreKey(path)) {
		const key = ignoreCase ? findKey(path, data) : path;

		if (get) {
			return data[key as never];
		}

		(data as PlainObject)[key] = typeof value === 'function' ? value(data[key as never]) : value;
	}
}

// #endregion

// #region Variables

const EXPRESSION_BRACKET = /\[(\w+)\]/g;

const EXPRESSION_DOTS = /^\.|\.$/g;

const EXPRESSION_NESTED = /\.|\[\w+\]/;

// #endregion
