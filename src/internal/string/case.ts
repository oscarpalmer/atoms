import type {Memoized} from '../../models/function/memoize.model';
import {
	ignoreCachingCases,
	STRING_CASE_CAMEL,
	STRING_CASE_CAPITALIZE,
	STRING_CASE_KEBAB,
	STRING_CASE_LOWER,
	STRING_CASE_PASCAL,
	STRING_CASE_SNAKE,
	STRING_CASE_TITLE,
	STRING_CASE_UPPER,
	STRING_DELIMITER_EMPTY,
	STRING_DELIMITER_HYPHEN,
	STRING_DELIMITER_SPACE,
	STRING_DELIMITER_UNDERSCORE,
	STRING_EXPRESSION_ACRONYM,
	STRING_EXPRESSION_CAMEL_CASE,
	STRING_REPLACEMENT_CAMEL_CASE,
	type StringCase,
	type StringCaseOptions,
} from '../../models/string/string.case.model';
import {memoize} from '../function/memoize';
import {join, words} from './misc';

// #region Functions

/**
 * Convert a string to camel case _(thisIsCamelCase)_
 *
 * @param value String to convert
 * @returns Camel-cased string
 *
 * @example
 * ```typescript
 * camelCase('this is camel case'); // => 'thisIsCamelCase'
 * camelCase('ThisIsCamelCase');    // => 'thisIsCamelCase'
 * camelCase('this-is-camel-case'); // => 'thisIsCamelCase'
 * camelCase('this_is_camel_case'); // => 'thisIsCamelCase'
 * ```
 */
export function camelCase(value: string): string {
	return toCase(STRING_CASE_CAMEL, value, true, false);
}

/**
 * Capitalize the first letter of a string _(and lowercase the rest)_
 *
 * @param value String to capitalize
 * @returns Capitalized string
 *
 * @example
 * ```typescript
 * capitalize('this is a test'); // => 'This is a test'
 * capitalize('This Is A Test'); // => 'This is a test'
 * capitalize('t');              // => 'T'
 * capitalize('');               // => ''
 * ```
 */
export function capitalize(value: string): string {
	return toCase(STRING_CASE_CAPITALIZE, value, true, true, capitalizeHandler);
}

function capitalizeHandler(value: string): string {
	if (value.length === 1) {
		return value.toLocaleUpperCase();
	}

	return `${value.charAt(0).toLocaleUpperCase()}${value.slice(1).toLocaleLowerCase()}`;
}

/**
 * Convert a string to kebab case _(this-is-kebab-case)_
 *
 * @param value String to convert
 * @returns Kebab-cased string
 *
 * @example
 * ```typescript
 * kebabCase('this is kebab case'); // => 'this-is-kebab-case'
 * kebabCase('ThisIsKebabCase');    // => 'this-is-kebab-case'
 * kebabCase('this-is-kebab-case'); // => 'this-is-kebab-case'
 * kebabCase('this_is_kebab_case'); // => 'this-is-kebab-case'
 * ```
 */
export function kebabCase(value: string): string {
	return toCase(STRING_CASE_KEBAB, value, false, false);
}

/**
 * Convert a string to lower case
 *
 * @param value String to convert
 * @returns Lower-cased string
 *
 * @example
 * ```typescript
 * lowerCase('THIS IS A TEST'); // => 'this is a test'
 * lowerCase('this is a test'); // => 'this is a test'
 * lowerCase('t');              // => 't'
 * ```
 */
export function lowerCase(value: string): string {
	return toCase(STRING_CASE_LOWER, value, false, false, lowerCaseHandler);
}

function lowerCaseHandler(value: string): string {
	return value.toLocaleLowerCase();
}

/**
 * Convert a string to pascal case _(ThisIsPascalCase)_
 *
 * @param value String to convert
 * @returns Pascal-cased string
 *
 * @example
 * ```typescript
 * pascalCase('this is pascal case'); // => 'ThisIsPascalCase'
 * pascalCase('ThisIsPascalCase');    // => 'ThisIsPascalCase'
 * pascalCase('this-is-pascal-case'); // => 'ThisIsPascalCase'
 * pascalCase('this_is_pascal_case'); // => 'ThisIsPascalCase'
 * ```
 */
export function pascalCase(value: string): string {
	return toCase(STRING_CASE_PASCAL, value, true, true);
}

