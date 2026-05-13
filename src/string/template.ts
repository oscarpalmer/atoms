import {isPlainObject, isTemplateStringsArray} from '../internal/is';
import {getString, interpolate} from '../internal/string';
import {getValue} from '../internal/value/get';
import type {PlainObject} from '../models';

// #region Types

/**
 * Renderer for a string template with variables
 *
 * @param variables Variables to use
 * @param options Templating options
 * @returns Templated string
 */
type Renderer = (variables?: PlainObject, options?: Partial<TemplateOptions>) => string;

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

type Templater = {
	/**
	 * Render a string from a template with variables
	 *
	 * @returns Templated string
	 */
	(strings: TemplateStringsArray, ...values: unknown[]): TemplaterRenderer;

	/**
	 * Render a string from a template with variables
	 *
	 * @param value Template string
	 * @param variables Variables to use
	 * @returns Templated string
	 */
	(value: string, variables?: PlainObject): string;
};

/**
 * Render a template string with variables
 */
type TemplaterRenderer = (variables?: PlainObject) => string;

// #endregion

// #region Functions

function getRenderer(strings: TemplateStringsArray, values: unknown[]): Renderer {
	return (variables?: PlainObject, options?: Partial<TemplateOptions>) => {
		return template(interpolate(strings, values), variables, options);
	};
}

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

	if (typeof variables !== 'object' || variables === null || Object.keys(variables).length === 0) {
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
 * Create a _Templater_ with predefined options
 *
 * _Available as `initializeTemplater` and `template.initialize`_
 *
 * @param options Templating options
 * @returns _Templater_ function
 */
export function initializeTemplater(options?: Partial<TemplateOptions>): Templater {
	const {ignoreCase, pattern} = getTemplateOptions(options);

	return ((value: string | TemplateStringsArray, ...parameters: unknown[]) => {
		return isTemplateStringsArray(value)
			? (variables?: PlainObject) =>
					handleTemplate(interpolate(value, parameters), pattern, ignoreCase, variables)
			: handleTemplate(value, pattern, ignoreCase, parameters[0] as PlainObject);
	}) as Templater;
}

/**
 * Get a _Renderer_ for a string template
 *
 * @returns _Renderer_ function
 */
export function template(strings: TemplateStringsArray, ...values: unknown[]): Renderer;

/**
 * Render a string from a template with variables
 *
 * @param value Template string
 * @param variables Variables to use
 * @param options Templating options
 * @returns Templated string
 */
export function template(
	value: string,
	variables?: PlainObject,
	options?: Partial<TemplateOptions>,
): string;

export function template(
	value: string | TemplateStringsArray,
	...parameters: unknown[]
): string | Renderer {
	if (isTemplateStringsArray(value)) {
		return getRenderer(value, parameters);
	}

	const {ignoreCase, pattern} = getTemplateOptions(parameters[1] as Partial<TemplateOptions>);

	return handleTemplate(value, pattern, ignoreCase, parameters[0] as PlainObject);
}

template.initialize = initializeTemplater;

// #endregion

// #region Variables

const EXPRESSION_VARIABLE = /{{([\s\S]+?)}}/g;

// #endregion
