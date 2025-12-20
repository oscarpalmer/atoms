import {getString} from '../internal/string';
import {getValue} from '../internal/value/get';
import type {PlainObject} from '../models';

export type TemplateOptions = {
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
 * @param value Template string
 * @param variables Variables to use
 * @param options Templating options
 * @returns Templated string
 */
export function template(
	value: string,
	variables: PlainObject,
	options?: Partial<TemplateOptions>,
): string {
	if (typeof value !== 'string') {
		return '';
	}

	if (typeof variables !== 'object' || variables === null) {
		return value;
	}

	const hasOptions = typeof options === 'object' && options != null;
	const ignoreCase = hasOptions && options?.ignoreCase === true;

	const pattern =
		hasOptions && options?.pattern instanceof RegExp ? options.pattern : EXPRESSION_VARIABLE;

	const values: Record<string, string> = {};

	return value.replace(pattern, (_, key) => {
		if (values[key] != null) {
			return values[key];
		}

		const templateValue = getValue(variables, key, ignoreCase);
		const nullish = templateValue == null;

		values[key] = nullish ? '' : getString(templateValue);

		return values[key];
	});
}

//

const EXPRESSION_VARIABLE = /{{([\s\S]+?)}}/g;
