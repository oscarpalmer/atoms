import {getString} from '../internal/string';
import {getValue} from '../internal/value/get';
import {isPlainObject} from '../is';
import type {PlainObject} from '../models';

type TemplateOptions = {
	/**
	 * Ignore case when searching for variables?
	 */
	ignoreCase?: boolean;
	/**
	 * Custom pattern for outputting variables
	 */
	pattern?: RegExp;
};

type Template = {
	/**
	 * Render a string from a template with variables
	 * @param value Template string
	 * @param variables Variables to use
	 * @param options Templating options
	 * @returns Templated string
	 */
	(value: string, variables: PlainObject, options?: Partial<TemplateOptions>): string;

	/**
	 * Create a templater with predefined options
	 * @param options Templating options
	 * @returns Templater function
	 */
	initialize(options?: Partial<TemplateOptions>): Templater;
};

/**
 * Render a string from a template with variables
 * @param value Template string
 * @param variables Variables to use
 * @returns Templated string
 */
type Templater = (value: string, variables?: PlainObject) => string;

//

function getTemplateOptions(input?: Partial<TemplateOptions>): Required<TemplateOptions> {
	const options = isPlainObject(input) ? (input as TemplateOptions) : {};

	return {
		ignoreCase: options.ignoreCase === true,
		pattern: options.pattern instanceof RegExp ? options.pattern : EXPRESSION_VARIABLE,
	};
}

function handleTemplate(
	value: string,
	pattern: RegExp,
	ignoreCase: boolean,
	variables?: PlainObject,
): string {
	if (typeof value !== 'string') {
		return '';
	}

	if (typeof variables !== 'object' || variables === null) {
		return value;
	}

	const values: Record<string, string> = {};

	return value.replace(pattern, (_, key) => {
		if (values[key] == null) {
			const templateValue = getValue(variables, key, ignoreCase);

			values[key] = templateValue == null ? '' : getString(templateValue);
		}

		return values[key];
	});
}

const template = ((value: string, variables: PlainObject, options?: Partial<TemplateOptions>) => {
	const {ignoreCase, pattern} = getTemplateOptions(options);

	return handleTemplate(value, pattern, ignoreCase, variables);
}) as Template;

template.initialize = (options?: Partial<TemplateOptions>): Templater => {
	const {ignoreCase, pattern} = getTemplateOptions(options);

	return (value: string, variables?: PlainObject): string => {
		return handleTemplate(value, pattern, ignoreCase, variables);
	};
};

//

const EXPRESSION_VARIABLE = /{{([\s\S]+?)}}/g;

//

export {template};