/**
 * Convert a string to snake case _(this_is_snake_case)_
 *
 * @param value String to convert
 * @returns Snake-cased string
 *
 * @example
 * ```typescript
 * snakeCase('this is snake case'); // => 'this_is_snake_case'
 * snakeCase('ThisIsSnakeCase');    // => 'this_is_snake_case'
 * snakeCase('this-is-snake-case'); // => 'this_is_snake_case'
 * snakeCase('this_is_snake_case'); // => 'this_is_snake_case'
 * ```
 */
export function snakeCase(value: string): string {
	return toCase(STRING_CASE_SNAKE, value, false, false);
}

/**
 * Convert a string to title case _(Capitalizing Every Word)_
 *
 * @param value String to convert
 * @returns Title-cased string
 *
 * @example
 * ```typescript
 * titleCase('this is a test'); // => 'This Is A Test'
 * titleCase('This Is A Test'); // => 'This Is A Test'
 * titleCase('t');              // => 'T'
 * titleCase('');               // => ''
 * ```
 */
export function titleCase(value: string): string {
	return toCase(STRING_CASE_TITLE, value, true, true, titleCaseHandler);
}

function titleCaseHandler(value: string): string {
	if (value.length < 2) {
		return capitalize(value);
	}

	return join(words(value).map(capitalize), STRING_DELIMITER_SPACE);
}

function toCase(
	type: StringCase,
	value: string,
	capitalizeAny: boolean,
	capitalizeFirst: boolean,
	handler?: (value: string) => string,
): string {
	if (typeof value !== 'string') {
		return '';
	}

	if (value.trim().length === 0) {
		return value;
	}

	if (handler == null) {
		caseMemoizers[type] ??= memoize(toCaseCallback.bind({type, capitalizeAny, capitalizeFirst}));

		return caseMemoizers[type].run(value);
	}

	if (ignoreCachingCases.has(type)) {
		return handler(value);
	}

	simpleMemoizers[type] ??= memoize(handler);

	return simpleMemoizers[type].run(value);
}

export function toCaseCallback(this: StringCaseOptions, value: string): string {
	const {capitalizeAny, capitalizeFirst, type} = this;

	const parts = words(value);
	const partsLength = parts.length;

	const cased: string[] = [];

	for (let partIndex = 0; partIndex < partsLength; partIndex += 1) {
		const part = parts[partIndex];

		const acronymParts = part.replace(STRING_EXPRESSION_ACRONYM, STRING_DELIMITER_HYPHEN);

		const camelCaseParts = acronymParts.replace(
			STRING_EXPRESSION_CAMEL_CASE,
			STRING_REPLACEMENT_CAMEL_CASE,
		);

		const items = camelCaseParts.split(STRING_DELIMITER_HYPHEN);
		const itemsLength = items.length;

		const partResult: string[] = [];

		let itemCount = 0;

		for (let itemIndex = 0; itemIndex < itemsLength; itemIndex += 1) {
			const item = items[itemIndex];

			if (!capitalizeAny || (itemCount === 0 && partIndex === 0 && !capitalizeFirst)) {
				partResult.push(item.toLocaleLowerCase());
			} else {
				partResult.push(capitalize(item));
			}

			itemCount += 1;
		}

		cased.push(join(partResult, delimiters[type]));
	}

	return join(cased, delimiters[type]);
}

/**
 * Convert a string to upper case
 *
 * @param value String to convert
 * @returns Upper-cased string
 *
 * @example
 * ```typescript
 * upperCase('this is a test'); // => 'THIS IS A TEST'
 * upperCase('This Is A Test'); // => 'THIS IS A TEST'
 * upperCase('t');              // => 'T'
 * upperCase('');               // => ''
 * ```
 */
export function upperCase(value: string): string {
	return toCase(STRING_CASE_UPPER, value, false, false, upperCaseHandler);
}

function upperCaseHandler(value: string): string {
	return value.toLocaleUpperCase();
}

// #endregion

// #region Variables

const caseMemoizers: Partial<Record<StringCase, Memoized<typeof toCaseCallback>>> = {};

const delimiters: Record<string, string> = {
	[STRING_CASE_CAMEL]: STRING_DELIMITER_EMPTY,
	[STRING_CASE_KEBAB]: STRING_DELIMITER_HYPHEN,
	[STRING_CASE_PASCAL]: STRING_DELIMITER_EMPTY,
	[STRING_CASE_SNAKE]: STRING_DELIMITER_UNDERSCORE,
};

const simpleMemoizers: Partial<Record<StringCase, Memoized<(value: string) => string>>> = {};

// #endregion
