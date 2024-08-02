/**
 * List of boolean attributes
 */
export const booleanAttributes = Object.freeze([
	'async',
	'autofocus',
	'autoplay',
	'checked',
	'controls',
	'default',
	'defer',
	'disabled',
	'formnovalidate',
	'hidden',
	'inert',
	'ismap',
	'itemscope',
	'loop',
	'multiple',
	'muted',
	'nomodule',
	'novalidate',
	'open',
	'playsinline',
	'readonly',
	'required',
	'reversed',
	'selected',
]);

const onPrefix = /^on/i;
const sourcePrefix = /^(href|src|xlink:href)$/i;
const valuePrefix = /(data:text\/html|javascript:)/i;

/**
 * Is the attribute considered bad and potentially harmful?
 */
export function isBadAttribute(name: string, value: string): boolean {
	return (
		onPrefix.test(name) || (sourcePrefix.test(name) && valuePrefix.test(value))
	);
}

/**
 * Is the attribute a boolean attribute?
 */
export function isBooleanAttribute(name: string): boolean {
	return booleanAttributes.includes(name.toLowerCase());
}

/**
 * Is the attribute empty and not a boolean attribute?
 */
export function isEmptyNonBooleanAttribute(
	name: string,
	value: string,
): boolean {
	return !booleanAttributes.includes(name) && value.trim().length === 0;
}

/**
 * - Is the attribute an invalid boolean attribute?
 * - I.e., its value is not empty or the same as its name?
 */
export function isInvalidBooleanAttribute(
	name: string,
	value: string,
): boolean {
	if (!booleanAttributes.includes(name)) {
		return true;
	}

	const normalised = value.toLowerCase().trim();

	return !(
		normalised.length === 0 ||
		normalised === name ||
		(name === 'hidden' && normalised === 'until-found')
	);
}

/**
 * - Sets an attribute for an element
 * - If the value is nullable, the attribute is removed
 */
export function setAttribute(
	element: Element,
	name: string,
	value: unknown,
): void {
	if (value == null) {
		element.removeAttribute(name);
	} else {
		element.setAttribute(
			name,
			typeof value === 'string' ? value : JSON.stringify(value),
		);
	}
}
