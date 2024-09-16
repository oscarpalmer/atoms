import type {PlainObject} from '../models';
import {getValue} from '../value';
import {getString} from './index';

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

export function template(
	value: string,
	variables: PlainObject,
	options?: Partial<Options>,
): string {
	const ignoreCase = options?.ignoreCase === true;

	const pattern =
		options?.pattern instanceof RegExp ? options.pattern : /{{([\s\S]+?)}}/g;

	const values: Record<string, string> = {};

	return value.replace(pattern, (_, key) => {
		if (values[key] != null) {
			return values[key];
		}

		const value = getValue(variables, key, ignoreCase);

		if (value == null) {
			return '';
		}

		values[key] = getString(value);

		return values[key];
	});
}
