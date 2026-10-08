import {isPlainObject, isTemplateStringsArray} from '../internal/is';
import {getString, interpolate} from '../internal/string/misc';
import {getValue} from '../internal/value/get';
import type {PlainObject} from '../models/index';
import {
	TEMPLATE_EXPRESSION_VARIABLE,
	TEMPLATE_SYMBOL,
	type InternalTemplater,
	type Renderer,
	type TemplateOptions,
	type Templater,
	type TemplaterOptions,
	type TemplaterRenderer,
} from '../models/string/string.template.model';

// #region Instances

function Templater(this: any, options: TemplaterOptions): void {
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

// #region Namespace

export declare namespace template {
	export var initialize: typeof initializeTemplater;
}

// #endregion

// #region Initialization

template.initialize = initializeTemplater;

// #endregion

// #region Exports

export type {Renderer, TemplateOptions, Templater, TemplaterOptions, TemplaterRenderer};

// #endregion
