import type {PlainObject} from '../index';

// #region Types

export type InternalTemplater = {
	[TEMPLATE_SYMBOL]: Required<TemplateOptions>;
} & Templater;

/**
 * Renderer for a string template with variables
 *
 * @param variables Variables to use
 * @param options Templating options
 * @returns Templated string
 */
export type Renderer = (variables?: PlainObject, options?: Partial<TemplateOptions>) => string;

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

export type Templater = {
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

export type TemplaterOptions = Required<TemplateOptions>;

/**
 * Render a template string with variables
 */
export type TemplaterRenderer = (variables?: PlainObject) => string;

// #endregion

// #region Variables

export const TEMPLATE_EXPRESSION_VARIABLE: RegExp = /{{([\s\S]+?)}}/g;

export const TEMPLATE_SYMBOL: unique symbol = Symbol('template');

// #endregion
