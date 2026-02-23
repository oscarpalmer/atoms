import {isPlainObject} from '../internal/is';
import {getString} from '../internal/string';
import {getValue} from '../internal/value/get';
import type {PlainObject} from '../models';

// #region Types

/**
 * Options for templating strings
 */
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
 * @returns Templated string
 */
type Templater = (value: string, variables?: PlainObject) => string;

// #endregion

// #region Functions

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

/**
 * Create a templater with predefined options
 * @param options Templating options
 * @returns Templater function
 */
export function initializeTemplater(options?: Partial<TemplateOptions>): Templater {
	const {ignoreCase, pattern} = getTemplateOptions(options);

	return (value: string, variables?: PlainObject): string => {
		return handleTemplate(value, pattern, ignoreCase, variables);
	};
}

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
	const {ignoreCase, pattern} = getTemplateOptions(options);

	return handleTemplate(value, pattern, ignoreCase, variables);
}

// #endregion

// #region Variables

const EXPRESSION_VARIABLE = /{{([\s\S]+?)}}/g;

// #endregion
