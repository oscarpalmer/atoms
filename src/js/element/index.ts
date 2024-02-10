type TextDirection = 'ltr' | 'rtl';

const directionPattern = /^(ltr|rtl)$/i;
const headPattern = /^head$/i;

/**
 * - Find the parent element that matches the selector
 * - Matches may be found by a query string or a callback
 */
export function findParentElement(
	origin: Element,
	selector: string | ((element: Element) => boolean),
): Element | undefined {
	if (origin == null || selector == null) {
		return undefined;
	}

	function matches(element: Element): boolean {
		return typeof selector === 'string'
			? element.matches?.(selector) ?? false
			: typeof selector === 'function'
			  ? selector(element)
			  : false;
	}

	if (matches(origin)) {
		return origin;
	}

	let parent: Element | null = origin.parentElement;

	while (parent != null && !matches(parent)) {
		if (parent === document.body) {
			return undefined;
		}

		parent = parent.parentElement;
	}

	return parent ?? undefined;
}

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
			if (headPattern.test(element.tagName)) {
				return false;
			}

			const style = getComputedStyle(element);

			return (
				(typeof skipIgnore === 'boolean' && skipIgnore) ||
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
	const attribute = element.getAttribute('dir');

	if (attribute !== null && directionPattern.test(attribute)) {
		return attribute.toLowerCase() as TextDirection;
	}

	return (
		getComputedStyle?.(element)?.direction === 'rtl' ? 'rtl' : 'ltr'
	) as TextDirection;
}
