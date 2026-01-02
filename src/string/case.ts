import {memoize, type Memoized} from '../function';
import {join, words} from '../internal/string';

//

type Case = 'camel' | 'kebab' | 'pascal' | 'snake';

type Options = {
	capitalizeAny: boolean;
	capitalizeFirst: boolean;
	type: Case;
};

//

/**
 * Convert a string to camel case _(thisIsCamelCase)_
 * @param value String to convert to camel case
 * @returns Camel-cased string
 */
export function camelCase(value: string): string {
	return toCase('camel', value, true, false);
}

/**
 * Capitalize the first letter of a string _(and lowercase the rest)_
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
 * @param value String to convert to kebab case
 * @returns Kebab-cased string
 */
export function kebabCase(value: string): string {
	return toCase('kebab', value, false, false);
}

/**
 * Convert a string to pascal case _(ThisIsPascalCase)_
 * @param value String to convert to pascal case
 * @returns Pascal-cased string
 */
export function pascalCase(value: string): string {
	return toCase('pascal', value, true, true);
}

/**
 * Convert a string to snake case _(this_is_snake_case)_
 * @param value String to convert to snake case
 * @returns Snake-cased string
 */
export function snakeCase(value: string): string {
	return toCase('snake', value, false, false);
}

/**
 * Convert a string to title case _(Capitalizing Every Word)_
 * @param value String to convert to title case
 * @returns Title-cased string
 */
export function titleCase(value: string): string {
	if (typeof value !== 'string') {
		return '';
	}

	memoizedTitleCase ??= memoize(v =>
		v.length < 1 ? capitalize(v) : join(words(v).map(capitalize), ' '),
	);

	return memoizedTitleCase.run(value);
}

function toCase(
	type: Case,
	value: string,
	capitalizeAny: boolean,
	capitalizeFirst: boolean,
): string {
	memoizers[type] ??= memoize(toCaseCallback.bind({type, capitalizeAny, capitalizeFirst}));

	return memoizers[type].run(value);
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

	const result: string[] = [];

	for (let partIndex = 0; partIndex < partsLength; partIndex += 1) {
		const part = parts[partIndex];

		const acronymParts = part.replace(EXPRESSION_ACRONYM, (full, one, two, three) =>
			three === 's' ? full : `${one}-${two}${three}`,
		);

		const camelCaseParts = acronymParts.replace(EXPRESSION_CAMEL_CASE, REPLACEMENT_CAMEL_CASE);

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

		result.push(join(partResult, delimiters[type]));
	}

	return join(result, delimiters[type]);
}

//

const EXPRESSION_CAMEL_CASE = /(\p{Ll})(\p{Lu})/gu;

const EXPRESSION_ACRONYM = /(\p{Lu}*)(\p{Lu})(\p{Ll}+)/gu;

const REPLACEMENT_CAMEL_CASE = '$1-$2';

//

const delimiters: Record<Case, string> = {
	camel: '',
	kebab: '-',
	pascal: '',
	snake: '_',
};

const memoizers: Partial<Record<string, Memoized<typeof toCaseCallback>>> = {};

let memoizedCapitalize: Memoized<(value: string) => string>;

let memoizedTitleCase: Memoized<(value: string) => string>;
