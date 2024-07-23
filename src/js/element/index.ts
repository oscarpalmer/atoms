type TextDirection = 'ltr' | 'rtl';

/**
 * - Get the most specific element under the pointer
 * - Ignores elements with `pointer-events: none` and `visibility: hidden`
 * - If `skipIgnore` is `true`, no elements are ignored
 */
export function getElementUnderPointer(
	skipIgnore?: boolean,
): Element | undefined {
	const elements = Array.from(document.querySelectorAll(':hover')).filter(
		element => {
			if (/^head$/i.test(element.tagName)) {
				return false;
			}

			const style = getComputedStyle(element);

			return (
				skipIgnore === true ||
				(style.pointerEvents !== 'none' && style.visibility !== 'hidden')
			);
		},
	);

	return elements[elements.length - 1];
}

/**
 * Get the text direction of an element
 */
export function getTextDirection(element: Element): TextDirection {
	const direction = element.getAttribute('dir');

	if (direction !== null && /^(ltr|rtl)$/i.test(direction)) {
		return direction.toLowerCase() as TextDirection;
	}

	return (
		getComputedStyle?.(element)?.direction === 'rtl' ? 'rtl' : 'ltr'
	) as TextDirection;
}

export * from './closest';
export * from './data';
export * from './find';
export * from './style';
