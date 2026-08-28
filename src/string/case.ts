import {memoize, type Memoized} from '../function/memoize';
import {join, words} from '../internal/string';

// #region Types

type Case = 'camel' | 'kebab' | 'pascal' | 'snake';

type Options = {
	capitalizeAny: boolean;
	capitalizeFirst: boolean;
	type: Case;
};

// #endregion

// #region Functions

/**
 * Convert a string to camel case _(thisIsCamelCase)_
 *
 * @param value String to convert
 * @returns Camel-cased string
 */
export function camelCase(value: string): string {
	return toCase(STRING_CASE_CAMEL, value, true, false);
}

/**
 * Capitalize the first letter of a string _(and lowercase the rest)_
 *
 * @param value String to capitalize
 * @returns Capitalized string
 */
export function capitalize(value: string): string {
	if (typeof value !== 'string' || value.length === 0) {
		return '';
	}

	memoizedCapitalize ??= memoize(v =>
		v.length === 1
			? v.toLocaleUpperCase()
			: `${v.charAt(0).toLocaleUpperCase()}${v.slice(1).toLocaleLowerCase()}`,
	);

	return memoizedCapitalize.run(value);
}

/**
 * Convert a string to kebab case _(this-is-kebab-case)_
 *
 * @param value String to convert
 * @returns Kebab-cased string
 */
export function kebabCase(value: string): string {
	return toCase(STRING_CASE_KEBAB, value, false, false);
}

/**
 * Convert a string to lower case
 *
 * @param value String to convert
 * @returns Lower-cased string
 */
export function lowerCase(value: string): string {
	if (typeof value !== 'string') {
		return '';
	}

	memoizedLowerCase ??= memoize(v => v.toLocaleLowerCase());

	return memoizedLowerCase.run(value);
}

/**
 * Convert a string to pascal case _(ThisIsPascalCase)_
 *
 * @param value String to convert
 * @returns Pascal-cased string
 */
export function pascalCase(value: string): string {
	return toCase(STRING_CASE_PASCAL, value, true, true);
}

/**
 * Convert a string to snake case _(this_is_snake_case)_
 *
 * @param value String to convert
 * @returns Snake-cased string
 */
export function snakeCase(value: string): string {
	return toCase(STRING_CASE_SNAKE, value, false, false);
}

/**
 * Convert a string to title case _(Capitalizing Every Word)_
 *
 * @param value String to convert
 * @returns Title-cased string
 */
export function titleCase(value: string): string {
	if (typeof value !== 'string' || value.length === 0) {
		return '';
	}

	memoizedTitleCase ??= memoize(v =>
		v.length < 2 ? capitalize(v) : join(words(v).map(capitalize), ' '),
	);

	return memoizedTitleCase.run(value);
}

function toCase(
	type: Case,
	value: string,
	capitalizeAny: boolean,
	capitalizeFirst: boolean,
): string {
	caseMemoizers[type] ??= memoize(toCaseCallback.bind({type, capitalizeAny, capitalizeFirst}));

	return caseMemoizers[type].run(value);
}

function toCaseCallback(this: Options, value: string): string {
	if (typeof value !== 'string') {
		return '';
	}

	if (value.length < 1) {
		return value;
	}

	const {capitalizeAny, capitalizeFirst, type} = this;

	const parts = words(value);
	const partsLength = parts.length;

	const cased: string[] = [];

	for (let partIndex = 0; partIndex < partsLength; partIndex += 1) {
		const part = parts[partIndex];

		const acronymParts = part.replace(STRING_EXPRESSION_ACRONYM, (full, one, two, three) =>
			three === STRING_S ? full : `${one}-${two}${three}`,
		);

		const camelCaseParts = acronymParts.replace(
			STRING_EXPRESSION_CAMEL_CASE,
			STRING_REPLACEMENT_CAMEL_CASE,
		);

		const items = camelCaseParts.split('-');
		const itemsLength = items.length;

		const partResult: string[] = [];

		let itemCount = 0;

		for (let itemIndex = 0; itemIndex < itemsLength; itemIndex += 1) {
			const item = items[itemIndex];

			if (item.length === 0) {
				continue;
			}

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
 */
export function upperCase(value: string): string {
	if (typeof value !== 'string' || value.length === 0) {
		return '';
	}

	memoizedUpperCase ??= memoize(v => v.toLocaleUpperCase());

	return memoizedUpperCase.run(value);
}

// #endregion

// #region Variables

const STRING_CASE_CAMEL: Case = 'camel';

const STRING_CASE_KEBAB: Case = 'kebab';

const STRING_CASE_PASCAL: Case = 'pascal';

const STRING_CASE_SNAKE: Case = 'snake';

const STRING_DELIMTER_EMPTY = '';

const STRING_DELIMITER_HYPHEN = '-';

const STRING_DELIMITER_UNDERSCORE = '_';

const STRING_EXPRESSION_CAMEL_CASE = /(\p{Ll})(\p{Lu})/gu;

const STRING_EXPRESSION_ACRONYM = /(\p{Lu}*)(\p{Lu})(\p{Ll}+)/gu;

const STRING_REPLACEMENT_CAMEL_CASE = '$1-$2';

const STRING_S = 's';

const caseMemoizers: Partial<Record<string, Memoized<typeof toCaseCallback>>> = {};

const delimiters: Record<Case, string> = {
	[STRING_CASE_CAMEL]: STRING_DELIMTER_EMPTY,
	[STRING_CASE_KEBAB]: STRING_DELIMITER_HYPHEN,
	[STRING_CASE_PASCAL]: STRING_DELIMTER_EMPTY,
	[STRING_CASE_SNAKE]: STRING_DELIMITER_UNDERSCORE,
};

let memoizedCapitalize: Memoized<(value: string) => string>;

let memoizedLowerCase: Memoized<(value: string) => string>;

let memoizedTitleCase: Memoized<(value: string) => string>;

let memoizedUpperCase: Memoized<(value: string) => string>;

// #endregion
