import {words} from './index';

/**
 * Convert a string to camel case _(thisIsCamelCase)_
 */
export function camelCase(value: string): string {
	return toCase(value, '', true, false);
}

/**
 * Capitalise the first letter of a string _(and lowercase the rest)_
 */
export function capitalise(value: string): string {
	if (value.length === 0) {
		return value;
	}

	return value.length === 1
		? value.toLocaleUpperCase()
		: `${value.charAt(0).toLocaleUpperCase()}${value.slice(1).toLocaleLowerCase()}`;
}

/**
 * Convert a string to kebab case _(this-is-kebab-case)_
 */
export function kebabCase(value: string): string {
	return toCase(value, '-', false, false);
}

/**
 * Convert a string to pascal case _(ThisIsPascalCase)_
 */
export function pascalCase(value: string): string {
	return toCase(value, '', true, true);
}

/**
 * Convert a string to snake case _(this_is_snake_case)_
 */
export function snakeCase(value: string): string {
	return toCase(value, '_', false, false);
}

/**
 * Convert a string to title case _(capitalising every word)_
 */
export function titleCase(value: string): string {
	return words(value).map(capitalise).join(' ');
}

function toCase(
	value: string,
	delimiter: string,
	capitaliseAny: boolean,
	capitaliseFirst: boolean,
): string {
	return words(value)
		.map((word, index) => {
			/**
			 * Splitting formatted words into parts:
			 * 1. `IDs` -> `['IDs']`
			 * 2. `safeHTML` -> `['safe', 'HTML']`
			 * 3. `escapeHTMLEntities` -> `['escape', 'HTML', 'Entities']`
			 */
			const parts = word
				.replace(/(\p{Lu}*)(\p{Lu})(\p{Ll}+)/gu, (full, one, two, three) =>
					three === 's' ? full : `${one}-${two}${three}`,
				)
				.replace(/(\p{Ll})(\p{Lu})/gu, '$1-$2')
				.split('-');

			return parts
				.filter(part => part.length > 0)
				.map((part, partIndex) =>
					!capitaliseAny || (partIndex === 0 && index === 0 && !capitaliseFirst)
						? part.toLocaleLowerCase()
						: capitalise(part),
				)
				.join(delimiter);
		})
		.join(delimiter);
}
