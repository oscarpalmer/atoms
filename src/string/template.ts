import type {PlainObject} from '../models';
import {getString} from '../string/misc';
import {getValue} from '../value/get';

type Options = {
	/**
	 * Ignore case when searching for variables?
	 */
	ignoreCase?: boolean;
	/**
	 * Custom pattern for outputting variables
	 */
	pattern?: RegExp;
};

/**
 * Render a string from a template with variables
 */
export function template(
	value: string,
	variables: PlainObject,
	options?: Partial<Options>,
): string {
	if (typeof value !== 'string') {
		return '';
	}

	if (typeof variables !== 'object' || variables === null) {
		return value;
	}

	const ignoreCase = options?.ignoreCase === true;

	const pattern =
		options?.pattern instanceof RegExp ? options.pattern : variablePattern;

	const values: Record<string, string> = {};

	return value.replace(pattern, (_, key) => {
		if (values[key] != null) {
			return values[key];
		}

		const value = getValue(variables, key, ignoreCase);
		const nullish = value == null;

		values[key] = nullish ? '' : getString(value);

		return values[key];
	});
}

const variablePattern = /{{([\s\S]+?)}}/g;
