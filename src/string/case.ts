import {join, words} from './misc';

/**
 * Convert a string to camel case _(thisIsCamelCase)_
 */
export function camelCase(value: string): string {
	return toCase(value, '', true, false);
}

/**
 * Capitalize the first letter of a string _(and lowercase the rest)_
 */
export function capitalize(value: string): string {
	if (typeof value !== 'string' || value.length === 0) {
		return '';
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
 * Convert a string to title case _(Capitalizing Every Word)_
 */
export function titleCase(value: string): string {
	return typeof value === 'string'
		? value.length < 1
			? capitalize(value)
			: words(value).map(capitalize).join(' ')
		: '';
}

function toCase(
	value: string,
	delimiter: string,
	capitalizeAny: boolean,
	capitalizeFirst: boolean,
): string {
	if (typeof value !== 'string') {
		return '';
	}

	if (value.length < 1) {
		return value;
	}

	const parts = words(value);
	const partsLength = parts.length;

	const result: string[] = [];

	for (let partIndex = 0; partIndex < partsLength; partIndex += 1) {
		const part = parts[partIndex];

		const acronymParts = part.replace(
			acronymExpression,
			(full, one, two, three) =>
				three === 's' ? full : `${one}-${two}${three}`,
		);

		const camelCaseParts = acronymParts.replace(camelCaseExpression, '$1-$2');

		const items = camelCaseParts.split('-');
		const itemsLength = items.length;

		const partResult: string[] = [];

		let itemCount = 0;

		for (let itemIndex = 0; itemIndex < itemsLength; itemIndex += 1) {
			const item = items[itemIndex];

			if (item.length === 0) {
				continue;
			}

			if (
				!capitalizeAny ||
				(itemCount === 0 && partIndex === 0 && !capitalizeFirst)
			) {
				partResult.push(item.toLocaleLowerCase());
			} else {
				partResult.push(capitalize(item));
			}

			itemCount += 1;
		}

		result.push(join(partResult, delimiter));
	}

	return join(result, delimiter);
}

const camelCaseExpression = /(\p{Ll})(\p{Lu})/gu;

const acronymExpression = /(\p{Lu}*)(\p{Lu})(\p{Ll}+)/gu;
