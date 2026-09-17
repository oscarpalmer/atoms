import {isPlainObject, isTemplateStringsArray} from '../internal/is';
import {getString, interpolate} from '../internal/string/misc';
import {getValue} from '../internal/value/get';
import type {PlainObject} from '../models';

// #region Types

type InternalTemplater = {
	[TEMPLATE_SYMBOL]: Required<TemplateOptions>;
} & Templater;

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
	render(strings: TemplateStringsArray, ...values: unknown[]): TemplaterRenderer;

	/**
	 * Render a string from a template with variables
	 *
	 * @param value Template string
	 * @param variables Variables to use
	 * @returns Templated string
	 */
	render(value: string, variables?: PlainObject): string;
};

/**
 * Render a template string with variables
 */
type TemplaterRenderer = (variables?: PlainObject) => string;

// #endregion

// #region Instances

function Templater(this: any, options: Required<TemplateOptions>) {
	this[TEMPLATE_SYMBOL] = options;
}

Templater.prototype.render = render;

// #endregion

// #region Functions

function createTemplateOptions(input?: Partial<TemplateOptions>): Required<TemplateOptions> {
	const options = isPlainObject(input) ? (input as TemplateOptions) : {};

	return {
		ignoreCase: options.ignoreCase === true,
		pattern: options.pattern instanceof RegExp ? options.pattern : TEMPLATE_EXPRESSION_VARIABLE,
	};
}

function getRenderer(strings: TemplateStringsArray, values: unknown[]): Renderer {
	return (variables?: PlainObject, options?: Partial<TemplateOptions>) => {
		return template(interpolate(strings, values), variables, options);
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
	// @ts-expect-error All good, no worries :-)
	return new Templater(createTemplateOptions(options));
}

function render(
	this: InternalTemplater,
	value: string | TemplateStringsArray,
	...parameters: unknown[]
): string | TemplaterRenderer {
	const {ignoreCase, pattern} = this[TEMPLATE_SYMBOL];

	if (isTemplateStringsArray(value)) {
		return (variables?: PlainObject) =>
			handleTemplate(interpolate(value, parameters), pattern, ignoreCase, variables);
	}

	return handleTemplate(value, pattern, ignoreCase, parameters[0] as PlainObject);
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

	const {ignoreCase, pattern} = createTemplateOptions(parameters[1] as Partial<TemplateOptions>);

	return handleTemplate(value, pattern, ignoreCase, parameters[0] as PlainObject);
}

// #endregion

// #region Variables

const TEMPLATE_EXPRESSION_VARIABLE = /{{([\s\S]+?)}}/g;

const TEMPLATE_SYMBOL = Symbol('template');

// #endregion

// #region Initialization

template.initialize = initializeTemplater;

// #endregion
